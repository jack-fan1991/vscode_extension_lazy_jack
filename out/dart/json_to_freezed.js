"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freezedGenerator = exports.registerJsonToFreezed = void 0;
const vscode = require("vscode");
const regex_utils_1 = require("../utils/regex_utils");
const terminal_utils_1 = require("../utils/terminal_utils");
const changeCase = require("change-case");
const command_dart_json_to_freezed = "command_dart_json_to_freezed";
let s;
let setter;
let arr = [];
const lowCamelPattern = /^[a-z]+([A-Z][a-z]+)*$/;
function registerJsonToFreezed(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_json_to_freezed, () => __awaiter(this, void 0, void 0, function* () {
        yield freezedGenerator();
        (0, terminal_utils_1.runTerminal)('flutter pub run build_runner build --delete-conflicting-outputs', "build_runner");
    })));
}
exports.registerJsonToFreezed = registerJsonToFreezed;
const firstImport = `import 'package:freezed_annotation/freezed_annotation.dart';`;
let result;
function freezedGenerator() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        let selectedText = editor.document.getText(selection);
        const document = editor.document;
        const fileName = (_a = document.fileName) === null || _a === void 0 ? void 0 : _a.split("/").pop().split(".")[0];
        const fileNameGPart = `part '${fileName}.g.dart';`;
        const fileNameFPart = `part '${fileName}.freezed.dart';`;
        result = [];
        let e = new vscode.WorkspaceEdit();
        // add import
        let jsonObject;
        let className = (0, regex_utils_1.toUpperCamelCase)(fileName);
        let specialCase = false;
        try {
            jsonObject = JSON.parse(selectedText);
            // 最外層沒有key 的情況
            if (jsonObject.length > 1) {
                jsonObject = JSON.parse(`{"${className}":${selectedText}}`);
                specialCase = true;
            }
        }
        catch (e) {
            vscode.window.showErrorMessage(`Json 格式錯誤 ${e}`);
            throw e;
        }
        generateClassTemplate(jsonObject, className, specialCase);
        // generateResponseData(className, jsonObject);
        let importResult = [firstImport, fileNameGPart, fileNameFPart,];
        e.replace(editor.document.uri, editor.selection, importResult.join('\n') + '\n\n' + result.reverse().join('\n\n'));
        vscode.workspace.applyEdit(e);
    });
}
exports.freezedGenerator = freezedGenerator;
function generateClassTemplate2(jsonObject, parentKey = '', specialCase = false, filed = []) {
    for (let key in jsonObject) {
        if (jsonObject.hasOwnProperty(key)) {
            let subObj = jsonObject[key];
            let childType = typeof subObj;
            let isArray = Array.isArray(subObj);
            let typeString = 'dynamic';
            // if array 
            if (isArray) {
                filed.push(generateClassTemplate2(subObj, key));
            }
            else {
                switch (childType) {
                    case 'string':
                        typeString = 'String';
                        filed.push(pramsFmt(typeString, key));
                        continue;
                    case 'number':
                        if (Number.isInteger(subObj)) {
                            typeString = 'int';
                        }
                        else {
                            typeString = 'double';
                        }
                        filed.push(pramsFmt(typeString, key));
                        continue;
                    case 'boolean':
                        typeString = 'bool';
                        filed.push(pramsFmt(typeString, key));
                        continue;
                }
            }
        }
    }
    return '';
}
function generateClassTemplate(jsonObject, parentKey = '', specialCase = false) {
    let prams = [];
    let isRequiredConstructor = true;
    let keys = Object.keys(jsonObject);
    let isArray = Array.isArray(jsonObject);
    try {
        if (isArray) {
            return arrayPramsFmt(jsonObject, parentKey);
        }
        else {
            for (let key of keys) {
                let child = jsonObject[key];
                let childType = typeof child;
                let typeString = 'dynamic';
                let newParam;
                switch (childType) {
                    case 'string':
                        typeString = 'String';
                        newParam = pramsFmt(typeString, key);
                        prams.push(newParam);
                        break;
                    case 'number':
                        if (Number.isInteger(child)) {
                            typeString = 'int';
                        }
                        else {
                            typeString = 'double';
                        }
                        newParam = pramsFmt(typeString, key);
                        prams.push(newParam);
                        break;
                    case 'boolean':
                        typeString = 'bool';
                        newParam = pramsFmt(typeString, key);
                        prams.push(newParam);
                        break;
                    case 'object':
                        if (child == null) {
                            newParam = pramsFmt(typeString, key);
                            prams.push(newParam);
                            break;
                        }
                        else if (Array.isArray(child)) {
                            typeString = generateClassTemplate(child, specialCase ? `${key}Data` : key);
                            prams.push(typeString);
                        }
                        else {
                            // Object 拿Key當參數
                            generateClassTemplate(child, key);
                            typeString = pramsFmt((0, regex_utils_1.toUpperCamelCase)(key), key);
                            prams.push(typeString);
                            break;
                        }
                }
            }
            result.push(generateClass((0, regex_utils_1.toUpperCamelCase)(parentKey), prams));
            console.log(``);
        }
    }
    catch (e) {
        console.log(e);
        vscode.window.showErrorMessage(`${e}`);
    }
}
function pramsFmt(type, paramName) {
    if (!lowCamelPattern.test(paramName)) {
        return `\t\t@JsonKey(name: '${paramName}')\tfinal ${type}? ${changeCase.camelCase(paramName)}`;
        return `// ignore: invalid_annotation_target\n\t\t@JsonKey(name: '${paramName}') final ${type}? ${(0, regex_utils_1.toUpperCamelCase)(paramName)}`;
    }
    return `final ${type}? ${paramName}`;
}
function arrayPramsFmt(jsonObject, parentName) {
    let keys = Object.keys(jsonObject);
    let firstChild = jsonObject[keys[0]];
    let type = typeof firstChild;
    let typeString = 'dynamic';
    switch (type) {
        case 'string':
            typeString = 'String';
            break;
        case 'number':
            if (Number.isInteger(firstChild)) {
                typeString = 'int';
            }
            else {
                typeString = 'double';
            }
            break;
        case 'boolean':
            typeString = 'bool';
            break;
        case 'object':
            break;
    }
    for (let key of keys) {
        let child = jsonObject[key];
        if (typeof child === 'object') {
            generateClassTemplate(child, parentName);
            return `@Default ([]) final List<${(0, regex_utils_1.toUpperCamelCase)(parentName)}> ${parentName}`;
        }
        if (typeof child != type) {
            typeString = 'dynamic';
            break;
        }
    }
    return `@Default([]) final List<${typeString}> ${parentName}`;
}
function isStringEndsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
function generateClass(className, params) {
    className = (0, regex_utils_1.toUpperCamelCase)(className);
    let fromJsonMethod = `factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`;
    let toJsonMethod = `Map<String, dynamic> toJson() => _$${className}ToJson(this);`;
    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${params.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`;
    console.log(`${clz}`);
    if (isStringEndsWith(className, 's')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz;
}
//# sourceMappingURL=json_to_freezed.js.map