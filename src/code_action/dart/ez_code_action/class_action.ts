import * as vscode from 'vscode';
import { EzCodeActionProviderInterface } from '../../code_action';
import { findClassRegex, } from '../../../utils/regex_utils';
import { createFileInPicker, getActivityEditor, getCursorLineText } from '../../../utils/file_utils';
import { getActivateText } from '../../../utils/vscode_utils';
import { FlutterOpenCloseFinder } from '../../../utils/open_close_finder';

const flutterOpenCloseFinder = new FlutterOpenCloseFinder();



export class ExtractClassFixer implements EzCodeActionProviderInterface {

    getLangrageType(): vscode.DocumentSelector {
        return { scheme: 'file' }
    }

    public static readonly commandExtractClass = 'ExtractClassFixer.extract.class';
    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        let cursorLineText = getCursorLineText()
        if (cursorLineText == undefined) return undefined 
        let classRange = flutterOpenCloseFinder.findRange(document, range)
        if (classRange != undefined) {
            return [this.createAction(getActivityEditor()!, classRange)]
        }

    }

    createAction(editor: vscode.TextEditor, range: vscode.Range): vscode.CodeAction {
        let data = "Extract Class"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.RefactorExtract);
        fix.command = { command: ExtractClassFixer.commandExtractClass, title: data, arguments: [editor, range] };
        fix.isPreferred = true;
        return fix;
    }

    // 註冊action 按下後的行為
    registerCommand(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandExtractClass, async (editor: vscode.TextEditor, range: vscode.Range) => {
            let text = getActivateText(range)
            let match = text.match(findClassRegex)

            createFileInPicker(editor, undefined, match == null ? undefined : match[1], range,(_) => {
                editor.edit(editBuilder => {
                    editBuilder.replace(new vscode.Range(new vscode.Position(range.start.line+1,0),new vscode.Position(range.end.line+1,range.end.character)), '')
                })
                editor.document.save()
                
            })
        }));
    }

}
