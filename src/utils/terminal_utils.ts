import * as vscode from 'vscode';
import * as child_process from "child_process";


export function runTerminal(cmd: string, terminalName: string = '') {
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

export function runCommand(command: string,onDone?:(stdout:string)=>void): Promise<string> {
    const cwd = vscode.workspace.rootPath;
    command ="cd " + cwd + ` &&  ${command}`
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            console.log(`${stderr}`);
            if(onDone!=null){
                onDone(stdout)
            }
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

