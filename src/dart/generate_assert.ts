import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { openEditor } from '../utils/common';
const command_dart_assert = "command_dart_assert"


export function registerGenerateAssert(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_assert, async (folderUri) => {
        generator(folderUri)
    }));
}

async function generator(folderUri: any) {
    const cwd = vscode.workspace.rootPath ?? "";
    const files = fs.readdirSync(folderUri.path).filter((x) => x.includes('.svg'));
    let svgFolder = folderUri.path.replace(cwd, '').split('/').filter((x: string) => x != "").join('/')

    let fileName = svgFolder.split('/').filter((x: string) => x != "").join('_')
    const assertPath = path.join(cwd, `lib/const/${fileName}.dart`);
    if (!fs.existsSync(assertPath)) {
        fs.writeFileSync(assertPath, "");
    }
    let editor: vscode.TextEditor | undefined = await openEditor(assertPath)
    if (!editor) {
        return
    }
    let text = editor.document.getText()
    let match = text.match(RegExp(/enum\s+SvgIcon\s+{([\s\S]*?)\}/))
    if (!match) {
        console.log('Enum SvgIcon not found');
        process.exit(1);
    }
    // 从匹配结果中提取枚举成员和图标文件名
    const enumContent = match[1];
    const members = enumContent
        .split(/[\r\n]+/) // 按行分割
        .map((line) => line.trim()) // 去掉行首行尾的空白
        .filter((line) => line !== '') // 过滤空行
        .map((line) => line.match(/^(\w+)\('(.*)'\),?$/)) // 提取成员和文件名
        .filter((match) => match !== null) // 过滤不匹配的行
        .map((match) => match!.slice(1, 3)); //

    let svg: string[] = files.map(item => {
        let currentName=members.filter(([_,path])=>path.replace(`${svgFolder}/`,'')===item)[0]
        if(currentName !=null){
            return  `${currentName[0]}('${currentName[1]}')`;
        }
        // 获取文件名
        const fileName = item.replace(/\.svg$/, '').replace('-', '_');
        // 获取函数名
        const funcName = fileName.replace('icon_', '').replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
        // 返回格式化后的字符串
        return `${funcName}('${svgFolder}/${item}')`;
    });
    fs.writeFileSync(assertPath, temp(svg));
    await vscode.workspace.openTextDocument(assertPath).then(async (document) =>
        await vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false))

}

function temp(svgObj: string[]) {
    return `import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
  
extension IconMaker on SvgIcon {
    Widget toIcon({double? width, double? height,Color? color}) => SvgPicture.asset(
        path,
        width: width,
        height: height,
        color:color
      );
}
  
enum SvgIcon {
  ${svgObj.join(',\n\t')};

  final String path;
  const SvgIcon(this.path);
}
`
}