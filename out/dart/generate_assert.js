"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateAssert = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const common_1 = require("../utils/common");
const command_dart_assert = "command_dart_assert";
function registerGenerateAssert(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_assert, (folderUri) => __awaiter(this, void 0, void 0, function* () {
        generator(folderUri);
    })));
}
exports.registerGenerateAssert = registerGenerateAssert;
function generator(folderUri) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = (_a = vscode.workspace.rootPath) !== null && _a !== void 0 ? _a : "";
        const files = fs.readdirSync(folderUri.path).filter((x) => x.includes('.svg'));
        let svgFolder = folderUri.path.replace(cwd, '').split('/').filter((x) => x != "").join('/');
        let fileName = svgFolder.split('/').filter((x) => x != "").join('_');
        const assertPath = path.join(cwd, `lib/const/${fileName}.dart`);
        if (!fs.existsSync(assertPath)) {
            fs.writeFileSync(assertPath, "");
        }
        let editor = yield (0, common_1.openEditor)(assertPath);
        if (!editor) {
            return;
        }
        let text = editor.document.getText();
        let match = text.match(RegExp(/enum\s+SvgIcon\s+{([\s\S]*?)\}/));
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
            .map((match) => match.slice(1, 3)); //
        let svg = files.map(item => {
            let currentName = members.filter(([_, path]) => path.replace(`${svgFolder}/`, '') === item)[0];
            if (currentName != null) {
                return `${currentName[0]}('${currentName[1]}')`;
            }
            // 获取文件名
            const fileName = item.replace(/\.svg$/, '').replace('-', '_');
            // 获取函数名
            const funcName = fileName.replace('icon_', '').replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());
            // 返回格式化后的字符串
            return `${funcName}('${svgFolder}/${item}')`;
        });
        fs.writeFileSync(assertPath, temp(svg));
        yield vscode.workspace.openTextDocument(assertPath).then((document) => __awaiter(this, void 0, void 0, function* () { return yield vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false); }));
    });
}
function temp(svgObj) {
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
`;
}
//# sourceMappingURL=generate_assert.js.map