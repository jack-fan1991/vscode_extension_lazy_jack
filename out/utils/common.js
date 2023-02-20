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
exports.replaceText = exports.openEditor = exports.showPicker = exports.onTypeScript = exports.onGit = exports.onFlutter = exports.showInfo2OptionMessage = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
function showInfo2OptionMessage(msg, option1, option2, onOption1) {
    vscode.window.showInformationMessage(msg, option1 !== null && option1 !== void 0 ? option1 : '執行', option2 !== null && option2 !== void 0 ? option2 : '取消').then((selectedOption) => {
        if (onOption1 == null)
            return;
        if (selectedOption === '執行') {
            onOption1();
        }
        else if (selectedOption === '取消') {
            // 取消相應的操作
        }
    });
}
exports.showInfo2OptionMessage = showInfo2OptionMessage;
function onFlutter(getData, errorData, returnData = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.workspace.rootPath == undefined) {
            return;
        }
        let absPath = path.join(vscode.workspace.rootPath, 'pubspec.yaml');
        let filePath = '**/pubspec.yaml';
        let data;
        const files = yield vscode.workspace.findFiles(filePath);
        if (files.length <= 0) {
            console.log('當前不是flutter 專案');
            return errorData();
        }
        if (returnData) {
            data = yield readFile(absPath);
        }
        return getData(data);
    });
}
exports.onFlutter = onFlutter;
function onGit(getData, errorData) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode.workspace.findFiles('**/.gitignore', '**/android/**', 1);
        if (files.length <= 0) {
            console.log('當前不是 git 專案');
            return errorData();
        }
        return getData();
    });
}
exports.onGit = onGit;
function readFile(absPath) {
    if (fs.existsSync(absPath)) {
        vscode.window.showInformationMessage(`正在解析 ${absPath}`, '關閉');
        const fileContents = fs.readFileSync(absPath, 'utf-8');
        return yaml.parse(fileContents);
    }
    else {
        console.error(`The file ${absPath} does not exist.`);
    }
}
function onTypeScript(getData, errorData, returnData = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (vscode.workspace.rootPath == undefined) {
            return;
        }
        let absPath = path.join(vscode.workspace.rootPath, 'package.json');
        let filePath = '**/package.json';
        let data;
        const files = yield vscode.workspace.findFiles(filePath);
        if (files.length <= 0) {
            console.log('當前不是TypeScript 專案');
            return errorData();
        }
        if (returnData) {
            data = yield readFile(absPath);
        }
        return getData(data);
    });
}
exports.onTypeScript = onTypeScript;
function showPicker(placeholder, items, onItemSelect) {
    let quickPick = vscode.window.createQuickPick();
    quickPick.placeholder = placeholder;
    quickPick.items = items;
    quickPick.onDidAccept(() => onItemSelect(quickPick.selectedItems[0]));
    quickPick.show();
}
exports.showPicker = showPicker;
function openEditor(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(filePath))
            return;
        let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === filePath);
        if (!editor) {
            yield vscode.workspace.openTextDocument(filePath).then((document) => __awaiter(this, void 0, void 0, function* () { return editor = yield vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false).then(editor => editor); }));
        }
        return editor;
    });
}
exports.openEditor = openEditor;
function replaceText(filePath, searchValue, replaceValue) {
    return __awaiter(this, void 0, void 0, function* () {
        // find yaml editor
        let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === filePath);
        if (!editor) {
            yield vscode.workspace.openTextDocument(filePath).then((document) => __awaiter(this, void 0, void 0, function* () { return editor = yield vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false).then(editor => editor); }));
        }
        if (!editor) {
            return false;
        }
        // 修改yaml 中的 version
        const document = editor.document;
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
        const textRange = new vscode.Range(start, end);
        const text = document.getText();
        const startIndex = text.indexOf(searchValue);
        if (startIndex !== -1) {
            const endIndex = startIndex + searchValue.length;
            const range = new vscode.Range(document.positionAt(startIndex), document.positionAt(endIndex));
            yield editor.edit((editBuilder) => {
                editBuilder.replace(range, replaceValue);
            });
            editor.document.save();
            return true;
        }
        else {
            vscode.window.showErrorMessage(`filePath 中找不到${replaceValue}`);
            return false;
        }
    });
}
exports.replaceText = replaceText;
//# sourceMappingURL=common.js.map