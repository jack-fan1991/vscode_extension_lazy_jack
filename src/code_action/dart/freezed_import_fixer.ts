import path = require('path');
import * as vscode from 'vscode';
import * as fs from 'fs';
import { title } from 'process';
import { openEditor } from '../../utils/common';
import { CodeActionProviderInterface } from '../code_action';
import { StatusCode } from '../error_code';
import { getAbsFilePath } from '../../utils/file_utils';

export class FreezedFixInfo {
    targetAbsPath: string;
    title: string;
    msg: string;
    importLine: string;
    constructor(targetAbsPath: string, title: string, msg: string, importLine: string) {
        this.targetAbsPath = targetAbsPath;
        this.title = title
        this.msg = msg;
        this.importLine = importLine;

    }
}
export class FreezedFixer implements CodeActionProviderInterface<FreezedFixInfo> {

    public static readonly command = 'FreezedFixer.command';
    public static freezedLineRegex = new RegExp(/@freezed\s+/)
    public static readonly importLibName = `import 'package:freezed_annotation/freezed_annotation.dart';`
    getCommand() { return FreezedFixer.command }
    getProvidedCodeActionKinds() { return [vscode.CodeActionKind.QuickFix]; }
    getErrorCode() { return StatusCode.MissingFreezedImport }
    getLangrageType() { return 'dart' }

    isFreezed(text: string): boolean {
        for (let key of ['@freezed', '@unfreezed', 'Freezed(']) {
            if (text.includes(key)) {
                return true
            }
        }
        return false
    }
    isJsonSerializable(text: string): boolean {
        for (let key of ['@JsonSerializable(']) {
            if (text.includes(key)) {
                return true
            }
        }
        return false
    }

    needAttention(document: vscode.TextDocument) {
        let text = document.getText()
        return this.isFreezed(text) && (!text.includes(FreezedFixer.importLibName) || !text.includes(this.getPartFreezedLine(document.uri)) || !text.includes(this.getPartGLine(document.uri)))
    }

    getPartGLine(uri: vscode.Uri) {
        let baseFileName = path.basename(getAbsFilePath(uri)).replace('.dart', '')
        return `part '${baseFileName}.g.dart';`
    }

    getPartFreezedLine(uri: vscode.Uri) {
        let baseFileName = path.basename(getAbsFilePath(uri)).replace('.dart', '')
        return `part '${baseFileName}.freezed.dart';`
    }

