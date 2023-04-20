
import * as vscode from 'vscode';
import { Icon_Error, logError } from './icon';

export function tryParseJson(text: string): any {
    try {
        return JSON.parse(text);
    } catch (_) {
        logError(`JSON parse error`);
        vscode.window.showErrorMessage(`JSON parse error`);
        throw _;
    }
}