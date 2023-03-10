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
exports.registerCommandDartSelectedToFactory = void 0;
const vscode = require("vscode");
const regex_utils_1 = require("../utils/regex_utils");
const command_dart_selected_to_factory = "command_dart_selected_to_factory";
function registerCommandDartSelectedToFactory(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_selected_to_factory, () => __awaiter(this, void 0, void 0, function* () {
        generator();
    })));
}
exports.registerCommandDartSelectedToFactory = registerCommandDartSelectedToFactory;
function generator() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selection = editor.selection;
        let text = editor.document.getText(selection);
        if (text.length < 1) {
            vscode.window.showErrorMessage('No selected properties.');
            return;
        }
        let match = text.match(regex_utils_1.findClassRegex);
        if (match == null) {
            vscode.window.showErrorMessage("No class name in selected text");
            return;
        }
        let className = match[1];
        let properties = text.split(/\r?\n/).filter(x => !x.includes("class") && !x.includes("{") && !x.includes("}") && !x.includes(",")).filter(x => x.length > 2).map(x => x.replace(';', ''));
        let isNameConstructor = text.split(/\r?\n/).filter(x => x.includes("(") && x.includes(")") && x.includes("{") && x.includes("}") && x.includes(`${className}`)).length > 0;
        let factoryParams = [];
        let factoryRequiredParams = [];
        let classParams = [];
        let classRequiredParams = [];
        let extendsClassMatch = text.match(regex_utils_1.findSuperClassRegex);
        let extendsClass = extendsClassMatch == null ? "" : extendsClassMatch[1];
        let isWidget = extendsClass.includes('StatefulWidget') || extendsClass.includes('StatelessWidget');
        if (isWidget) {
            factoryRequiredParams.push("Key? key");
            classRequiredParams.push("key:key");
        }
        let targetString = '';
        for (let p of properties) {
            targetString = p;
            console.log(p);
            if (p.includes('=')) {
                continue;
            }
            let parseResult = generateParam(p, isNameConstructor);
            console.log(parseResult);
            if (parseResult.length == 0)
                continue;
            if (parseResult[0].includes('required')) {
                factoryRequiredParams.push(parseResult[0]);
                classRequiredParams.push(parseResult[1]);
            }
            else {
                factoryParams.push(parseResult[0]);
                classParams.push(parseResult[1]);
            }
        }
        let hasConstructor = text.split(/\r?\n/).filter(x => x.includes("(") && x.includes(")")).length > 0;
        let superParam = [];
        if (hasConstructor) {
            targetString = text.split(/\r?\n/).filter(x => x.includes(className) && x.includes("(") && x.includes(")"))[0];
            superParam = targetString.match(/\b\w+\b(?=,|\s*})/g);
        }
        let r = yield createFactory(className, [...factoryRequiredParams, ...factoryParams], [...classRequiredParams, ...classParams]);
        console.log(r);
        if (hasConstructor) {
            targetString = text.split(/\r?\n/).filter(x => x.includes(className) && x.includes("(") && x.includes(")"))[0];
        }
        let startIndex = text.indexOf(targetString);
        let insertPosition = new vscode.Position(editor.document.positionAt(startIndex).line + 1, 0);
        editor.edit(edit => editor.selections.forEach(selection => {
            edit.insert(insertPosition, r);
        }));
    });
}
function createFactory(className, factoryParams, classParams) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let name = (_a = yield vscode.window.showInputBox({
            prompt: 'Enter factory name'
        }).then(name => name)) !== null && _a !== void 0 ? _a : "init";
        return `\n\n\tfactory ${className}.${name}({
\t\t${factoryParams.join(',\n\t\t')},
 }) =>\t\t\t
    ${className}(\n\t\t\t\t${classParams.join(',\n\t\t\t\t')},\n\t\t\t);\n`;
    });
}
function splitField(fieldString) {
    let split = [];
    let list = fieldString.replace('final', '').split(" ").filter((x) => x != '');
    let index = 0;
    for (let s of list) {
        index = list.indexOf(s);
        let functionPram = '';
        if (s.includes('(')) {
            let previous = list[list.indexOf(s) - 1];
            split = split.filter((x) => x != previous);
        }
        else if (s.includes(')')) {
            let returnType = list[list.indexOf(s) - 2];
            let previous = list[list.indexOf(s) - 1];
            if (returnType == undefined) {
                split.push(`${previous} ${s}`);
            }
            else {
                split.push(`${returnType} ${previous} ${s}`);
            }
        }
        else {
            split.push(s);
            index++;
        }
    }
    return split;
}
function generateParam(prop, isNameConstructor) {
    let result = [];
    let isFinal = false;
    let start = 0;
    let type = "";
    let fieldName = "";
    for (let s of prop) {
        if (s != " ") {
            start = prop.indexOf(s);
            break;
        }
    }
    prop = prop.slice(start);
    if (prop.includes('(') || prop.includes(')') || prop.includes('{') || prop.includes('}'))
        return [];
    let fieldStringArray = splitField(prop);
    isFinal = fieldStringArray.filter((x) => x.includes('final')).length > 0;
    if (isFinal) {
        type = fieldStringArray[1];
        fieldName = fieldStringArray[2];
    }
    else {
        type = fieldStringArray[0];
        fieldName = fieldStringArray[1];
    }
    if (type.includes('?')) {
        result.push(`${type} ${fieldName}`);
    }
    else {
        result.push(`required ${type} ${fieldName}`);
    }
    if (isNameConstructor) {
        result.push(`${fieldName}:${fieldName}`);
    }
    else {
        result.push(`${fieldName}`);
    }
    return result;
}
//# sourceMappingURL=selected_to_factory.js.map