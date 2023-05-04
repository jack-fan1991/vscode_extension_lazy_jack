import path = require('path');
import * as vscode from 'vscode';
import { existsSync, lstatSync, writeFile } from "fs";
import { logError, logInfo } from './icon';
import * as fs from 'fs';
import { reFormat } from './vscode_utils';
import { nameCheckerRegex } from './regex_utils';

export function getWorkspaceFolderPath(currentFilePath: string) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(currentFilePath));
    if (workspaceFolder) {
        const workspaceFolderPath = workspaceFolder.uri.fsPath;
        return workspaceFolderPath
    }
}
/// 取得當前焦點編輯器文件名
export function getActivityEditorFileName(showFileType: boolean = false): string {
    let file = path.basename(getActivityEditorFilePath())
    logInfo('total file name: ' + file)
    return showFileType ? file : file.split('.')[0]
}

export function getActivityEditorFilePath(): string {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    return editor.document.fileName
}


export function getAbsFilePath(uri: vscode.Uri): string {
    let path = uri.path
    let split = path.split(':')
    if (split.length > 1) {
        path = split[0].replace('/', '') + ':' + split[1]
    }
    return path
}

export function removeFolderPath(document: vscode.TextDocument) {
    let currentDir = path.dirname(document.fileName);
    return document.fileName.replace(currentDir, '')
}



export function createFile(
    targetPath: string,
    text: string,
) {
    if (existsSync(targetPath)) {
        throw Error(`$targetPath already exists`);
    }
    return new Promise<void>(async (resolve, reject) => {
        writeFile(
            targetPath,
            text,
            "utf8",
            (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            }
        );
    });
}


export function readFileToText(path: string) {
    if (!existsSync(path)) {
        throw Error(`readFileToText failed ${path} not exists`);
    }
    return fs.readFileSync(path, 'utf8')
}



export async function replaceText(filePath: string, searchValue: string, replaceValue: string): Promise<boolean> {
    // find yaml editor
    let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === filePath)
    if (!editor) {
        await vscode.workspace.openTextDocument(filePath).then(async (document) =>
            editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false).then(editor => editor))
    }
    if (!editor) {
        return false
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
        await editor.edit((editBuilder) => {
            editBuilder.replace(range, replaceValue);
        });

        editor.document.save()
        return true
    }
    else {
        logError(`replaceText filePath 中找不到${searchValue}`, true)
        return false

    }
}



export function replaceSelectionText(range: vscode.Range|undefined, replaceWith: (selectText: string) => string) {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        logError(`[No active editor]=> replaceSelectionText`, true)
        return
    }
    const selection = range?? editor.selection;
    const text = editor.document.getText(selection);
    editor.edit(editBuilder => {
        let replaceText = replaceWith(text)
        editBuilder.replace(selection, replaceText)
    })
    reFormat()
}

export function getCursorLineText() {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        logError(`[No active editor]=> getCursorLineText`, true)
        return
    }
    const position = editor.selection.active;
    return editor.document.lineAt(position.line).text
}

export function getCursorWordRange(): vscode.Range | undefined {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        logError(`[No active editor]=> getCursorWordText`, true)
        return
    }
    const position = editor.selection.active;
    const wordRange = getWordRangeAtPosition(editor.document, position)
    if (wordRange) {
        let word = editor.document.getText(wordRange);
        if (word.match(nameCheckerRegex)) {
            return wordRange
        }
        return undefined
    }
    return undefined
}


function getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
    const line = document.lineAt(position.line).text;
    let left = position.character - 1
    let right = position.character + 1
    let tryCount = 0
    while (true) {
        left--
        let leftRange = new vscode.Range(position.line, left, position.line, position.character);
        let text = document.getText(leftRange)
        logInfo('text: ' + text, false)
        if (text.match(nameCheckerRegex) === null) {
            left++
            break
        }
        let preRange = new vscode.Range(position.line, left == 0 ? 0 : left + 1, position.line, position.character);
        if (text === document.getText(preRange)) {
            break
        }

    }
    tryCount = 0
    while (true) {
        right++
        let rightRange = new vscode.Range(position.line, left, position.line, right);
        let text = document.getText(rightRange)
        logInfo('text: ' + text, false)
        if (text.match(nameCheckerRegex) === null) {
            right--
            break
        }
        let preRange = new vscode.Range(position.line, left, position.line, right + 1);
        if (text === document.getText(preRange)) {
            tryCount++
        }
        if (tryCount == 3) {
            break
        }
    }
    return new vscode.Range(position.line, left, position.line, right);
}