    createFixAction(document: vscode.TextDocument, range: vscode.Range, data: FreezedFixInfo): vscode.CodeAction {
        const fix = new vscode.CodeAction(`${data.msg}`, vscode.CodeActionKind.QuickFix);
        fix.command = { command: FreezedFixer.command, title: data.title, arguments: [document, range, data.targetAbsPath, data.importLine] };
        fix.diagnostics = [this.createDiagnostic(range, data)];
        fix.isPreferred = true;
        return fix;
    }
    //????????????????????????hover
    createDiagnostic(range: vscode.Range, data: FreezedFixInfo): vscode.Diagnostic {
        const diagnostic = new vscode.Diagnostic(range, `${data.msg} `, vscode.DiagnosticSeverity.Error);
        diagnostic.code = this.getErrorCode()
        return diagnostic
    }
    // ??????action ??????????????????
    setOnActionCommandCallback(context: vscode.ExtensionContext) {
        // ?????? Quick Fix ??????
        context.subscriptions.push(vscode.commands.registerCommand(FreezedFixer.command, async (document: vscode.TextDocument, data: FreezedFixInfo) => {
            // quick fix ????????????
            // let lineNumber: number = range.start.line
            // let partLine = document.lineAt(lineNumber).text;
            data = document['arguments'][1]
            let textEditor = await openEditor(data.targetAbsPath)
            if (textEditor) {
                let text = textEditor.document.getText()
                let name = path.basename(getAbsFilePath(textEditor.document.uri))
                let importLine = `import 'package:freezed_annotation/freezed_annotation.dart';`
                if (this.isFreezed(text) && !text.includes(importLine)) {
                    await textEditor.edit((editBuilder) => {
                        vscode.window.showInformationMessage(`Fix import ${importLine}`)
                        editBuilder.insert(new vscode.Position(0, 0), importLine + '\n');
                    })
                }

                importLine = `import 'package:json_annotation/json_annotation.dart';`
                if (this.isJsonSerializable(text) && !text.includes(importLine)) {
                    await textEditor.edit((editBuilder) => {
                        vscode.window.showInformationMessage(`Fix import ${importLine}`)
                        editBuilder.insert(new vscode.Position(0, 0), importLine + '\n');
                    })
                }
                let insertLine = 0
                let importFirstChangeIdx = 0
                let lines = text.split(/\r?\n/)
                //insert part
                for (let l of lines) {
                    if (l.includes('import') || l.includes('part')) {
                        insertLine++

                    } else {
                        break
                    }
                }
                let line = this.getPartFreezedLine(vscode.Uri.parse(data.targetAbsPath))
                if (this.isFreezed(text) && !text.includes(line)) {
                    vscode.window.showInformationMessage(`Fix import ${line}`)
                    await textEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(insertLine, 0), `${line}\n`);
                    })
                }
                line = this.getPartGLine(vscode.Uri.parse(data.targetAbsPath))
                if ((this.isFreezed(text)||this.isJsonSerializable(text) )&& text.includes('.fromJson(') && !text.includes(line)&&!text.includes(line)) {
                    vscode.window.showInformationMessage(`Fix import ${line}`)
                    await textEditor.edit((editBuilder) => {
                        editBuilder.insert(new vscode.Position(insertLine, 0), `${line}\n`);
                    })
                }
            }
        }));
    }

    handleAllFile(document: vscode.TextDocument): vscode.Diagnostic[] {

        let diagnostics: vscode.Diagnostic[] = []
        let lines = document.getText().split(/\r?\n/)
        if (!this.needAttention(document)) return diagnostics
        for (let line of lines) {
            if (this.isFreezed(line)) {
                let range = new vscode.Range(new vscode.Position(lines.indexOf(line), 0), new vscode.Position(lines.indexOf(line), 0))
                let partFixInfo = this.handleLine(document, range)
                if (!partFixInfo) return diagnostics
                diagnostics.push(this.createDiagnostic(range, partFixInfo))
                break
            }
        }
        return diagnostics
    }
    handleLine(document: vscode.TextDocument, range: vscode.Range): FreezedFixInfo | undefined {
        let partLine = document.lineAt(range.start.line).text
        let text = document.getText()
        let baseFileName = path.basename(getAbsFilePath(document.uri)).replace('.dart', '')
        let partFLine = this.getPartFreezedLine(document.uri)
        let partGLine = this.getPartGLine(document.uri)
        if (partLine.includes(`.fromJson(`) && (this.isFreezed(text) || text.includes('@JsonSerializable(')) && !text.replace(/\s/g, '').includes('partof') && !text.includes('g.dart')) {
            let data = new FreezedFixInfo(getAbsFilePath(document.uri), 'fixImport', `Fix import ${partGLine}`, partGLine)
            this.runCommand(document, data)
        }
        if (!this.needAttention(document)) return
        //????????????????????????????????????@freezed???
        if (!partLine.includes('@freezed')) return
        if (!text.includes(FreezedFixer.importLibName)) {
            let data = new FreezedFixInfo(getAbsFilePath(document.uri), 'fixImport', `Fix import 'package:freezed_annotation/freezed_annotation.dart';`, `import 'package:freezed_annotation/freezed_annotation.dart';`)
            this.runCommand(document, data)
        }
        if (!text.replace(/\s/g, '').includes('partof') && !text.includes(partFLine)) {
            let data = new FreezedFixInfo(getAbsFilePath(document.uri), 'fixImport', `Fix import ${partFLine}`, partFLine)
            this.runCommand(document, data)
        }
        // if (!text.replace(/\s/g, '').includes('partof') && text.includes()&& !text.includes(partGLine)) {
        //     let data = new FreezedFixInfo(getAbsFilePath(document.uri), 'fixImport', `Fix import ${partGLine}`, partGLine)
        //     this.runCommand(document, data)
        // }

    }

    async runCommand(document: vscode.TextDocument, data: FreezedFixInfo) {
        await vscode.commands.executeCommand(this.getCommand(), { command: FreezedFixer.command, title: data.title, data: data, arguments: [document, data] });

    }

    // ????????????????????????
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        // ?????????????????????????????????????????????????????????????????????
        let data = this.handleLine(document, range);
        if (data == null)
            return;
        const quickFixPart = this.createFixAction(document, range, data);
        const diagnostic = new vscode.Diagnostic(range, `${data.msg}`, vscode.DiagnosticSeverity.Error);
        diagnostic.source = `\nlazy-jack \nFix import ${data.msg} in};`;
        // ???????????????????????????????????????????????????
        return [quickFixPart];
    }

    handleError(diagnostic: vscode.Diagnostic, document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction | undefined {
        if (diagnostic.code != this.getErrorCode()) return
        let partFixInfo = this.handleLine(document, range);
        if (partFixInfo == null) return
        return this.createFixAction(document, range, partFixInfo)
    }

}
