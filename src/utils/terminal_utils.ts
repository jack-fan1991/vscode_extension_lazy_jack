import * as vscode from 'vscode';


export function runTerminal(context: vscode.ExtensionContext, cmd: string) {
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
