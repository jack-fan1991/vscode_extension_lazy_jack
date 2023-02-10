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
exports.replaceTextInFile = exports.onTypeScript = exports.onGit = exports.onFlutter = exports.showInfo2OptionMessage = void 0;
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
function onFlutter(getData, errorData, needData = false) {
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
        if (needData) {
            if (fs.existsSync(absPath)) {
                vscode.window.showInformationMessage(`正在解析 ${absPath}`, '關閉');
                const fileContents = fs.readFileSync(absPath, 'utf-8');
                data = yaml.parse(fileContents);
            }
            else {
                console.error(`The file ${absPath} does not exist.`);
            }
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
function onTypeScript(getData, errorData) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode.workspace.findFiles('**/package.json', '**/ios/**');
        if (files.length <= 0) {
            console.log('當前不是TypeScript 專案');
            return errorData();
        }
        return getData();
    });
}
exports.onTypeScript = onTypeScript;
function replaceTextInFile(filePath, searchValue, replaceValue) {
    return __awaiter(this, void 0, void 0, function* () {
        let text = fs.readFileSync(filePath, 'utf-8');
        const lines = text.split(/\r?\n/);
        let found = false;
        let newLines = [];
        for (let line of lines) {
            if (line.trim().startsWith(searchValue)) {
                newLines.push(replaceValue);
                found = true;
            }
            else {
                newLines.push(line);
            }
        }
        if (found) {
            text = newLines.join('\n');
            fs.writeFileSync(filePath, text, 'utf-8');
        }
    });
}
exports.replaceTextInFile = replaceTextInFile;
//# sourceMappingURL=common.js.map