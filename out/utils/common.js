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
exports.onTypeScript = exports.onGit = exports.onFlutter = exports.showInfo2OptionMessage = void 0;
const vscode = require("vscode");
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
function onFlutter(getData, errorData) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield vscode.workspace.findFiles('**/pubspec.yaml');
        if (files.length <= 0) {
            console.log('當前不是flutter 專案');
            return errorData();
        }
        return getData();
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
//# sourceMappingURL=common.js.map