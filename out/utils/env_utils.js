"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDirInEvn = exports.checkDirInEvn = exports.workFolderName = void 0;
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
function workFolderName() {
    var _a;
    return (_a = vscode.workspace.rootPath) === null || _a === void 0 ? void 0 : _a.split('/')[vscode.workspace.rootPath.split('/').length - 1];
}
exports.workFolderName = workFolderName;
function checkDirInEvn(onFileFind, onFileNotFind, ...paths) {
    var _a;
    let targetPath = [(_a = process.env.HOME) !== null && _a !== void 0 ? _a : ""];
    targetPath = [...targetPath, ...paths];
    let pubCacheGit = path.join(...targetPath);
    if (fs.existsSync(pubCacheGit)) {
        onFileFind();
    }
    else {
        console.log(`The directory ${pubCacheGit} does not exist.`);
        onFileNotFind();
    }
}
exports.checkDirInEvn = checkDirInEvn;
function removeDirInEvn(onRemoveDone, ...paths) {
    var _a;
    let targetPath = [(_a = process.env.HOME) !== null && _a !== void 0 ? _a : ""];
    targetPath = [...targetPath, ...paths];
    let pubCacheGit = path.join(...targetPath);
    let removeDone = !fs.existsSync(pubCacheGit);
    let count = 1;
    let maxCount = 3;
    while (!removeDone && count < maxCount) {
        fs.rmdirSync(pubCacheGit, { recursive: true });
        removeDone = fs.existsSync(pubCacheGit);
        count++;
        console.log(`done`);
        onRemoveDone();
    }
    if (count >= maxCount) {
        vscode.window.showErrorMessage(`${path} 刪除失敗`, `再試一次`, '取消').then((options) => {
            if (options === "再試一次") {
                removeDirInEvn(onRemoveDone, ...paths);
            }
        });
    }
    console.log(`done`);
}
exports.removeDirInEvn = removeDirInEvn;
//# sourceMappingURL=env_utils.js.map