"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonToFreezedFixer = void 0;
const vscode = require("vscode");
const error_code_1 = require("../error_code");
const json_to_freezed_1 = require("../../dart/json_to_freezed");
class JsonToFreezedFixer {
    getCommand() { return JsonToFreezedFixer.command; }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return error_code_1.StatusCode.Pass; }
    getLangrageType() { return 'dart'; }
    // 編輯時對單行檢測
    provideCodeActions(document, range) {
        // const text = document.getText();
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return [];
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text === "")
            return [];
        try {
            let result = JSON.parse(text);
            console.log(`json: ${result}`);
            const quickFixPart = this.createFixAction(document, range, "Convert to Freezed");
            // 將所有程式碼動作打包成陣列，並回傳
            return [quickFixPart];
        }
        catch (e) {
            return [];
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
    createFixAction(document, range, data) {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: JsonToFreezedFixer.command, title: data, arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    //建立錯誤顯示文字hover
    createDiagnostic(range, data) {
        const diagnostic = new vscode.Diagnostic(range, `${data}`, vscode.DiagnosticSeverity.Information);
        return diagnostic;
    }
    // 註冊action 按下後的行為
    setOnActionCommandCallback(context) {
        // 注册 Quick Fix 命令
        context.subscriptions.push(vscode.commands.registerCommand(JsonToFreezedFixer.command, (document, range) => __awaiter(this, void 0, void 0, function* () {
            yield (0, json_to_freezed_1.freezedGenerator)();
            // runTerminal('flutter pub run build_runner build --delete-conflicting-outputs', "build_runner")
        })));
    }
    handleAllFile(document) {
        return [];
    }
    handleError(diagnostic, document, range) {
        return undefined;
    }
}
JsonToFreezedFixer.command = 'JsonToFreezedFixer.command';
JsonToFreezedFixer.partLineRegex = new RegExp(/^part.*[;'"]$/);
exports.JsonToFreezedFixer = JsonToFreezedFixer;
//# sourceMappingURL=json_to_freezed_fixer.js.map