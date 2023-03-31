import path = require('path');
import * as vscode from 'vscode';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { freezedGenerator } from '../../dart/json_to_freezed';


export class JsonToFreezedFixer implements CodeActionProviderInterface<string> {

    public static readonly command = 'JsonToFreezedFixer.command';
    public static partLineRegex = new RegExp(/^part.*[;'"]$/)
    getCommand() { return JsonToFreezedFixer.command }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.Pass }
    getLangrageType() { return 'dart' }


    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        // const text = document.getText();
        const editor = vscode.window.activeTextEditor;
        if (!editor) return [];
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text === "") return [];
        try {
            let result = JSON.parse(text)
            console.log(`json: ${result}`);
            const quickFixPart = this.createFixAction(document, range, "Convert to Freezed");
            // 將所有程式碼動作打包成陣列，並回傳
            return [quickFixPart];
        } catch (e) {
            return []
        }
        // let lines = text.split(/\r?\n/);
        // let stack: string[] = [];
        // let linePosition: number[] = [];
        // let idx: number = 0;
        // let json = '';
        // for (let l of lines) {
        //     json+=l
        //     // 移除空白
        //     console.log(`line: ${l}`);

        //     let line: string = l.trim();

        //     let find = line.match(RegExp(/{/g)) ?? [];
        //     if (find.length > 0) {
        //         linePosition.push(idx);
        //         find.forEach(() => { stack.push('{') })
        //     }
        //     find = line.match(RegExp(/}/g)) ?? [];
        //     if (find.length > 0) {
        //         find.forEach(() => {
        //             if (stack.length > 1) {
        //                 linePosition.pop()
        //             } else {
        //                 try {
        //                     let result = JSON.parse(json)
        //                     console.log(`json: ${result}`);
        //                 } catch (e){
        //                     console.log(`json: ${e}`);
        //                     linePosition.pop()
        //                 }
        //                 json=''
        //             }
        //             stack.pop()
        //         })

        //     }
        //     idx++
        // }


     
    }

    createFixAction(document: vscode.TextDocument, range: vscode.Range, data: string): vscode.CodeAction {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: JsonToFreezedFixer.command, title: data, arguments: [document, range]};
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
        context.subscriptions.push(vscode.commands.registerCommand(JsonToFreezedFixer.command, async (document: vscode.TextDocument, range: vscode.Range) => {
            freezedGenerator()  
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        return []
    }
    



    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        return undefined
    }

}
