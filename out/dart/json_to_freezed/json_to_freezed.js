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
exports.getFiledToFreezedFormat = exports.freezedGenerator = exports.registerJsonToFreezed = exports.command_dart_json_to_freezed = void 0;
const vscode = require("vscode");
const regex_utils_1 = require("../../utils/regex_utils");
const terminal_utils_1 = require("../../utils/terminal_utils");
const workout_space_utils_1 = require("../../utils/workout_space_utils");
const file_utils_1 = require("../../utils/file_utils");
const json_utils_1 = require("../../utils/json_utils");
const json_object_helper_1 = require("./json_object_helper");
const icon_1 = require("../../utils/icon");
exports.command_dart_json_to_freezed = "command_dart_json_to_freezed";
const firstImport = `import 'package:freezed_annotation/freezed_annotation.dart';`;
let jsonObjectManger = new json_object_helper_1.JsonObjectManger();
function registerJsonToFreezed(context) {
    context.subscriptions.push(vscode.commands.registerCommand(exports.command_dart_json_to_freezed, () => __awaiter(this, void 0, void 0, function* () {
        yield freezedGenerator();
        (0, terminal_utils_1.runTerminal)('flutter pub run build_runner build --delete-conflicting-outputs', "build_runner");
    })));
}
exports.registerJsonToFreezed = registerJsonToFreezed;
function freezedGenerator() {
    return __awaiter(this, void 0, void 0, function* () {
        jsonObjectManger = new json_object_helper_1.JsonObjectManger();
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let selectedText = (0, workout_space_utils_1.getSelectedText)();
        /// 用來當作response的class名稱
        const baseFileName = (0, file_utils_1.getActivityEditorFileName)();
        const fileNameGPart = `part '${baseFileName}.g.dart';`;
        const fileNameFPart = `part '${baseFileName}.freezed.dart';`;
        let importLine = [firstImport, fileNameGPart, fileNameFPart,];
        let jsonObject = (0, json_utils_1.tryParseJson)(selectedText);
        let className = (0, regex_utils_1.toUpperCamelCase)(baseFileName);
        // 回傳最接近的[type,type,type]
        // type = string | number | boolean | object | array
        // 因為是第一層所以如果 object 則用 baseFileName 當作 class 名稱
        // 如果是 array 則需要知道是什麼類型的array parse 應該要回傳 [array 的 type]
        yield parse(jsonObject, className);
        let finalResult = importLine.join('\n') + '\n\n' + jsonObjectManger.toFreezedTemplate(className);
        console.log(`===================`);
        console.log(`result: ${finalResult}`);
        // generateClassTemplate(jsonObject, className);
        // generateResponseData(className, jsonObject);
        let e = new vscode.WorkspaceEdit();
        e.replace(editor.document.uri, editor.selection, finalResult);
        vscode.workspace.applyEdit(e);
    });
}
exports.freezedGenerator = freezedGenerator;
function parse(jsonObject, parentKey = "", objInArray = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let baseFileName = (0, file_utils_1.getActivityEditorFileName)();
        baseFileName = (0, regex_utils_1.toUpperCamelCase)(baseFileName);
        try {
            if (Array.isArray(jsonObject)) {
                // if (parentKey === baseFileName) {
                //     // no key Array
                //     parentKey = await vscode.window.showInputBox({ placeHolder: 'Please input class name', value: baseFileName + "Data" }).then((className) => {
                //         let listType = ""
                //         if (className) {
                //             listType = className;
                //         } else {
                //             listType = baseFileName + "Data";
                //         }
                //         let customTypeManger: CustomTypeManger = jsonObjectManger.getCustomTypeManger(parentKey) ?? new CustomTypeManger();
                //         let customType: CustomType = arrayPramsFmt(jsonObject, parentKey, listType)
                //         console.log(`freezedFieldFormat: ${customType.toFreezedFieldFormat()}`)
                //         customTypeManger.addCustomType(customType)
                //         jsonObjectManger.setCustomTypeManger(parentKey, customTypeManger)
                //         jsonObjectManger.printCache()
                //         return listType
                //     })
                // }
                // else {
                //     let customTypeManger: CustomTypeManger = jsonObjectManger.getCustomTypeManger(parentKey) ?? new CustomTypeManger();
                //     let customType: CustomType = arrayPramsFmt(jsonObject, parentKey, parentKey)
                //     console.log(`freezedFieldFormat: ${customType.toFreezedFieldFormat()}`)
                //     customTypeManger.addCustomType(customType)
                //     jsonObjectManger.setCustomTypeManger(parentKey, customTypeManger)
                //     jsonObjectManger.printCache()
                // }
                let arrayObjType = yield parseArray(jsonObject, parentKey);
                if (parentKey === baseFileName) {
                    // no key Array
                    let wrapperClassName = baseFileName + "Wrapper";
                    wrapperClassName = yield vscode.window.showInputBox({ placeHolder: `${icon_1.Icon_Warning} Input class name for No key array`, value: wrapperClassName }).then((className) => {
                        let listType = "";
                        if (className) {
                            return className;
                        }
                        else {
                            return wrapperClassName;
                        }
                    });
                    let wrapper = new json_object_helper_1.CustomType(arrayObjType, arrayObjType, true);
                    console.log(`Add wrapper ${wrapper.toFreezedFieldFormat()}`);
                    jsonObjectManger.classWrapper.set(wrapperClassName, wrapper);
                }
                return arrayObjType;
            }
            else if (typeof jsonObject === 'object' && jsonObject !== null) {
                return yield parseObjectToFreezedFormat(jsonObject, parentKey);
            }
            else {
                return typeof jsonObject;
            }
        }
        catch (e) {
            (0, icon_1.logError)(e);
            return "";
        }
    });
}
function parseObjectToFreezedFormat(obj, parentKey = '') {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        for (const key in obj) {
            // console.log(`key: ${key}`)
            if (obj.hasOwnProperty(key)) {
                let child = obj[key];
                let childType = typeof child;
                if (childType === 'object' && child !== null) {
                    let customTypeManger = (_a = jsonObjectManger.getCustomTypeManger(parentKey)) !== null && _a !== void 0 ? _a : new json_object_helper_1.CustomTypeManger();
                    let customType;
                    if (Array.isArray(child)) {
                        customType = arrayPramsFmt(child, key, key);
                    }
                    else {
                        customType = getFiledToFreezedFormat(child, key, key);
                    }
                    // console.log(`freezedFieldFormat: ${customType.toFreezedFieldFormat()}`)
                    customTypeManger.addCustomType(customType);
                    jsonObjectManger.setCustomTypeManger(parentKey, customTypeManger);
                    jsonObjectManger.printCache();
                    yield parse(child, key);
                    // console.log(`freezedFieldFormat: ${freezedFieldFormat}`)
                    // console.log(`freezedField: ${freezedFields}`)
                    // let template = freezedClassTemplate(key, freezedFieldFormat)
                    // classCollection.push(template)
                }
                else {
                    // 單純的
                    let customTypeManger = (_b = jsonObjectManger.getCustomTypeManger(parentKey)) !== null && _b !== void 0 ? _b : new json_object_helper_1.CustomTypeManger();
                    let customType = getFiledToFreezedFormat(child, key);
                    // console.log(`freezedFieldFormat: ${customType.toFreezedFieldFormat()}`)
                    customTypeManger.addCustomType(customType);
                    jsonObjectManger.setCustomTypeManger(parentKey, customTypeManger);
                    jsonObjectManger.printCache();
                }
            }
        }
        return parentKey;
    });
}
// 解析 JSON 陣列的類型，回傳包含每個元素的類型的字串陣列
function parseArray(arr, parentKey = "") {
    return __awaiter(this, void 0, void 0, function* () {
        let type = [];
        for (const item of arr) {
            let t = yield parse(item, parentKey, true);
            type.push(t);
        }
        return type[0];
    });
}
function getFiledToFreezedFormat(jsonObj, fieldName, customClass = '') {
    const tsType = typeof jsonObj;
    if (customClass !== '') {
        return new json_object_helper_1.CustomType(customClass, fieldName);
    }
    if (jsonObj === null) {
        return new json_object_helper_1.CustomType('dynamic', fieldName);
    }
    switch (tsType) {
        case 'string':
            return new json_object_helper_1.CustomType('String', fieldName);
        case 'number':
            if (Number.isInteger(jsonObj)) {
                return new json_object_helper_1.CustomType('int', fieldName);
            }
            else {
                return new json_object_helper_1.CustomType('double', fieldName);
            }
        case 'boolean':
            return new json_object_helper_1.CustomType('bool', fieldName);
        default:
            throw new Error(`Unknow type: ${tsType}`);
    }
}
exports.getFiledToFreezedFormat = getFiledToFreezedFormat;
function arrayPramsFmt(jsonObject, parentName, customType = '') {
    let hasCustomName = customType !== '';
    let keys = Object.keys(jsonObject);
    let typeString = 'dynamic';
    let firstChild = jsonObject[keys[0]];
    let type = typeof firstChild;
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
            if (customType !== '') {
                typeString = customType;
            }
            break;
    }
    return new json_object_helper_1.CustomType(typeString, parentName, true);
}
//# sourceMappingURL=json_to_freezed.js.map