import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { findClassRegex, findFreezedClassRegex } from '../../utils/regex_utils';
import { replaceText } from '../../utils/common';
import { getAbsFilePath } from '../../utils/file_utils';


export class FreezedUnionFixer implements CodeActionProviderInterface<string> {

    public static readonly command = 'FreezedUnionFixer.command';
    public static readonly commandAddFromJson = 'FreezedUnionFixer.commandAddFromJson';

    getCommand() { return FreezedUnionFixer.command }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.MissingDartPart }
    getLangrageType() { return 'dart' }




    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        // const text = document.getText();
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        let line = editor.document.lineAt(range.start.line).text;
        let actions: vscode.CodeAction[] = [];
        const text = editor.document.getText();
        let match = line.match(findFreezedClassRegex) ?? [];
        if (match.length > 0) {
            actions.push(this.createFixAction(document, range, "Add Union state"));
            actions.push(this.createAddFromJsonFixAction(document, range, "Add from json method"));
        }
        return actions;

    }

    createFixAction(document: vscode.TextDocument, range: vscode.Range, data: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: FreezedUnionFixer.command, title: data, arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }

    createAddFromJsonFixAction(document: vscode.TextDocument, range: vscode.Range, data: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: FreezedUnionFixer.commandAddFromJson, title: data, arguments: [document, range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(FreezedUnionFixer.command, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let linePosition =range.start.line
            let line =document.lineAt(linePosition).text
            let match= line.match(findClassRegex)??[]
            let className =match[1]
            let maxTry =20;
            let count =0
            let insertPosition =linePosition;
            while(count<maxTry){
                insertPosition++
                count++
                let line:string = document.lineAt(insertPosition).text
                if (line.includes('._'))continue
                if(line.replace(/\s+/g,'').includes(`constfactory${className}.`))continue
                break;  
            }
            await editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tconst factory ${className}.newState() = _newState;\n`);
            })
        }));

        context.subscriptions.push(vscode.commands.registerCommand(FreezedUnionFixer.commandAddFromJson, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let linePosition =range.start.line
            let line =document.lineAt(linePosition).text
            let match= line.match(findClassRegex)??[]
            let className =match[1]
            let maxTry =20;
            let count =0
            let insertPosition =linePosition;
            while(count<maxTry){
                insertPosition++
                count++
                let line:string = document.lineAt(insertPosition).text
                if (line.includes('._'))continue
                if(line.replace(/\s+/g,'').includes(`constfactory${className}.`))continue
                break;  
            }
            await editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tfactory ${className}.fromJson(Map<String, dynamic> json) => _$${className}Json(json);\n`);
            })
             // trigger refresh
             replaceText(getAbsFilePath(document.uri), document.getText(), document.getText())
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }




    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
