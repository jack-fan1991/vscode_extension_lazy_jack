import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';


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



export async function onFlutter(getData: (data: any) => any, errorData: () => any, needData: boolean = false) {
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
  if (needData) {
    if (fs.existsSync(absPath)) {
      vscode.window.showInformationMessage(`正在解析 ${absPath}`, '關閉')

      const fileContents = fs.readFileSync(absPath, 'utf-8');
      data = yaml.parse(fileContents);
    } else {
      console.error(`The file ${absPath} does not exist.`);
    }
  }
  return getData(data)
}

export async function onGit(getData: () => any[], errorData: () => any[]) {
  const files = await vscode.workspace.findFiles('**/.gitignore', '**/android/**', 1);
  if (files.length <= 0) {
    console.log('當前不是 git 專案');
    return errorData()

  }
  return getData()
}


export async function onTypeScript(getData: () => any[], errorData: () => any[]) {
  const files = await vscode.workspace.findFiles('**/package.json', '**/ios/**');
  if (files.length <= 0) {
    console.log('當前不是TypeScript 專案');
    return errorData()
  }
  return getData()
}


export async function replaceTextInFile(filePath: string, searchValue: string, replaceValue: string) {
  let text = fs.readFileSync(filePath, 'utf-8');
  const lines = text.split(/\r?\n/);

  let found = false;
  let newLines = [];
  for (let line of lines) {
    if (line.trim().startsWith(searchValue)) {
      newLines.push(replaceValue);
      found = true;
    } else {
      newLines.push(line);
    }
  }

  if (found) {
    text = newLines.join('\n');
    fs.writeFileSync(filePath, text, 'utf-8');
  }
}