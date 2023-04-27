import path = require("path");
import vscode = require("vscode");

export function getWorkspacePath(fileName: string): string | undefined {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return path.join(
            `${vscode.workspace.workspaceFolders[0].uri.path}`,
            fileName
        );
    }
}

export function getSelectedText() {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    let selection = editor.selection
    let text = editor.document.getText(selection)
    return text
}

export function getActivateText() {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    let text = editor.document.getText()
    return text
}

export function getActivateTextEditor() {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    return editor
}

export async function reFormat(){
  await  vscode.commands.executeCommand('editor.action.formatDocument')
}


export function saveActivateEditor() {
    let editor = vscode.window.activeTextEditor
    if (!editor)
        throw new Error('No active editor');
    return editor.document.save()
}