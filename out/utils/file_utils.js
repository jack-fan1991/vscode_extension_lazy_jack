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
exports.readFile = exports.createFile = exports.removeFolderPath = exports.getAbsFilePath = exports.getActivityEditorFilePath = exports.getActivityEditorFileName = exports.getWorkspaceFolderPath = void 0;
const path = require("path");
const vscode = require("vscode");
const fs_1 = require("fs");
const icon_1 = require("./icon");
function getWorkspaceFolderPath(currentFilePath) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentFilePath));
    if (workspaceFolder) {
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        return workspaceFolderPath;
    }
}
exports.getWorkspaceFolderPath = getWorkspaceFolderPath;
/// 取得當前焦點編輯器文件名
function getActivityEditorFileName(showFileType = false) {
    let file = path.basename(getActivityEditorFilePath());
    (0, icon_1.logInfo)('total file name: ' + file);
    return showFileType ? file : file.split('.')[0];
}
exports.getActivityEditorFileName = getActivityEditorFileName;
function getActivityEditorFilePath() {
    let editor = vscode.window.activeTextEditor;
    if (!editor)
        throw new Error('No active editor');
    return editor.document.fileName;
}
exports.getActivityEditorFilePath = getActivityEditorFilePath;
function getAbsFilePath(uri) {
    let path = uri.path;
    let split = path.split(':');
    if (split.length > 1) {
        path = split[0].replace('/', '') + ':' + split[1];
    }
    return path;
}
exports.getAbsFilePath = getAbsFilePath;
function removeFolderPath(document) {
    let currentDir = path.dirname(document.fileName);
    return document.fileName.replace(currentDir, '');
}
exports.removeFolderPath = removeFolderPath;
function createFile(targetPath, text) {
    if ((0, fs_1.existsSync)(targetPath)) {
        throw Error(`$targetPath already exists`);
    }
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        (0, fs_1.writeFile)(targetPath, text, "utf8", (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    }));
}
exports.createFile = createFile;
function readFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return vscode.workspace.fs.readFile(vscode.Uri.file(path)).toString();
    });
}
exports.readFile = readFile;
//# sourceMappingURL=file_utils.js.map