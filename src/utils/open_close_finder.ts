
import * as vscode from 'vscode';
import { biggerCloseRegex, biggerOpenRegex, findClassRegex, smallCloseRegex, smallOpenRegex, } from './regex_utils';


class OpenCloseFinder {
    openCount: number;
    closeCount: number;
    openRegExp: RegExp;
    closeRegExp: RegExp;
    constructor(openRegExp: RegExp, closeRegExp: RegExp) {
        this.openCount = 0;
        this.closeCount = 0;
        this.openRegExp = openRegExp;
        this.closeRegExp = closeRegExp;
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

    findRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range | undefined {
        this.reset()
        let classRange: vscode.Range | undefined = undefined;
        let startLine = range.start.line
        let endLine = range.start.line;
        let firstLineText = document.lineAt(startLine).text
        let match = firstLineText.match(this.openRegExp)
        if (match == null) return undefined
        let allText = document.getText(new vscode.Range(startLine, 0, document.lineCount + 1, 0))
        const lines = allText.split('\n');
        let currentText = ''
        for (let i = 0; i < lines.length; i++) {
            let lineText = lines[i];
            currentText += lineText + '\n'
            let matchOpen = lineText.match(this.openRegExp)
            let matchClose = lineText.match(this.closeRegExp)
            this.incrementOpen(matchOpen != null ? matchOpen.length : 0)
            this.incrementClose(matchClose != null ? matchClose.length : 0)
            if (this.isDirty()) {
                endLine++
            }
            else {
                endLine++
                classRange = new vscode.Range(startLine, 0, endLine, 0)
                let result = document.getText(classRange)
                break;
            }
        }
        return classRange
    }


    reset() {
        this.openCount = 0;
        this.closeCount = 0;
    }
}

export class BiggerOpenCloseFinder extends OpenCloseFinder {
    constructor() {
        super(biggerOpenRegex, biggerCloseRegex)
    }
}

export class SmallerOpenCloseFinder extends OpenCloseFinder {
    constructor() {
        super(smallOpenRegex, smallCloseRegex)
    }
}

export class FlutterOpenCloseFinder extends OpenCloseFinder {
    constructor() {
        super(biggerOpenRegex, biggerCloseRegex)
    }
    findRange(document: vscode.TextDocument, range: vscode.Range): vscode.Range | undefined {
        this.reset()
        let classRange: vscode.Range | undefined = undefined;
        let startLine = range.start.line
        let endLine = range.start.line;
        let firstLineText = document.lineAt(startLine).text
        let match = firstLineText.match(biggerOpenRegex)
        if (match == null) return undefined
        let allText = document.getText(new vscode.Range(startLine, 0, document.lineCount + 1, 0))
        const lines = allText.split('\n');
        let classMatch = firstLineText.match(findClassRegex)
        if (!classMatch) return undefined
        let className = classMatch![1]
        let currentText = ''
        for (let i = 0; i < lines.length; i++) {
            let lineText = lines[i];
            currentText += lineText + '\n'
            let matchOpen = lineText.match(this.openRegExp)
            let matchClose = lineText.match(this.closeRegExp)
            this.incrementOpen(matchOpen != null ? matchOpen.length : 0)
            this.incrementClose(matchClose != null ? matchClose.length : 0)
            if (currentText.includes('StatefulWidget') && !currentText.includes(`extends State<${className}>`)) {
                endLine++
            }
            else if (this.isDirty()) {
                endLine++
            }
            else {
                endLine++
                classRange = new vscode.Range(startLine, 0, endLine, 0)
                let result = document.getText(classRange)
                break;
            }
        }
        return classRange
    }
}