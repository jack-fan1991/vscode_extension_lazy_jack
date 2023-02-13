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
function updateFLutterGitExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        common.onFlutter(onPubspecYamlParse, () => { }, true);
    });
}
exports.updateFLutterGitExtension = updateFLutterGitExtension;
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
            console.log(`asd`);
            if (option === '確定') {
                let searchValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${currentVersion}\n`;
                let yamlPath = path.join((_c = vscode.workspace.rootPath) !== null && _c !== void 0 ? _c : '', 'pubspec.yaml');
                let replaceValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${version}\n`;
                // 修改yaml 中的 version
                let replace = yield common.replaceText(yamlPath, searchValue, replaceValue);
                if (!replace) {
                    return;
                }
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
        }));
    });
};
const onPubspecYamlParse = function onPubspecYamlParse(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let gitDependencies = findGitExtension(data['dependencies']);
        let dependenciesVersionCache = new Map();
        let dependenciesNames = [];
        for (let dependencies of gitDependencies) {
            let items = [];
            let cmd = `git ls-remote --heads  --sort=-v:refname '${dependencies.uri}' | awk '{print $2}' `;
            let allBranch = yield terminal_util.runCommand(cmd);
            let currentVersion = data['dependencies'][dependencies.name]['git']['ref'];
            for (let branch of allBranch.split('\n')) {
                branch = branch.replace('refs/heads/', '');
                if (branch != '') {
                    items.push({ label: branch, description: `current version => ${currentVersion}` });
                }
            }
            dependenciesNames.push({ label: dependencies.name, description: `current version => ${currentVersion} `, url: dependencies.uri });
            dependenciesVersionCache.set(dependencies.name, items);
            gitUrl.set(dependencies.name, dependencies.uri);
        }
        // 選擇要更新的擴展
        common.showPicker('Select dependencies', dependenciesNames, (item) => {
            let dependencies = item.label;
            let versionItems = dependenciesVersionCache.get(dependencies);
            console.log(`Selected dependencies: ${dependencies}`);
            common.showPicker('Select version', versionItems, (item) => onVersionSelect(dependencies, item));
        });
    });
};
//# sourceMappingURL=github_utils.js.map