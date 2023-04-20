"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectedText = exports.getWorkspacePath = void 0;
const path = require("path");
const vscode = require("vscode");
function getWorkspacePath(fileName) {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return path.join(`${vscode.workspace.workspaceFolders[0].uri.path}`, fileName);
    }
}
exports.getWorkspacePath = getWorkspacePath;
function getSelectedText() {
    let editor = vscode.window.activeTextEditor;
    if (!editor)
        throw new Error('No active editor');
    let selection = editor.selection;
    let text = editor.document.getText(selection);
    return text;
}
exports.getSelectedText = getSelectedText;
//# sourceMappingURL=workout_space_utils.js.map