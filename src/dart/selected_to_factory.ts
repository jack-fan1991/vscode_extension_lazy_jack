import * as vscode from 'vscode';
import { extendsClassRegex, firstClassRegex as findFirstClassNameRegex } from '../utils/regex_utils';
const command_dart_selected_to_factory = "command_dart_selected_to_factory"


export function registerCommandDartSelectedToFactory(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_selected_to_factory, async () => {
        generator()
    }));
}

async function generator() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    let text = editor.document.getText(selection);
    if (text.length < 1) {
        vscode.window.showErrorMessage('No selected properties.');
        return;
    }
    let match = text.match(findFirstClassNameRegex)
    if (match == null) {
        vscode.window.showErrorMessage("No class name in selected text")
        return
    }
    let className = match[1]

    let properties = text.split(/\r?\n/).filter(x => !x.includes("class") && !x.includes("{") && !x.includes("}") && !x.includes(",")).filter(x => x.length > 2).map(x => x.replace(';', ''));
    let factoryParams: string[] = [];
    let factoryRequiredParams: string[] = [];
    let classParams: string[] = [];
    let classRequiredParams: string[] = [];
    let extendsClassMatch = text.match(extendsClassRegex)
    let extendsClass = extendsClassMatch == null ? "" : extendsClassMatch[1]
    let isWidget = extendsClass.includes('StatefulWidget') || extendsClass.includes('StatelessWidget')
    if (isWidget) {
        factoryRequiredParams.push("Key? key")
        classRequiredParams.push("key:key")
    }
    for (let p of properties) {
        console.log(p)
        let parseResult = generateGetterAndSetter(p,);
        console.log(parseResult)
        if (parseResult[0].includes('required')) {
            factoryRequiredParams.push(parseResult[0])
            classRequiredParams.push(parseResult[1])
        } else {
            factoryParams.push(parseResult[0])
            classParams.push(parseResult[1])
        }
    }
    let r = await createFactory(className, [...factoryRequiredParams, ...factoryParams], [...classRequiredParams, ...classParams])
    console.log(r);

    editor.edit(
        edit => editor.selections.forEach(
            selection => {
                edit.insert(selection.end, r);
            }
        )
    );
}

async function createFactory(className: string, factoryParams: string[], classParams: string[]): Promise<string> {

    let name = await vscode.window.showInputBox({
        prompt: 'Enter your name'
    }).then(name => name) ?? "init"

    return `\n\tfactory ${className}.${name}({
\t\t${factoryParams.join(',\n\t\t')}
 }) =>\t\t\t
    ${className}(\n\t\t\t\t\t${classParams.join(',\n\t\t\t\t\t')}\n);`
}

function splitField(fieldString: string): string[] {
    let split: string[] = []
    let list = fieldString.split(" ")
    let index = 0
    for (let s of list) {
        index = list.indexOf(s)
        let functionPram = ''
        if (s.includes('(')) {
            let previous = list[list.indexOf(s) - 1]
            split = split.filter((x) => x != previous)
        }
        else if (s.includes(')')) {
            let previous2 = list[list.indexOf(s) - 2]
            let previous = list[list.indexOf(s) - 1]
            split.push(`${previous2} ${previous} ${s}`)
        }
        else {
            split.push(s)
            index++
        }

    }
    return split
}

function generateGetterAndSetter(prop: string): string[] {
    let result: string[] = []
    let isFinal = false
    let start = 0;
    let type = ""
    let fieldName = ""
    for (let s of prop) {
        if (s != " ") {
            start = prop.indexOf(s)
            break
        }
    }
    prop = prop.slice(start)
    let fieldStringArray = splitField(prop);
    isFinal = fieldStringArray.filter((x) => x.includes('final')).length > 0;
    if (isFinal) {
        type = fieldStringArray[1]
        fieldName = fieldStringArray[2]


    } else {
        type = fieldStringArray[0]
        fieldName = fieldStringArray[1]

    }
    if (type.includes('?')) {
        result.push(`${type} ${fieldName}`)
        result.push(`${fieldName}:${fieldName}`)
    } else {
        result.push(`required ${type} ${fieldName}`)
        result.push(`${fieldName}:${fieldName}`)

    }
    return result

}