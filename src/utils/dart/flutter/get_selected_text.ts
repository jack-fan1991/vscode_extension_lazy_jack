import { TextEditor, Selection, Position } from "vscode";
import * as vscode from "vscode";

const openBracket = "(";
const closeBracket = ")";

import { commands, SnippetString, window } from "vscode";

const interpolatedVarRegExp = new RegExp("\\$", "g");



export const wrapWith = async (snippet: (widget: string) => string) => {
    let editor = window.activeTextEditor;
    if (!editor) return;
    const selection = getSelectedText(editor);
    const widget = editor.document.getText(selection).replace(
        interpolatedVarRegExp,
        "\\$",
    );
    editor.insertSnippet(new SnippetString(snippet(widget)), selection);
    await commands.executeCommand("editor.action.formatDocument");
};


export const getSelectedText = (editor: TextEditor): Selection => {
    const emptySelection = new Selection(
        editor.document.positionAt(0),
        editor.document.positionAt(0)
    );
    const language = editor.document.languageId;
    if (language != "dart") return emptySelection;

    const line = editor.document.lineAt(editor.selection.start);
    const lineText = line.text;
    const openBracketIndex = line.text.indexOf(
        openBracket,
        editor.selection.anchor.character
    );

    let widgetStartIndex =
        openBracketIndex > 1
            ? openBracketIndex - 1
            : editor.selection.anchor.character;
    for (widgetStartIndex; widgetStartIndex > 0; widgetStartIndex--) {
        const currentChar = lineText.charAt(widgetStartIndex);
        const isBeginningOfWidget =
            currentChar === openBracket ||
            (currentChar === " " && lineText.charAt(widgetStartIndex - 1) !== ",");
        if (isBeginningOfWidget) break;
    }
    widgetStartIndex++;

    if (openBracketIndex < 0) {
        const commaIndex = lineText.indexOf(",", widgetStartIndex);
        const bracketIndex = lineText.indexOf(closeBracket, widgetStartIndex);
        const endIndex =
            commaIndex >= 0
                ? commaIndex
                : bracketIndex >= 0
                    ? bracketIndex
                    : lineText.length;
        let selection = new Selection(
            new Position(line.lineNumber, widgetStartIndex),
            new Position(line.lineNumber, endIndex)
        );
        let text = editor.document.getText(selection)
        return selection
    }

    let bracketCount = 1;
    for (let l = line.lineNumber; l < editor.document.lineCount; l++) {
        const currentLine = editor.document.lineAt(l);
        let c = l === line.lineNumber ? openBracketIndex + 1 : 0;
        for (c; c < currentLine.text.length; c++) {
            const currentChar = currentLine.text.charAt(c);
            if (currentChar === openBracket) bracketCount++;
            if (currentChar === closeBracket) bracketCount--;
            if (bracketCount === 0) {
       
                let selection =  new Selection(
                    new Position(line.lineNumber, widgetStartIndex),
                    new Position(l, c + 1)
                );
                let text = editor.document.getText(selection)
                return selection
            }
        }
    }

    return emptySelection;
};
// async function createNewFile() {
//     // 讓使用者選擇儲存位置
//     const uri = await vscode.window.showSaveDialog();
//     if (!uri) {
//       // 如果使用者取消了操作，則退出函數
//       return;
//     }
  
//     // 創建一個空的文件
//     fs.writeFileSync(uri.fsPath, '');
  
//     // 打開新創建的文件
//     const document = await vscode.workspace.openTextDocument(uri);
//     await vscode.window.showTextDocument(document);
//   }