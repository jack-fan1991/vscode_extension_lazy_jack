import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { findClassRegex, findFreezedClassRegex } from '../../utils/regex_utils';
import { getAbsFilePath, replaceText } from '../../utils/file_utils';
import { getActivateTextEditor, reFormat } from '../../utils/vscode_utils';
import { logError, logInfo } from '../../utils/icon';


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
            let linePosition = range.start.line
            let line = document.lineAt(linePosition).text
            let match = line.match(findClassRegex) ?? []
            let className = match[1]
            let maxTry = 20;
            let count = 0
            let insertPosition = linePosition;
            while (count < maxTry) {
                insertPosition++
                count++
                let line: string = document.lineAt(insertPosition).text
                if (line != "}") continue
                let preLine: string = document.lineAt(insertPosition - 1).text
                let preLine2: string = document.lineAt(insertPosition - 2).text

                if (preLine.includes('fromJson')) {
                    insertPosition--
                    break
                }
                if (preLine2.includes('fromJson')) {
                    insertPosition -= 2
                    break
                }
                break;
            }
            await editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tconst factory ${className}.newState() = _newState;\n`);
            })
            const decorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(40,80,128,0.8)'
            });
            let start1 = 16 + className.length
            let end1 = start1 + 8
            let start2 = end1 + 6
            let end2 = start2 + 8
            const position1 = new vscode.Position(insertPosition, start1);
            const position2 = new vscode.Position(insertPosition, end1);
            const position3 = new vscode.Position(insertPosition, start2);
            const position4 = new vscode.Position(insertPosition, end2);
            const selection1 = new vscode.Selection(position1, position2);
            const selection2 = new vscode.Selection(position3, position4);
            editor.selections = [selection1, selection2]
            editor.setDecorations(decorationType, [selection1, selection2]);
            // let disposable = vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
            //     let editor = vscode.window.activeTextEditor;
            //     if (!editor) {
            //         return;
            //     }
            //     logInfo(`${editor.document.getText(e.selections[0])}`)
            //     logInfo(`${editor.document.getText(e.selections[1])}`)

            //     // 判斷當前選中的範圍是否為空
            //     // if (editor.selections.every(selection => selection.isEmpty)) {
            //     //     // 移除所有 decorationType 的樣式
            //     //     editor.setDecorations(decorationType, []);
            //     //     // 取消註冊監聽事件
            //     //     disposable.dispose();
            //     // }
            // });


            reFormat()
        }));

        context.subscriptions.push(vscode.commands.registerCommand(FreezedUnionFixer.commandAddFromJson, async (document: vscode.TextDocument, range: vscode.Range) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let linePosition = range.start.line
            let line = document.lineAt(linePosition).text
            let match = line.match(findClassRegex) ?? []
            let className = match[1]
            let maxTry = 20;
            let count = 0
            let insertPosition = linePosition;
            while (count < maxTry) {
                insertPosition++
                count++
                let line: string = document.lineAt(insertPosition).text
                if (line != "}") continue
                // if (line.includes('._'))continue
                // if(line.replace(/\s+/g,'').includes(`constfactory${className}.`))continue
                break;
            }
            await editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tfactory ${className}.fromJson(Map<String, dynamic> json) => _$${className}Json(json);\n`);
            })
            // trigger refresh
            //  replaceText(getAbsFilePath(document.uri), document.getText(), document.getText())
            reFormat()
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }




    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
