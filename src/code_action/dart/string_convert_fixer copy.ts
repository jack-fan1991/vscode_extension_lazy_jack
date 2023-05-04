import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { toLowerCamelCase, toSnakeCase, toUpperCamelCase } from '../../utils/regex_utils';
import { getCursorLineText, getCursorWordRange, replaceSelectionText } from '../../utils/file_utils';


export class ExtractClassFixer implements vscode.CodeActionProvider {

    public static readonly commandToUpperCamel = 'StringConvertFixer.commandToUpperCamel';
    public static readonly commandLowerCamel = 'StringConvertFixer.commandLowerCamel';
    public static readonly commandToUpperCase = 'StringConvertFixer.commandToUpperCase';
    public static readonly commandToSnackCase = 'StringConvertFixer.commandToSnackCase';

    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.MissingDartPart }
    getLangrageType() { return { scheme: 'file' } }




    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        const selection = editor.selection;
        const text = editor.document.getText(selection);

        if (text != "") {
            return [this.toUpperCamelAction(selection), this.toLowerCamelAction(selection), this.toUpperCase(selection), this.toSnackCase(selection)]
        }
        let wordRange = getCursorWordRange()
        if (wordRange != undefined) {
            return [this.toLowerCamelAction(wordRange),this.toUpperCamelAction(wordRange),  this.toUpperCase(wordRange), this.toSnackCase(wordRange)]
        }

    }

    toUpperCamelAction(range: vscode.Range): vscode.CodeAction {
        let data = "UpperCamel"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: ExtractClassFixer.commandToUpperCamel, title: data, arguments: [range] };
        fix.isPreferred = true;
        return fix;
    }

    toLowerCamelAction(range: vscode.Range): vscode.CodeAction {
        let data = "LowerCamel"

        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: ExtractClassFixer.commandLowerCamel, title: data, arguments: [range] };
        fix.isPreferred = true;
        return fix;
    }

    toUpperCase(range: vscode.Range): vscode.CodeAction {
        let data = "UpperCase"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: ExtractClassFixer.commandToUpperCase, title: data, arguments: [range] };
        fix.isPreferred = true;
        return fix;
    }

    toSnackCase(range: vscode.Range): vscode.CodeAction {
        let data = "SnackCase"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: ExtractClassFixer.commandToSnackCase, title: data, arguments: [range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandToUpperCamel, async (range: vscode.Range) => {
            replaceSelectionText(range, toUpperCamelCase)
        }));
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandLowerCamel, async (range: vscode.Range) => {
            replaceSelectionText(range, toLowerCamelCase)
        }));
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandToUpperCase, async (range: vscode.Range) => {
            replaceSelectionText(range, (text) => text.toUpperCase())

        }));
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandToSnackCase, async (range: vscode.Range) => {
            replaceSelectionText(range, toSnakeCase)

        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }




    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
