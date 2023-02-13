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
exports.publishVsCodeExtension = void 0;
const vscode = require("vscode");
const terminal_util = require("../utils/terminal_utils");
const env_utils = require("../utils/env_utils");
const common = require("../utils/common");
const path = require("path");
const http = require("../utils/http");
const cheerio_1 = require("cheerio");
function publishVsCodeExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        common.onTypeScript(onPackageJsonParse, () => { }, true);
    });
}
exports.publishVsCodeExtension = publishVsCodeExtension;
class DependenciesInfo {
    constructor(name, uri, branch) {
        this.name = name;
        this.uri = uri;
        this.branch = branch;
    }
}
function findGitExtension(data) {
    let gitExtensions = [];
    let keys = Object.keys(data);
    for (let key of keys) {
        let extension = data[key];
        let gitInfo = extension['git'];
        if (gitInfo != undefined) {
            gitExtensions.push(new DependenciesInfo(key, gitInfo['url'], gitInfo['ref']));
        }
    }
    return gitExtensions;
}
let gitUrl = new Map();
const onVersionSelect = function onVersionSelect(dependencies, item) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let version = item.label;
        let currentVersion = (_a = item.description) === null || _a === void 0 ? void 0 : _a.split('=>')[((_b = item.description) === null || _b === void 0 ? void 0 : _b.split('=>').length) - 1];
        currentVersion = currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.replace(' ', '');
        let msg = '';
        if (currentVersion === version) {
            msg = `${dependencies}目前版本${currentVersion} 強制更新 ${version}`;
        }
        else {
            msg = `${dependencies}目前版本${currentVersion} 確定要更新至 ${version}`;
        }
        console.log(`Selected version: ${version}`);
        vscode.window.showInformationMessage(msg, '確定', '取消').then((option) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            if (option === '確定') {
                let searchValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${currentVersion}\n`;
                let yamlPath = path.join((_c = vscode.workspace.rootPath) !== null && _c !== void 0 ? _c : '', 'pubspec.yaml');
                let replaceValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${version}\n`;
                // find yaml editor
                let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === yamlPath);
                if (!editor) {
                    return;
                }
                // 修改yaml 中的 version
                const document = editor.document;
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
                const textRange = new vscode.Range(start, end);
                const text = document.getText();
                const startIndex = text.indexOf(searchValue);
                if (startIndex !== -1) {
                    const endIndex = startIndex + searchValue.length;
                    const range = new vscode.Range(document.positionAt(startIndex), document.positionAt(endIndex));
                    yield editor.edit((editBuilder) => {
                        editBuilder.replace(range, replaceValue);
                    });
                    // 刪除local ..pub-cache/test
                    let delPubCachePath = '.pub-cache/git';
                    env_utils.checkDirInEvn(() => {
                        vscode.window.showInformationMessage(`正在刪除${delPubCachePath}`);
                        env_utils.removeDirInEvn(() => {
                            vscode.window.showInformationMessage(`已清理${delPubCachePath}`);
                            terminal_util.runTerminal('flutter pub get');
                        }, delPubCachePath);
                    }, () => {
                        vscode.window.showWarningMessage(`找不到${delPubCachePath}`);
                    }, delPubCachePath);
                }
            }
        }));
    });
};
const onPackageJsonParse = function onPubspecYamlParse(data) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let uri = `https://marketplace.visualstudio.com/items?itemName=${data['publisher']}.${data['name']}`;
        let body = yield http.getWebData(uri);
        let $ = cheerio_1.default.load(body);
        let lastVersion = (_b = (_a = $('meta[property="og:image"]').attr('content')) === null || _a === void 0 ? void 0 : _a.split('/')[6]) !== null && _b !== void 0 ? _b : "";
        console.log(lastVersion);
        let currentVersion = data['version'];
        let versionSplit = lastVersion.split('.');
        let updateVersion = +versionSplit[versionSplit.length - 1];
        updateVersion++;
        let searchValue = `version": "${currentVersion}"`;
        let replacePath = path.join((_c = vscode.workspace.rootPath) !== null && _c !== void 0 ? _c : '', 'package.json');
        versionSplit[versionSplit.length - 1] = `${updateVersion}`;
        let replaceVersion = versionSplit.join('.');
        let replaceValue = `version": "${replaceVersion}"`;
        vscode.window.showInformationMessage(`${data['displayName']}${currentVersion} update to ${replaceValue}`, 'publish', 'build and publish').then((options) => __awaiter(this, void 0, void 0, function* () {
            yield common.replaceText(replacePath, searchValue, replaceValue);
            if (options === 'publish') {
                terminal_util.runTerminal("vsce publish");
            }
            else {
                yield terminal_util.runCommand("npm run build", (stdout) => {
                    terminal_util.runTerminal("vsce publish");
                });
            }
        }));
    });
};
//# sourceMappingURL=ts_utils.js.map