import * as vscode from 'vscode';
import {  EzCodeActionProviderInterface } from '../../code_action';
import { biggerCloseRegex, biggerOpenRegex, findClassRegex,   } from '../../../utils/regex_utils';
import { createFileInPicker, getActivityEditor, getCursorLineText } from '../../../utils/file_utils';
import { getActivateText } from '../../../utils/vscode_utils';

export class Counter {
    openCount: number;
    closeCount: number;
    constructor() {
        this.openCount = 0;
        this.closeCount = 0;
    }

    isDirty(): Boolean {
        return this.openCount != this.closeCount
    }

    incrementOpen(number: number) {
        this.openCount += number;
    }

    incrementClose(number: number) {
        this.closeCount += number;
    }
    decrementOpen(number: number) {
        this.openCount -= number;
    }

    decrementClose(number: number) {
        this.closeCount -= number;
    }

    reset() {
        this.openCount = 0;
        this.closeCount = 0;
    }
}

const counter = new Counter();




export class ExtractClassFixer implements EzCodeActionProviderInterface {

    getLangrageType(): vscode.DocumentSelector {
        return { scheme: 'file' }
    }

    public static readonly commandExtractClass = 'ExtractClassFixer.extract.class';
    // 編輯時對單行檢測
    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        let cursorLineText = getCursorLineText()
        if (cursorLineText == undefined) return undefined
        let classMatch = cursorLineText.match(findClassRegex)
        if (!classMatch) return undefined
        let className = classMatch![1]
        let classRange: vscode.Range | undefined = undefined;
        counter.reset();
        let start = range.start.line
        let match = cursorLineText.match(biggerOpenRegex)
        {
            {
                if (match != null) {
                    let allText = document.getText(new vscode.Range(start, 0, document.lineCount + 1, 0))
                    const lines = allText.split('\n');
                    let startLine = range.start.line;
                    let endLine = range.start.line;
                    let currentText = ''
                    for (let i = 0; i < lines.length; i++) {
                        let lineText = lines[i];
                        currentText += lineText + '\n'
                        let matchOpen = lineText.match(biggerOpenRegex)
                        let matchClose = lineText.match(biggerCloseRegex)
                        counter.incrementOpen(matchOpen != null ? matchOpen.length : 0)
                        counter.incrementClose(matchClose != null ? matchClose.length : 0)
                        if (currentText.includes('StatefulWidget') && !currentText.includes(`extends State<${className}>`)) {
                            endLine++
                        }
                        else if (counter.isDirty()) {
                            endLine++
                        }
                        else {
                            endLine++
                            classRange = new vscode.Range(startLine, 0, endLine, 0)
                            let result = document.getText(classRange)
                            break;
                        }
                    }

                }
                if (classRange != undefined) {
                    return [this.createAction(getActivityEditor()!, classRange)]
                }

            }
        }
    }

    createAction(editor: vscode.TextEditor, range: vscode.Range): vscode.CodeAction {
        let data = "Extract Class"
        const fix = new vscode.CodeAction(data, vscode.CodeActionKind.RefactorExtract);
        fix.command = { command: ExtractClassFixer.commandExtractClass, title: data, arguments: [editor,range] };
        fix.isPreferred = true;
        return fix;
    }

    // 註冊action 按下後的行為
    setOnActionCommandCallback(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand(ExtractClassFixer.commandExtractClass, async (editor: vscode.TextEditor, range: vscode.Range) => {
            let text = getActivateText(range)
            let match = text.match(findClassRegex)                
            
            createFileInPicker(editor, undefined, match == null ? undefined : match[1], range)
        }));
    }

}
