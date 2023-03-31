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
exports.ParamToRequiredFixer = void 0;
const vscode = require("vscode");
const error_code_1 = require("../error_code");
const to_require_params_1 = require("../../dart/to_require_params");
class ParamToRequiredFixer {
    getCommand() { return ParamToRequiredFixer.command; }
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
        if (text.split(',').length <= 1)
            return;
        let start = range.start.line;
        if (!editor.document.lineAt(start).text.includes('('))
            return;
        return [this.createFixAction(document, range, "Convert to required")];
    }
    createFixAction(document, range, data) {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: ParamToRequiredFixer.command, title: data, arguments: [document, range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(ParamToRequiredFixer.command, (document, range) => __awaiter(this, void 0, void 0, function* () {
            (0, to_require_params_1.paramToRequireGenerator)();
        })));
    }
    handleAllFile(document) {
        return [];
    }
    handleError(diagnostic, document, range) {
        return undefined;
    }
}
exports.ParamToRequiredFixer = ParamToRequiredFixer;
ParamToRequiredFixer.command = 'ParamToRequiredFixer.command';
//# sourceMappingURL=param_to_required_fixer.js.map