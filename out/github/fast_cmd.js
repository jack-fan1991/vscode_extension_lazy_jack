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
exports.updateFLutterGitExtension = exports.registerFastGithubCmd = void 0;
const vscode = require("vscode");
const terminal_util = require("../utils/terminal_utils");
const env_utils = require("../utils/env_utils");
const common = require("../utils/common");
const path = require("path");
const command_open_github_repo = 'command_open_github_repo';
const command_open_github_actions = 'command_open_github_actions';
const command_open_github_wiki = 'command_open_github_wiki';
const command_open_sourcetree_local_repo = 'command_open_sourcetree_local_repo';
function registerFastGithubCmd(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_repo, () => __awaiter(this, void 0, void 0, function* () {
        openGitHubBrowserAction(context, "repo");
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_actions, () => __awaiter(this, void 0, void 0, function* () {
        openGitHubBrowserAction(context, "actions");
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_wiki, () => __awaiter(this, void 0, void 0, function* () {
        openGitHubBrowserAction(context, "wiki");
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_sourcetree_local_repo, () => __awaiter(this, void 0, void 0, function* () {
        terminal_util.runTerminal("open -a SourceTree ./");
    })));
}
exports.registerFastGithubCmd = registerFastGithubCmd;
function openGitHubBrowserAction(context, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const cwd = vscode.workspace.rootPath;
        let uri = yield terminal_util.runCommand("cd " + cwd + " && git config --get remote.origin.url");
        uri = uri.replace("git@github.com:", "https://github.com/").split('.git')[0];
        switch (args) {
            case "repo":
                break;
            case "pr":
                uri = uri + '/' + 'pulls';
                break;
            case "actions":
            case "wiki":
                uri = uri + '/' + args;
                break;
        }
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri));
    });
}
class ExtensionInfo {
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
            gitExtensions.push(new ExtensionInfo(key, gitInfo['url'], gitInfo['ref']));
        }
    }
    return gitExtensions;
}
let gitUrl = new Map();
function updateFLutterGitExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        common.onFlutter((data) => __awaiter(this, void 0, void 0, function* () {
            let gitExtensions = findGitExtension(data['dependencies']);
            let extensionsVersion = new Map();
            let extensionsItems = [];
            for (let extension of gitExtensions) {
                let items = [];
                let cmd = `git ls-remote --heads  --sort=-v:refname '${extension.uri}' | awk '{print $2}' `;
                let branchs = yield terminal_util.runCommand(cmd);
                let currentVersion = data['dependencies'][extension.name]['git']['ref'];
                for (let branch of branchs.split('\n')) {
                    branch = branch.replace('refs/heads/', '');
                    if (branch != '') {
                        items.push({ label: branch, description: `current version => ${currentVersion}` });
                    }
                }
                extensionsItems.push({ label: extension.name, description: `current version => ${currentVersion} `, url: extension.uri });
                extensionsVersion.set(extension.name, items);
                gitUrl.set(extension.name, extension.uri);
            }
            // 選擇要更新的擴展
            let extensionQuickPick = vscode.window.createQuickPick();
            extensionQuickPick.items = extensionsItems;
            extensionQuickPick.placeholder = 'Select extension';
            extensionQuickPick.onDidAccept(() => {
                let extension = extensionQuickPick.selectedItems[0].label;
                console.log(`Selected item: ${extension}`);
                extensionQuickPick.dispose();
                let versionItems = extensionsVersion.get(extension);
                // 選擇version
                let versionPick = vscode.window.createQuickPick();
                versionPick.items = versionItems;
                versionPick.placeholder = 'Select version';
                versionPick.onDidAccept(() => {
                    var _a, _b;
                    versionPick.dispose();
                    let version = versionPick.selectedItems[0].label;
                    let currentVersion = (_a = versionPick.selectedItems[0].description) === null || _a === void 0 ? void 0 : _a.split('=>')[((_b = versionPick.selectedItems[0].description) === null || _b === void 0 ? void 0 : _b.split('=>').length) - 1];
                    currentVersion = currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.replace(' ', '');
                    let msg = '';
                    if (currentVersion === version) {
                        msg = `${extension}目前版本${currentVersion} 強制更新 ${version}`;
                    }
                    else {
                        msg = `${extension}目前版本${currentVersion} 確定要更新至 ${version}`;
                    }
                    console.log(`Selected version: ${version}`);
                    vscode.window.showInformationMessage(msg, '確定', '取消').then((option) => __awaiter(this, void 0, void 0, function* () {
                        var _c;
                        console.log(`asd`);
                        if (option === '確定') {
                            let searchValue = `${extension}:\n    git:\n      url: ${gitUrl.get(extension)}\n      ref: ${currentVersion}\n`;
                            let yamlPath = path.join((_c = vscode.workspace.rootPath) !== null && _c !== void 0 ? _c : '', 'pubspec.yaml');
                            let replaceValue = `${extension}:\n    git:\n      url: ${gitUrl.get(extension)}\n      ref: ${version}\n`;
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
                    // showInfo2OptionMessage(`Hard reset  to ${hash}`, undefined, undefined, () => (
                    //     terminal.sendText(`git reset --hard ${hash}`)
                    // )
                    // );
                });
                versionPick.show();
            });
            extensionQuickPick.show();
            //get all branch
            // let branch = terminal_util.runCommand(`git branch -r | awk '{print $1}' | sed 's/origin\///g'`)
        }), () => { }, true);
    });
}
exports.updateFLutterGitExtension = updateFLutterGitExtension;
//# sourceMappingURL=fast_cmd.js.map