import path = require('path');
import * as vscode from 'vscode';
import { existsSync, lstatSync, writeFile } from "fs";
import { logError, logInfo } from './icon';
import * as fs from 'fs';
import { reFormat } from './vscode_utils';
import { nameCheckerRegex, toSnakeCase } from './regex_utils';
import { openEditor } from './common';
import { DartPartFixer } from '../code_action/dart/dart_part_fixer';

export function getWorkspaceFolderPath(): string | undefined {
    let path = getActivityEditorFilePath()
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(path));
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

export function getActivityEditor(): vscode.TextEditor {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    return editor
}

export function getActivityEditorFolder(): string {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    return getFolderPath(editor.document)
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

export function getFolderPath(document: vscode.TextDocument): string {
    return path.dirname(document.fileName);
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



export function replaceSelectionText(range: vscode.Range | undefined, replaceWith: (selectText: string) => string) {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        logError(`[No active editor]=> replaceSelectionText`, false)
        return
    }
    const selection = range ?? editor.selection;
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
        logError(`[No active editor]=> getCursorLineText`, false)
        return
    }
    const position = editor.selection.active;
    return editor.document.lineAt(position.line).text
}

export function getCursorWordRange(): vscode.Range | undefined {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        logError(`[No active editor]=> getCursorWordText`, false)
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
        // logInfo('text: ' + text, false)
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
        // logInfo('text: ' + text, false)
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



export async function createFileInPicker(editor: vscode.TextEditor, uriPath: string | undefined, fileName: string | undefined, range: vscode.Range) {
    let uriString = uriPath ?? ""
    let document = editor.document
    let data =document.getText(range)
    let defaultUri;
    if (uriPath != null) {
        defaultUri = vscode.Uri.file(uriPath)
    }
    else if (uriPath == null && fileName == null) {
        defaultUri = vscode.window.activeTextEditor?.document.uri
    } else if (fileName != null) {
        let folder = getFolderPath(vscode.window.activeTextEditor!.document)
        let file: string = fileNameFormat(fileName ?? "temp")
        file += `.${getFileType()}`
        defaultUri = vscode.Uri.file(path.join(folder, file))
    }
    let options: vscode.SaveDialogOptions = {
        defaultUri: defaultUri,
        filters: {

            'All Files': ['*']
        }
    };

    const uri = await vscode.window.showSaveDialog(options);

    if (uri) {
        fs.writeFile(uri.fsPath, data, async (err) => {
            if (err) {
                vscode.window.showErrorMessage(`Failed to create file: ${err.message}`);
            } else {
                let currentDir = path.dirname(document.fileName);
                let currentFileName = path.basename(document.fileName);
                let targetAbsPath = path.resolve(currentDir, uri.fsPath);
                let targetDir = path.dirname(targetAbsPath);
                let targetFileName = path.basename(targetAbsPath);
                let targetImportPartOfName = path.join(path.relative(targetDir, currentDir), currentFileName);
                let newPath = uri.fsPath.replace(getWorkspaceFolderPath() ?? "", '')
                let partEditor = await openEditor(uri.fsPath)
                if (targetImportPartOfName.split('/')[0] != '..' || targetImportPartOfName.split('/').length === 1) {
                    targetImportPartOfName = `./${targetImportPartOfName}`;
                }
                await partEditor?.edit((editBuilder) => {
                    editBuilder.insert(new vscode.Position(0, 0), `part of '${targetImportPartOfName}';\n\n`);
                })
                let needPartPath = path.join(path.relative(currentDir,targetDir ), targetFileName);
                if (needPartPath.split('/')[0] != '..' || needPartPath.split('/').length === 1) {
                    needPartPath = `./${needPartPath}`;
                }
                let importLine = `part '${needPartPath}';`;
                let needPartFile = path.join(currentDir, currentFileName)
                await partEditor?.edit((editBuilder) => {
                    editBuilder.replace(range, '')
                })
                await vscode.commands.executeCommand(DartPartFixer.command, document, needPartFile, importLine);
                vscode.window.showInformationMessage(`File created: ${newPath}`);
            }
        });
    }
}


function fileNameFormat(fileName: string): string {
    let language = vscode.window.activeTextEditor?.document.languageId
    let fileType = 'txt'
    switch (language) {
        case `dart`:
            fileName = toSnakeCase(fileName)
        default:
            break;
    }
    return fileName
}


function getFileType(): string {
    let language = vscode.window.activeTextEditor?.document.languageId
    let fileType = 'txt'
    switch (language) {
        case 'yaml':
            fileType = 'yaml'
            break;
        case 'json':
            fileType = 'json'
            break;
        case 'xml':
            fileType = 'xml'
            break;
        case 'html':
            fileType = 'html'
            break;
        case 'css':
            fileType = 'css'
            break;
        case 'javascript':
            fileType = 'js'
            break;
        case 'typescript':
            fileType = 'ts'
            break;
        case 'markdown':
            fileType = 'md'
            break;
        case 'python':
            fileType = 'py'
            break;
        case 'java':
            fileType = 'java'
            break;
        case 'c':
            fileType = 'c'
            break;
        case `dart`:
            fileType = 'dart'
        default:
            break;
    }
    return fileType
}