import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { convertPathIfWindow, getRootPath, getWorkspacePath } from './vscode_utils';
import { type } from 'os';


export function showInfo2OptionMessage(msg: string, option1?: string, option2?: string, onOption1?: () => void) {
  vscode.window.showInformationMessage(msg, option1 ?? '執行', option2 ?? '取消').then((selectedOption) => {
    if (onOption1 == null) return;
    if (selectedOption === '執行') {
      onOption1();
    } else if (selectedOption === '取消') {
      // 取消相應的操作
    }
  });
}



export async function onFlutter(getData: (data: any) => any, errorData: () => any, returnData: boolean = false) {
  if (vscode.workspace.rootPath == undefined) {
    return
  }

  let absPath = path.join(vscode.workspace.rootPath, 'pubspec.yaml');
  let filePath = '**/pubspec.yaml';
  let data;
  const files = await vscode.workspace.findFiles(filePath);
  if (files.length <= 0) {
    console.log('當前不是flutter 專案');
    return errorData()
  }
  if (returnData) {
    data = await readFile(absPath)
  }
  return getData(data)
}

export async function onGit(getData: () => any[], errorData: () => any[]) {
  let workspace = getRootPath()
  if (fs.existsSync(`${workspace}/.git`)){
    return getData()
  }
}

function readFile(absPath: string): any {
  if (fs.existsSync(absPath)) {
    vscode.window.showInformationMessage(`正在解析 ${absPath}`, '關閉')
    const fileContents = fs.readFileSync(absPath, 'utf-8');
    return yaml.parse(fileContents);
  } else {
    console.error(`The file ${absPath} does not exist.`);
  }
}

export async function onTypeScript(getData: (data: any) => any, errorData: () => any, returnData: boolean = false) {
  if (vscode.workspace.rootPath == undefined) {
    return
  }
  let absPath = path.join(vscode.workspace.rootPath, 'package.json');
  let filePath = '**/package.json';
  let data;
  const files = await vscode.workspace.findFiles(filePath);
  if (files.length <= 0) {
    console.log('當前不是TypeScript 專案');
    return errorData()
  }
  if (returnData) {
    data = await readFile(absPath)
  }
  return getData(data)

}

export function showPicker(placeholder: string, items: any, onItemSelect: (item: any) => void) {
  let quickPick = vscode.window.createQuickPick();
  quickPick.placeholder = placeholder
  quickPick.items = items;
  quickPick.onDidAccept(() => onItemSelect(quickPick.selectedItems[0]));
  quickPick.show()
}



export async function openEditor(filePath: string, focus?: boolean): Promise<vscode.TextEditor | undefined> {
  filePath =convertPathIfWindow(filePath)
  if (!fs.existsSync(filePath)) return
  let editor = vscode.window.visibleTextEditors.find(e => convertPathIfWindow(e.document.fileName)  === filePath)
  if (!editor) {
    await vscode.workspace.openTextDocument(filePath).then(async (document) =>
      editor = await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, focus ?? false).then(editor => editor))
  }
  return editor
}

export async function hideEditor(filePath: string, focus?: boolean) {
  if (!fs.existsSync(filePath)) return
  let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === filePath)
  if (editor) {
    editor.hide()
  }
}


