import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { toLowerCamelCase, toUpperCamelCase } from '../../utils/regex_utils';


export class StringConvertFixer implements CodeActionProviderInterface<string> {

    public static readonly commandToUpperCamel = 'StringConvertFixer.commandToUpperCamel';
    public static readonly commandLowerCamel = 'StringConvertFixer.commandLowerCamel';
    public static readonly commandToUpperCase = 'StringConvertFixer.commandToUpperCase';

    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.MissingDartPart }
    getLangrageType() { return 'dart' }




    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text === "") return [];
        return [this.toUpperCamelAction(document, range), this.toLowerCamelAction(document, range), this.toUpperCase(document, range)]

    }

    toUpperCamelAction(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        let data = "UpperCamel"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandToUpperCamel, title: data, arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }

    toLowerCamelAction(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        let data = "LowerCamel"

        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandLowerCamel, title: "LowerCamel", arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }

    toUpperCase(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction {
        let data = "UpperCase"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandToUpperCase, title: "UpperCase", arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }



    //建立錯誤顯示文字hover
    createDiagnostic(range: vscode.Range, data: string): vscode.Diagnostic {
        const diagnostic = new vscode.Diagnostic(range, `${data}`, vscode.DiagnosticSeverity.Information);
        return diagnostic
    }
    // 註冊action 按下後的行為
    setOnActionCommandCallback(context: vscode.ExtensionContext) {
        // 注册 Quick Fix 命令
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandToUpperCamel, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
            editBuilder.replace(selection, toUpperCamelCase(text))
            })
        }));
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandLowerCamel, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
            editBuilder.replace(selection, toLowerCamelCase(text))
            })

        }));
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandToUpperCase, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
            editBuilder.replace(selection, text.toUpperCase())
            })
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }




    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
