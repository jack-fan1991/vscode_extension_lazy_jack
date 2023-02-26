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
exports.FreezedFixer = exports.FreezedFixInfo = void 0;
const path = require("path");
const vscode = require("vscode");
const common_1 = require("../../utils/common");
const error_code_1 = require("../error_code");
const file_utils_1 = require("../../utils/file_utils");
class FreezedFixInfo {
    constructor(targetAbsPath, title, msg, importLine) {
        this.targetAbsPath = targetAbsPath;
        this.title = title;
        this.msg = msg;
        this.importLine = importLine;
    }
}
exports.FreezedFixInfo = FreezedFixInfo;
class FreezedFixer {
    getCommand() { return FreezedFixer.command; }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.QuickFix]; }
    getErrorCode() { return error_code_1.StatusCode.MissingFreezedImport; }
    getLangrageType() { return 'dart'; }
    isFreezed(text) {
        for (let key of ['@freezed', '@unfreezed', 'Freezed(']) {
            if (text.includes(key)) {
                return true;
            }
        }
        return false;
    }
    isJsonSerializable(text) {
        for (let key of ['@JsonSerializable(']) {
            if (text.includes(key)) {
                return true;
            }
        }
        return false;
    }
    needAttention(document) {
        let text = document.getText();
        return this.isFreezed(text) && (!text.includes(FreezedFixer.importLibName) || !text.includes(this.getPartFreezedLine(document.uri)) || !text.includes(this.getPartGLine(document.uri)));
    }
    getPartGLine(uri) {
        let baseFileName = path.basename((0, file_utils_1.getAbsFilePath)(uri)).replace('.dart', '');
        return `part '${baseFileName}.g.dart';`;
    }
    getPartFreezedLine(uri) {
        let baseFileName = path.basename((0, file_utils_1.getAbsFilePath)(uri)).replace('.dart', '');
        return `part '${baseFileName}.freezed.dart';`;
    }
    createFixAction(document, range, data) {
        const fix = new vscode.CodeAction(`${data.msg}`, vscode.CodeActionKind.QuickFix);
        fix.command = { command: FreezedFixer.command, title: data.title, arguments: [document, range, data.targetAbsPath, data.importLine] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    //建立錯誤顯示文字hover
    createDiagnostic(range, data) {
        const diagnostic = new vscode.Diagnostic(range, `${data.msg} `, vscode.DiagnosticSeverity.Error);
        diagnostic.code = this.getErrorCode();
        return diagnostic;
    }
    // 註冊action 按下後的行為
    setOnActionCommandCallback(context) {
        // 注册 Quick Fix 命令
        context.subscriptions.push(vscode.commands.registerCommand(FreezedFixer.command, (document, data) => __awaiter(this, void 0, void 0, function* () {
            // quick fix 點選的行
            // let lineNumber: number = range.start.line
            // let partLine = document.lineAt(lineNumber).text;
            data = document['arguments'][1];
            let textEditor = yield (0, common_1.openEditor)(data.targetAbsPath);
            if (textEditor) {
                let text = textEditor.document.getText();
                let name = path.basename((0, file_utils_1.getAbsFilePath)(textEditor.document.uri));
                let importLine = `import 'package:freezed_annotation/freezed_annotation.dart';`;
                if (this.isFreezed(text) && !text.includes(importLine)) {
                    yield textEditor.edit((editBuilder) => {
                        vscode.window.showInformationMessage(`Fix import ${importLine}`);
                        editBuilder.insert(new vscode.Position(0, 0), importLine + '\n');
                    });
                }
                importLine = `import 'package:json_annotation/json_annotation.dart';`;
                if (this.isJsonSerializable(text) && !text.includes(importLine)) {
                    yield textEditor.edit((editBuilder) => {
                        vscode.window.showInformationMessage(`Fix import ${importLine}`);
                        editBuilder.insert(new vscode.Position(0, 0), importLine + '\n');
                    });
                }
                let insertLine = 0;
                let importFirstChangeIdx = 0;
                let lines = text.split(/\r?\n/);
                //insert part
                for (let l of lines) {
                    if (l.includes('import') || l.includes('part')) {
                        insertLine++;
                    }
                    else {
                        break;
                    }
                }
                let line = this.getPartFreezedLine(vscode.Uri.parse(data.targetAbsPath));
                if (this.isFreezed(text) && !text.includes(line)) {
                    vscode.window.showInformationMessage(`Fix import ${line}`);
                    yield textEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(insertLine, 0), `${line}\n`);
                    });
                }
                line = this.getPartGLine(vscode.Uri.parse(data.targetAbsPath));
                if ((this.isFreezed(text) || this.isJsonSerializable(text)) && text.includes('.fromJson(') && !text.includes(line) && !text.includes(line)) {
                    vscode.window.showInformationMessage(`Fix import ${line}`);
                    yield textEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(insertLine, 0), `${line}\n`);
                    });
                }
            }
        })));
    }
    handleAllFile(document) {
        let diagnostics = [];
        let lines = document.getText().split(/\r?\n/);
        if (!this.needAttention(document))
            return diagnostics;
        for (let line of lines) {
            if (this.isFreezed(line)) {
                let range = new vscode.Range(new vscode.Position(lines.indexOf(line), 0), new vscode.Position(lines.indexOf(line), 0));
                let partFixInfo = this.handleLine(document, range);
                if (!partFixInfo)
                    return diagnostics;
                diagnostics.push(this.createDiagnostic(range, partFixInfo));
                break;
            }
        }
        return diagnostics;
    }
    handleLine(document, range) {
        let partLine = document.lineAt(range.start.line).text;
        let text = document.getText();
        let baseFileName = path.basename((0, file_utils_1.getAbsFilePath)(document.uri)).replace('.dart', '');
        let partFLine = this.getPartFreezedLine(document.uri);
        let partGLine = this.getPartGLine(document.uri);
        if (partLine.includes(`.fromJson(`) && (this.isFreezed(text) || text.includes('@JsonSerializable(')) && !text.replace(/\s/g, '').includes('partof') && !text.includes('g.dart')) {
            let data = new FreezedFixInfo((0, file_utils_1.getAbsFilePath)(document.uri), 'fixImport', `Fix import ${partGLine}`, partGLine);
            this.runCommand(document, data);
        }
        if (!this.needAttention(document))
            return;
        //判斷正在編輯的焦點是否為@freezed行
        if (!partLine.includes('@freezed'))
            return;
        if (!text.includes(FreezedFixer.importLibName)) {
            let data = new FreezedFixInfo((0, file_utils_1.getAbsFilePath)(document.uri), 'fixImport', `Fix import 'package:freezed_annotation/freezed_annotation.dart';`, `import 'package:freezed_annotation/freezed_annotation.dart';`);
            this.runCommand(document, data);
        }
        if (!text.replace(/\s/g, '').includes('partof') && !text.includes(partFLine)) {
            let data = new FreezedFixInfo((0, file_utils_1.getAbsFilePath)(document.uri), 'fixImport', `Fix import ${partFLine}`, partFLine);
            this.runCommand(document, data);
        }
        // if (!text.replace(/\s/g, '').includes('partof') && text.includes()&& !text.includes(partGLine)) {
        //     let data = new FreezedFixInfo(getAbsFilePath(document.uri), 'fixImport', `Fix import ${partGLine}`, partGLine)
        //     this.runCommand(document, data)
        // }
    }
    runCommand(document, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand(this.getCommand(), { command: FreezedFixer.command, title: data.title, data: data, arguments: [document, data] });
        });
    }
    // 編輯時對單行檢測
    provideCodeActions(document, range) {
        // 若游標所在位置不在笑臉符號的開頭，則不提供動作
        let data = this.handleLine(document, range);
        if (data == null)
            return;
        const quickFixPart = this.createFixAction(document, range, data);
        const diagnostic = new vscode.Diagnostic(range, `${data.msg}`, vscode.DiagnosticSeverity.Error);
        diagnostic.source = `\nlazy-jack \nFix import ${data.msg} in};`;
        // 將所有程式碼動作打包成陣列，並回傳
        return [quickFixPart];
    }
    handleError(diagnostic, document, range) {
        if (diagnostic.code != this.getErrorCode())
            return;
        let partFixInfo = this.handleLine(document, range);
        if (partFixInfo == null)
            return;
        return this.createFixAction(document, range, partFixInfo);
    }
}
exports.FreezedFixer = FreezedFixer;
FreezedFixer.command = 'FreezedFixer.command';
FreezedFixer.freezedLineRegex = new RegExp(/@freezed\s+/);
FreezedFixer.importLibName = `import 'package:freezed_annotation/freezed_annotation.dart';`;
//# sourceMappingURL=freezed_import_fixer.js.map