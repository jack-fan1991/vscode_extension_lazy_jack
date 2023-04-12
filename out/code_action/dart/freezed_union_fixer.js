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
exports.FreezedUnionFixer = void 0;
const vscode = require("vscode");
const error_code_1 = require("../error_code");
const regex_utils_1 = require("../../utils/regex_utils");
const common_1 = require("../../utils/common");
const file_utils_1 = require("../../utils/file_utils");
class FreezedUnionFixer {
    getCommand() { return FreezedUnionFixer.command; }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return error_code_1.StatusCode.MissingDartPart; }
    getLangrageType() { return 'dart'; }
    // 編輯時對單行檢測
    provideCodeActions(document, range) {
        var _a;
        // const text = document.getText();
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return [];
        let line = editor.document.lineAt(range.start.line).text;
        let actions = [];
        const text = editor.document.getText();
        let match = (_a = line.match(regex_utils_1.findFreezedClassRegex)) !== null && _a !== void 0 ? _a : [];
        if (match.length > 0) {
            actions.push(this.createFixAction(document, range, "Add Union state"));
            actions.push(this.createAddFromJsonFixAction(document, range, "Add from json method"));
        }
        return actions;
    }
    createFixAction(document, range, data) {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: FreezedUnionFixer.command, title: data, arguments: [document, range] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    createAddFromJsonFixAction(document, range, data) {
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.Refactor);
        fix.command = { command: FreezedUnionFixer.commandAddFromJson, title: data, arguments: [document, range] };
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
        context.subscriptions.push(vscode.commands.registerCommand(FreezedUnionFixer.command, (document, range) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let linePosition = range.start.line;
            let line = document.lineAt(linePosition).text;
            let match = (_a = line.match(regex_utils_1.findClassRegex)) !== null && _a !== void 0 ? _a : [];
            let className = match[1];
            let maxTry = 20;
            let count = 0;
            let insertPosition = linePosition;
            while (count < maxTry) {
                insertPosition++;
                count++;
                let line = document.lineAt(insertPosition).text;
                if (line.includes('._'))
                    continue;
                if (line.replace(/\s+/g, '').includes(`constfactory${className}.`))
                    continue;
                break;
            }
            yield editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tconst factory ${className}.newState() = _newState;\n`);
            });
        })));
        context.subscriptions.push(vscode.commands.registerCommand(FreezedUnionFixer.commandAddFromJson, (document, range) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return;
            let linePosition = range.start.line;
            let line = document.lineAt(linePosition).text;
            let match = (_b = line.match(regex_utils_1.findClassRegex)) !== null && _b !== void 0 ? _b : [];
            let className = match[1];
            let maxTry = 20;
            let count = 0;
            let insertPosition = linePosition;
            while (count < maxTry) {
                insertPosition++;
                count++;
                let line = document.lineAt(insertPosition).text;
                if (line.includes('._'))
                    continue;
                if (line.replace(/\s+/g, '').includes(`constfactory${className}.`))
                    continue;
                break;
            }
            yield editor.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(insertPosition, 0), `\tfactory ${className}.fromJson(Map<String, dynamic> json) => _$${className}Json(json);\n`);
            });
            // trigger refresh
            (0, common_1.replaceText)((0, file_utils_1.getAbsFilePath)(document.uri), document.getText(), document.getText());
        })));
    }
    handleAllFile(document) {
        return [];
    }
    handleError(diagnostic, document, range) {
        return undefined;
    }
}
FreezedUnionFixer.command = 'FreezedUnionFixer.command';
FreezedUnionFixer.commandAddFromJson = 'FreezedUnionFixer.commandAddFromJson';
exports.FreezedUnionFixer = FreezedUnionFixer;
//# sourceMappingURL=freezed_union_fixer.js.map