import * as vscode from 'vscode';
import * as child_process from "child_process";
import { getRootPath, isWindows } from './vscode_utils';
import * as iconv from 'iconv-lite';


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

export function runCommand(command: string, onDone?: (stdout: string) => void, onError?: (stdout: string) => void, cmdOnRoot = true): Promise<string> {
    const cwd = getRootPath();
    if (cmdOnRoot) {
        if (isWindows()) {
            command = "cd " + cwd + ` ;  ${command}`
        } else {
            command = "cd " + cwd + ` &&  ${command}`
        }
    }
    if (isWindows()) {
        return runPowerShellCommand(command, onDone, onError)
    }
    return new Promise((resolve, reject) => {
        child_process.exec(command, (error, stdout, stderr) => {
            console.log(`${stderr}`);
            if (onDone != null) {
                onDone(stdout)
            }
            if (error) {
                if (onError != null) {
                    onError(error.message)
                }
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

export function runPowerShellCommand(command: string, onDone?: (stdout: string) => void, onError?: (stdout: string) => void,): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const powershell = child_process.spawn('powershell.exe', [command]);

        let stdout = '';
        let stderr = '';

        powershell.stdout.on('data', (data) => {
            stdout += iconv.decode(data, 'cp936');
            if (onDone != null) {
                onDone(stdout)
            }
        });

        powershell.stderr.on('data', (data) => {
            stderr += iconv.decode(data, 'cp936');
            if (onError != null) {
                onError(stderr)
            }
        });

        powershell.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`PowerShell command failed with code ${code}: ${stderr}`));
            } else {
                resolve(stdout.trim());
            }
        });
    });
}