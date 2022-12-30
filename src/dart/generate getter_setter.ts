import * as vscode from 'vscode';
const command_dart_generate_getter_setter = "command_dart_generate_getter_setter"
let s;
let setter;
let arr: string[] = [];

export function registerGenerateGetterSetter(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_generate_getter_setter, async () => {
        generator()
    }));
}

function generator() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    let text = editor.document.getText(selection);
    if (text.length < 1) {
        vscode.window.showErrorMessage('No selected properties.');
        return;
    }
    let properties = text.split(/\r?\n/).filter(x => x.length > 2).map(x => x.replace(';', ''));
    let generatedMethods: string[] = [];
    for (let p of properties) {
        console.log(p)
        generatedMethods = generateGetterAndSetter(p);
    }

    editor.edit(
        edit => editor.selections.forEach(
            selection => {
                edit.insert(selection.end, generatedMethods.join("\n"));
            }
        )
    );
}

function generateGetterAndSetter(prop: string): string[] {
    const editor = vscode.window.activeTextEditor;

    let type = prop.split(" ").splice(0)[0];
    if (prop.includes("=")) {
        prop = prop.substring(0, prop.lastIndexOf("=")).trim()
    }
    let variableName = prop.split(" ").slice(-1);
    let varUpprName = variableName.toString().charAt(0).toUpperCase() + variableName.toString().slice(1);
    if (prop.includes("_")) {
        let varLowerName = variableName.toString().charAt(0).toLowerCase() + variableName.toString().slice(1);
        s = `\n ${type} get ${varLowerName.replace("_", "")} => this.${variableName};`;
        setter = `\n set ${varLowerName.replace("_", "")}(${type} value) => this.${variableName} = value;`;
    }
    else {
        s = `\n ${type} get get${varUpprName} => this.${variableName};`;
        setter = `\n set set${varUpprName}(${type} ${variableName}) => this.${variableName} = ${variableName};`;
    }
    let uri = vscode.window.activeTextEditor.document.getText();
    if (uri.includes(`=> this.${variableName}`)) {
        vscode.window.showErrorMessage('Setter and Getter already created.');
        return [];
    }
    arr.push(s, setter);
    let sets = new Set(arr);
    let it = sets.values();
    arr = Array.from(it);
    return arr;
}