import path = require('path');
import * as vscode from 'vscode';

export function getWorkspaceFolderPath(currentFilePath: string) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentFilePath));
    if (workspaceFolder) {
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        return workspaceFolderPath
    }
}

export function getAbsFilePath(uri:vscode.Uri):string{
    let path =uri.path
    let split =path.split(':')
    if(split.length>1){
        path= split[0].replace('/','')+':'+split[1]
    }
    return path
}

// export function getAbsPath(currentFilePath: string,relativePath:string) {
//     const workspaceFolderPath =getWorkspaceFolderPath(currentFilePath);
//     const absolutePath = path.join(workspaceFolderPath??, relativePath);
//     return absolutePath
// }