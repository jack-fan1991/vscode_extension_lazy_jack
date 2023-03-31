import * as vscode from 'vscode';
import { toUpperCamelCase, toLowerCamelCase } from '../utils/regex_utils';
import { runTerminal } from '../utils/terminal_utils'
const command_dart_json_to_freezed = "command_dart_json_to_freezed"
let s;
let setter;
let arr: string[] = [];
const lowCamelPattern = /^[a-z]+([A-Z][a-z]+)*$/;
export function registerJsonToFreezed(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_json_to_freezed, async () => {
        await freezedGenerator()
        runTerminal('flutter pub run build_runner build --delete-conflicting-outputs', "build_runner")

    }));
}



const firstImport = `import 'package:freezed_annotation/freezed_annotation.dart';`;

let result: string[];

export async function freezedGenerator() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    let selectedText = editor.document.getText(selection);
    const document = editor.document;
    const fileName = document.fileName?.split("/").pop().split(".")[0];
    const fileNameGPart = `part '${fileName}.g.dart';`;
    const fileNameFPart = `part '${fileName}.freezed.dart';`;
    result = [];
    let e = new vscode.WorkspaceEdit()
    // add import
    let jsonObject;
    try {
        jsonObject = JSON.parse(selectedText);
    } catch (e) {
        vscode.window.showErrorMessage(`Json 格式錯誤 ${e}`)
        throw e;
    }
    let className = fileName.split('_').map(e => toUpperCamelCase(e)).join('');
    generateClassTemplate(jsonObject, className);
    // generateResponseData(className, jsonObject);
    let importResult: string[] = [firstImport, fileNameGPart, fileNameFPart,];
    e.replace(editor.document.uri, editor.selection, importResult.join('\n') + '\n\n' + result.reverse().join('\n\n'))
    vscode.workspace.applyEdit(e)


}


function generateClassTemplate(jsonObject: any, parentKey: string = ''): string {
    let prams: string[] = [];
    let isRequiredConstructor = true;
    let keys = Object.keys(jsonObject)
    let isArray = Array.isArray(jsonObject)
    try {
        if (isArray) {
            return arrayPramsFmt(jsonObject, parentKey)
        } else {
            for (let key of keys) {
                let child = jsonObject[key];
                let childType = typeof child
                let typeString = 'dynamic';
                let newParam;
                switch (childType) {
                    case 'string':
                        typeString = 'String';
                        newParam = pramsFmt(typeString, key)
                        prams.push(newParam)
                        break;
                    case 'number':
                        if (Number.isInteger(child)) {
                            typeString = 'int';
                        } else {
                            typeString = 'double';
                        }
                        newParam = pramsFmt(typeString, key)
                        prams.push(newParam)
                        break;
                    case 'boolean':
                        typeString = 'bool';
                        newParam = pramsFmt(typeString, key)
                        prams.push(newParam)
                        break;
                    case 'object':
                        if (child == null) {
                            newParam = pramsFmt(typeString, key)
                            prams.push(newParam)
                            break;
                        }
                        else if (Array.isArray(child)) {
                            typeString = generateClassTemplate(child, key)
                            prams.push(typeString)
                        } else {
                            // Object 拿Key當參數
                            generateClassTemplate(child, key)
                            typeString = pramsFmt(toUpperCamelCase(key), key)
                            prams.push(typeString)
                            break;
                        }

                }

            }
            result.push(generateClass(toUpperCamelCase(parentKey), prams))
            console.log(``);

        }

    } catch (e) {
        console.log(e);
        vscode.window.showErrorMessage(`${e}`)

    }
}

function pramsFmt(type: string, paramName: string): string {
    if (!lowCamelPattern.test(paramName)) {
        return `\t\t@JsonKey(name: '${paramName}')\tfinal ${type}? ${toLowerCamelCase(paramName)}`;

        return `// ignore: invalid_annotation_target\n\t\t@JsonKey(name: '${paramName}') final ${type}? ${toUpperCamelCase(paramName)}`;
    }
    return `final ${type}? ${paramName}`;
}

function arrayPramsFmt(jsonObject: any, parentName: string): string {
    let keys = Object.keys(jsonObject);
    let firstChild = jsonObject[keys[0]]
    let type = typeof firstChild
    let typeString = 'dynamic';
    switch (type) {
        case 'string':
            typeString = 'String';
            break;
        case 'number':
            if (Number.isInteger(firstChild)) {
                typeString = 'int';
            } else {
                typeString = 'double';
            }
            break;
        case 'boolean':
            typeString = 'bool';
            break;
        case 'object':
            break;

    }

    for (let key of keys) {
        let child = jsonObject[key]
        if (typeof child === 'object') {
            generateClassTemplate(child, parentName)
            return `@Default ([]) final List<${toUpperCamelCase(parentName)}> ${parentName}`;
        }
        if (typeof child != type) {
            typeString = 'dynamic';
            break;
        }

    }

    return `@Default([]) final List<${typeString}> ${parentName}`;
}

function isStringEndsWith(str: string, suffix: string): boolean {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function generateClass(className: string, params: string[]): string {
    className = toUpperCamelCase(className)
    let fromJsonMethod = `factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`;
    let toJsonMethod = `Map<String, dynamic> toJson() => _$${className}ToJson(this);`;

    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${params.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`
    console.log(`${clz}`);
    if (isStringEndsWith(className, 's')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz
}


