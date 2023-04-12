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
exports.StringConvertFixer = void 0;
const vscode = require("vscode");
const error_code_1 = require("../error_code");
const regex_utils_1 = require("../../utils/regex_utils");
class StringConvertFixer {
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return error_code_1.StatusCode.MissingDartPart; }
    getLangrageType() { return 'dart'; }
    // 編輯時對單行檢測
    provideCodeActions(document, range) {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return [];
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        if (text === "")
            return [];
        return [this.toUpperCamelAction(document, range), this.toLowerCamelAction(document, range), this.toUpperCase(document, range)];
    }
    toUpperCamelAction(document, range) {
        let data = "UpperCamel";
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandToUpperCamel, title: data, arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    toLowerCamelAction(document, range) {
        let data = "LowerCamel";
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandLowerCamel, title: "LowerCamel", arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    toUpperCase(document, range) {
        let data = "UpperCase";
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: StringConvertFixer.commandToUpperCase, title: "UpperCase", arguments: [document, range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandToUpperCamel, (document, range) => __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, (0, regex_utils_1.toUpperCamelCase)(text));
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandLowerCamel, (document, range) => __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, (0, regex_utils_1.toLowerCamelCase)(text));
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand(StringConvertFixer.commandToUpperCase, (document, range) => __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return [];
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, text.toUpperCase());
            });
        })));
    }
    handleAllFile(document) {
        return [];
    }
    handleError(diagnostic, document, range) {
        return undefined;
    }
}
StringConvertFixer.commandToUpperCamel = 'StringConvertFixer.commandToUpperCamel';
StringConvertFixer.commandLowerCamel = 'StringConvertFixer.commandLowerCamel';
StringConvertFixer.commandToUpperCase = 'StringConvertFixer.commandToUpperCase';
exports.StringConvertFixer = StringConvertFixer;
//# sourceMappingURL=string_convert_fixer.js.map