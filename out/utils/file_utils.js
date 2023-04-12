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
exports.createFile = exports.getAbsFilePath = exports.getWorkspaceFolderPath = void 0;
const vscode = require("vscode");
const fs_1 = require("fs");
function getWorkspaceFolderPath(currentFilePath) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentFilePath));
    if (workspaceFolder) {
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        return workspaceFolderPath;
    }
}
exports.getWorkspaceFolderPath = getWorkspaceFolderPath;
function getAbsFilePath(uri) {
    let path = uri.path;
    let split = path.split(':');
    if (split.length > 1) {
        path = split[0].replace('/', '') + ':' + split[1];
    }
    return path;
}
exports.getAbsFilePath = getAbsFilePath;
// export function getAbsPath(currentFilePath: string,relativePath:string) {
//     const workspaceFolderPath =getWorkspaceFolderPath(currentFilePath);
//     const absolutePath = path.join(workspaceFolderPath??, relativePath);
//     return absolutePath
// }
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
//# sourceMappingURL=file_utils.js.map