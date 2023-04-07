import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { paramToRequireGenerator } from '../../dart/to_require_params';
import { replaceText } from '../../utils/common';


export class RefactorTextStyleFixer implements CodeActionProviderInterface<string> {

    public static readonly command = 'RefactorTextStyleFixer.command';

    getCommand() { return RefactorTextStyleFixer.command }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.MissingDartPart }
    getLangrageType() { return 'dart' }




    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        const position = editor.selection.active;
        let lineText = document.lineAt(position.line).text;
        if (lineText.includes('style:')) return [this.createFixAction(document, range, "Use theme text style")];
        return []

    }

    createFixAction(document: vscode.TextDocument, range: vscode.Range, data: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: RefactorTextStyleFixer.command, title: data, arguments: [document, range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(RefactorTextStyleFixer.command, async (document: vscode.TextDocument, range: vscode.Range) => {
            let editer = vscode.window.activeTextEditor;
            editer?.edit(editBuilder => editBuilder.insert(range.end, "Theme.of(context).textTheme.bodySmall,\n"));


        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }




    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
