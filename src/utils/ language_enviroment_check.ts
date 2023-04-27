import path = require('path');
import * as vscode from 'vscode';
import { readFile } from './file_utils';
import { getPubspec } from './dart/pubspec/pubspec_utils';


export async function onDart(onYamlParse: (pubspec: any) => any, onError: () => any, parseYaml: boolean = false) {
    if (vscode.workspace.rootPath == undefined) {
        return
    }

    let absPath = path.join(vscode.workspace.rootPath, 'pubspec.yaml');
    let filePath = '**/pubspec.yaml';
    let yaml;
    const files = await vscode.workspace.findFiles(filePath);
    if (files.length <= 0) {
        console.log('當前不是flutter 專案');
        return onError()
    }
    if (parseYaml) {
        yaml = await getPubspec()
    }
    return onYamlParse(yaml)
}