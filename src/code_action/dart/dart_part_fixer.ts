import path = require('path');
import * as vscode from 'vscode';
import * as fs from 'fs';
import {  openEditor, replaceText } from '../../utils/common';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { getAbsFilePath } from '../../utils/file_utils';

export class PartFixInfo {
    targetAbsPath: string;
    shortPath: string;
    title: string;
    msg: string;
    importLine: string;
    constructor(targetAbsPath: string, shortPath: string, title: string, msg: string, importLine: string) {
        this.targetAbsPath = targetAbsPath;
        this.shortPath = shortPath;
        this.title = title
        this.msg = msg;
        this.importLine = importLine;

    }
}
export class DartPartFixer implements CodeActionProviderInterface<PartFixInfo> {

    public static readonly command = 'DartPartFixer.command';
    public static partLineRegex = new RegExp(/^part.*[;'"]$/)
    getCommand() { return DartPartFixer.command }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.Refactor]; }
    getErrorCode() { return StatusCode.MissingDartPart }
    getLangrageType() { return 'dart' }

    createFixAction(document: vscode.TextDocument, range: vscode.Range, data: PartFixInfo): vscode.CodeAction {
        const fix = new vscode.CodeAction(`${data.msg}`, vscode.CodeActionKind.Refactor);
        fix.command = { command: DartPartFixer.command, title: data.title, arguments: [document, range, data.targetAbsPath, data.importLine] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    //建立錯誤顯示文字hover
    createDiagnostic(range: vscode.Range, data: PartFixInfo): vscode.Diagnostic {
        const diagnostic = new vscode.Diagnostic(range, `${data.shortPath} \n需要引入 ${data.importLine}`, vscode.DiagnosticSeverity.Error);
        diagnostic.source = `\nlazy-jack \nFix import ${data.importLine} in ${data.shortPath};`;
        diagnostic.code = this.getErrorCode()
        return diagnostic
    }
    // 註冊action 按下後的行為
    setOnActionCommandCallback(context: vscode.ExtensionContext) {
        // 注册 Quick Fix 命令
        context.subscriptions.push(vscode.commands.registerCommand(DartPartFixer.command, async (document: vscode.TextDocument, range: vscode.Range, targetPath: string, importText: string) => {
            // quick fix 點選的行
            // let lineNumber: number = range.start.line
            // let partLine = document.lineAt(lineNumber).text;

            let textEditor = await openEditor(targetPath, true)
            if (textEditor) {
                let lastImportLine = 0
                let lines = textEditor.document.getText().split(/\r?\n/)
                for (let l of lines) {
                    if (!l.includes('import')) {
                        break
                    }
                    lastImportLine++
                }   
                await textEditor.edit((editBuilder) => {
                    editBuilder.insert(new vscode.Position(importText.includes('part') ?   lastImportLine:0, 0), importText + '\n');
                })
                if(textEditor.document.isDirty){
                   await  textEditor.document.save()
                }
                // trigger refresh
                replaceText(getAbsFilePath(document.uri), document.getText(), document.getText())
            }
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {
        let diagnostics: vscode.Diagnostic[] = []
        let lines = document.getText().split(/\r?\n/)
        for (let line of lines) {
            if (DartPartFixer.partLineRegex.exec(line) != null) {
                let range = new vscode.Range(new vscode.Position(lines.indexOf(line), 0), new vscode.Position(lines.indexOf(line), 0))
                let partFixInfo = this.handleLine(document, range)
                if (!partFixInfo) continue
                let diagnostic = this.createDiagnostic(range, partFixInfo)
                diagnostics.push(diagnostic)
            }
        }
        return diagnostics
    }
    handleLine(document: vscode.TextDocument, range: vscode.Range): PartFixInfo | undefined {
        let partLine = document.lineAt(range.start.line).text;
        if(partLine.includes('.g.')||partLine.includes('.freezed.'))return
        let pathRegExp = new RegExp(/(^|\s)\.?\/?(\w+)/) 
        let partMatch=partLine.match(new RegExp( /part\s+(\'*\"*[a-zA-Z]\w*).dart/))
        let partOfMatch= partLine.match(new RegExp( /part\s+of\s+(\'*\"*[a-zA-Z]\w*).dart/))
        let isPartOf =partOfMatch!=null;
        let targetDart =''
        if (isPartOf&& partOfMatch!=null ) {
            targetDart = partOfMatch[1].replace(/'/g,'')+'.dart'
        }else if(partMatch!=null){
            targetDart=partMatch[1].replace(/'/g,'')+'.dart'
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
        if (isPartOf || targetImportPartOfName.split('/').length === 1) {
            targetImportPartOfName = `./${targetImportPartOfName}`;
        }
        let importLine = `${keyPoint} '${targetImportPartOfName}';`;
        if (targetFileContent.includes(importLine.replace(/\s/g, ''))||targetFileContent.includes(importLine.replace(/\s/g, '').replace('./',''))) {
            console.log(`${importLine} already in ${targetAbsPath}`);
            return;
        }
        let shortPath = targetAbsPath.replace(currentDir, '.');
        let msg = `Add line "${importLine}" to "${shortPath}"`;
        let title = `Fix import in ${shortPath}`
        return new PartFixInfo(targetAbsPath, shortPath, title, msg, importLine);
    }

    // 檢查是否為part 開頭 '"; 結尾
    isPartLine(document: vscode.TextDocument, range: vscode.Range) {
        const start = range.start;
        const line = document.lineAt(start.line);
        return DartPartFixer.partLineRegex.exec(line.text) != null;
    }
    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
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

    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        if (diagnostic.code != this.getErrorCode()) return
        let partFixInfo = this.handleLine(document, range);
        if (partFixInfo == null) return
        return this.createFixAction(document, range, partFixInfo)
    }

}
