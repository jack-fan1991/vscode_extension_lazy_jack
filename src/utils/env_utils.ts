import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function workFolderName(){
 return vscode.workspace.rootPath?.split('/')[vscode.workspace.rootPath.split('/').length-1];
}


export function checkDirInEvn(onFileFind: () => void,onFileNotFind: () => void, ...paths: string[]) {
    let targetPath: string[] = [process.env.HOME ?? ""];
    targetPath = [...targetPath, ...paths];
    let pubCacheGit = path.join(...targetPath);
    if (fs.existsSync(pubCacheGit)) {
        onFileFind()
    } else {
        console.log(`The directory ${pubCacheGit} does not exist.`);
        onFileNotFind()
    }
}

export function removeDirInEvn(onRemoveDone: () => void, ...paths: string[]) {
    let targetPath: string[] = [process.env.HOME ?? ""];
    targetPath = [...targetPath, ...paths];
    let pubCacheGit = path.join(...targetPath);
    let removeDone = !fs.existsSync(pubCacheGit);
    let count = 1;
    let maxCount = 3;
    while (!removeDone && count < maxCount) {
        fs.rmdirSync(pubCacheGit, { recursive: true });
        removeDone = fs.existsSync(pubCacheGit);
        count++
        console.log(`done`);
        onRemoveDone()
    }
    if (count >= maxCount) {
        vscode.window.showErrorMessage(`${path} 刪除失敗`, `再試一次`,'取消').then((options) => {
            if (options === "再試一次") {
                removeDirInEvn(onRemoveDone, ...paths)
            }

        })

    }
    console.log(`done`);


}

