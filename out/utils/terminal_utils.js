"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.runTerminal = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
function runTerminal(cmd, terminalName = '') {
    vscode.window.showInformationMessage('正在執行' + cmd + ' 命令...');
    const terminal = vscode.window.activeTerminal;
    if (!terminal) {
        const newTerminal = vscode.window.createTerminal('Terminal');
        newTerminal.show();
        newTerminal.sendText(cmd);
        return;
    }
    else if (terminalName != '' && terminal.name != terminalName) {
        const newTerminal = vscode.window.createTerminal(terminalName);
        newTerminal.show();
        newTerminal.sendText(cmd);
        return;
    }
    terminal.show();
    terminal.sendText(cmd);
}
exports.runTerminal = runTerminal;
function runCommand(command, onDone) {
    const cwd = vscode.workspace.rootPath;
    command = "cd " + cwd + ` &&  ${command}`;
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            console.log(`${stderr}`);
            if (onDone != null) {
                onDone(stdout);
            }
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout);
            }
        });
    });
}
exports.runCommand = runCommand;
//# sourceMappingURL=terminal_utils.js.map