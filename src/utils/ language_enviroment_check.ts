import path = require('path');
import * as vscode from 'vscode';
import { getPubspecAsMap } from './dart/pubspec/pubspec_utils';

export function editorIsDart() {
    return isEditorLanguage('dart');
}

export function isEditorLanguage(languageId: string) {
    return vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === languageId;
}

export async function onDart(onYamlParse: (pubspec: any) => any, onError: () => any, parseYaml: boolean = false) {
    if (vscode.workspace.rootPath == undefined) {
        return
    }

    let filePath = '**/pubspec.yaml';
    let yaml;
    const files = await vscode.workspace.findFiles(filePath);
    if (files.length <= 0) {
        console.log('當前不是flutter 專案');
        return onError()
    }
    if (parseYaml) {
        yaml = await getPubspecAsMap()
    }
    return onYamlParse(yaml)
}