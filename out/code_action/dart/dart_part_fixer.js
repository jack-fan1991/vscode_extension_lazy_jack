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
exports.DartPartFixer = exports.PartFixInfo = void 0;
const path = require("path");
const vscode = require("vscode");
const fs = require("fs");
const common_1 = require("../../utils/common");
const error_code_1 = require("../error_code");
const file_utils_1 = require("../../utils/file_utils");
class PartFixInfo {
    constructor(targetAbsPath, shortPath, title, msg, importLine) {
        this.targetAbsPath = targetAbsPath;
        this.shortPath = shortPath;
        this.title = title;
        this.msg = msg;
        this.importLine = importLine;
    }
}
exports.PartFixInfo = PartFixInfo;
class DartPartFixer {
    getCommand() { return DartPartFixer.command; }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return error_code_1.StatusCode.MissingDartPart; }
    getLangrageType() { return 'dart'; }
    createFixAction(document, range, data) {
        const fix = new vscode.CodeAction(`${data.msg}`, vscode.CodeActionKind.Refactor);
        fix.command = { command: DartPartFixer.command, title: data.title, arguments: [document, range, data.targetAbsPath, data.importLine] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    //建立錯誤顯示文字hover
    createDiagnostic(range, data) {
        const diagnostic = new vscode.Diagnostic(range, `${data.shortPath} \n需要引入 ${data.importLine}`, vscode.DiagnosticSeverity.Error);
        diagnostic.source = `\nlazy-jack \nFix import ${data.importLine} in ${data.shortPath};`;
        diagnostic.code = this.getErrorCode();
        return diagnostic;
    }
    // 註冊action 按下後的行為
    setOnActionCommandCallback(context) {
        // 注册 Quick Fix 命令
        context.subscriptions.push(vscode.commands.registerCommand(DartPartFixer.command, (document, range, targetPath, importText) => __awaiter(this, void 0, void 0, function* () {
            // quick fix 點選的行
            // let lineNumber: number = range.start.line
            // let partLine = document.lineAt(lineNumber).text;
            let textEditor = yield (0, common_1.openEditor)(targetPath, true);
            if (textEditor) {
                let lastImportLine = 0;
                let lines = textEditor.document.getText().split(/\r?\n/);
                for (let l of lines) {
                    if (!l.includes('import')) {
                        break;
                    }
                    lastImportLine++;
                }
                yield textEditor.edit((editBuilder) => {
                    editBuilder.insert(new vscode.Position(importText.includes('part') ? lastImportLine : 0, 0), importText + '\n');
                });
                if (textEditor.document.isDirty) {
                    yield textEditor.document.save();
                }
                // trigger refresh
                (0, common_1.replaceText)((0, file_utils_1.getAbsFilePath)(document.uri), document.getText(), document.getText());
            }
        })));
    }
    handleAllFile(document) {
        let diagnostics = [];
        let lines = document.getText().split(/\r?\n/);
        for (let line of lines) {
            if (DartPartFixer.partLineRegex.exec(line) != null) {
                let range = new vscode.Range(new vscode.Position(lines.indexOf(line), 0), new vscode.Position(lines.indexOf(line), 0));
                let partFixInfo = this.handleLine(document, range);
                if (!partFixInfo)
                    continue;
                let diagnostic = this.createDiagnostic(range, partFixInfo);
                diagnostics.push(diagnostic);
            }
        }
        return diagnostics;
    }
    handleLine(document, range) {
        let partLine = document.lineAt(range.start.line).text;
        if (partLine.includes('.g.') || partLine.includes('.freezed.'))
            return;
        let pathRegExp = new RegExp(/(^|\s)\.?\/?(\w+)/);
        let partMatch = partLine.match(new RegExp(/'([^']+)'/));
        let partOfMatch = partLine.match(new RegExp(/'([^']+)'/));
        let isPartOf = partLine.replace(/\s/g, '').includes('partof');
        let targetDart = '';
        if (isPartOf && partOfMatch != null) {
            // targetDart = partOfMatch[1].replace(/'/g,'')+'.dart'
            targetDart = partOfMatch[1];
        }
        else if (partMatch != null) {
            // targetDart=partMatch[1].replace(/'/g,'')+'.dart'
            targetDart = partMatch[1];
        }
        let currentDir = path.dirname(document.fileName);
        let currentFileName = path.basename(document.fileName);
        let targetAbsPath = path.resolve(currentDir, targetDart);
        let targetDir = path.dirname(targetAbsPath);
        let targetFileName = path.basename(targetAbsPath);
        if (!fs.existsSync(targetAbsPath)) {
            console.log(`!!!!!${targetAbsPath} NotFound!!!!!!`);
            return;
        }
        const targetFileContent = fs.readFileSync(targetAbsPath, 'utf-8').replace(/\s/g, '');
        let keyPoint = isPartOf ? 'part' : 'part of';
        let targetImportPartOfName = "";
        targetImportPartOfName = path.join(path.relative(targetDir, currentDir), currentFileName);
        if (isPartOf && targetImportPartOfName.split('/')[0] != '..' || targetImportPartOfName.split('/').length === 1) {
            targetImportPartOfName = `./${targetImportPartOfName}`;
        }
        let importLine = `${keyPoint} '${targetImportPartOfName}';`;
        if (targetFileContent.includes(importLine.replace(/\s/g, '')) || targetFileContent.includes(importLine.replace(/\s/g, '').replace('./', ''))) {
            console.log(`${importLine} already in ${targetAbsPath}`);
            return;
        }
        let shortPath = targetAbsPath.replace(currentDir, '.');
        let msg = `Add line "${importLine}" to "${shortPath}"`;
        let title = `Fix import in ${shortPath}`;
        return new PartFixInfo(targetAbsPath, shortPath, title, msg, importLine);
    }
    // 檢查是否為part 開頭 '"; 結尾
    isPartLine(document, range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return DartPartFixer.partLineRegex.exec(line.text) != null;
    }
    // 編輯時對單行檢測
    provideCodeActions(document, range) {
        if (!this.isPartLine(document, range)) {
            return;
        }
        let partFixInfo = this.handleLine(document, range);
        if (partFixInfo == null)
            return;
        const quickFixPart = this.createFixAction(document, range, partFixInfo);
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
exports.DartPartFixer = DartPartFixer;
DartPartFixer.command = 'DartPartFixer.command';
DartPartFixer.partLineRegex = new RegExp(/^part.*[;'"]$/);
//# sourceMappingURL=dart_part_fixer.js.map