"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTerminal = void 0;
const vscode = require("vscode");
function runTerminal(context, cmd) {
    vscode.window.showInformationMessage('正在執行' + cmd + ' 命令...');
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
        const newTerminal = vscode.window.createTerminal();
        newTerminal.show();
        newTerminal.sendText(cmd);
        return;
    }
    terminal.show();
    terminal.sendText(cmd);
}
exports.runTerminal = runTerminal;
//# sourceMappingURL=terminal_utils.js.map