import exp = require('constants');
import * as vscode from 'vscode';
import * as terminal_util from '../utils/terminal_utils';
import * as env_utils from '../utils/env_utils';
import * as common from '../utils/common';
import * as path from 'path';


const command_open_github_repo = 'command_open_github_repo';
const command_open_github_actions = 'command_open_github_actions';
const command_open_github_wiki = 'command_open_github_wiki';
const command_open_sourcetree_local_repo = 'command_open_sourcetree_local_repo';


export function registerFastGithubCmd(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_repo, async () => {
        openGitHubBrowserAction(context, "repo");
    }));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_actions, async () => {
        openGitHubBrowserAction(context, "actions");
    }));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_github_wiki, async () => {
        openGitHubBrowserAction(context, "wiki");
    }));
    context.subscriptions.push(vscode.commands.registerCommand(command_open_sourcetree_local_repo, async () => {
        terminal_util.runTerminal("open -a SourceTree ./")
    }));
}

async function openGitHubBrowserAction(context: vscode.ExtensionContext, args: string) {
    const cwd = vscode.workspace.rootPath;
    let uri = await terminal_util.runCommand("cd " + cwd + " && git config --get remote.origin.url")
    uri = uri.replace("git@github.com:", "https://github.com/").split('.git')[0]
    switch (args) {
        case "repo":
            break
        case "pr":
            uri = uri + '/' + 'pulls'
            break
        case "actions":
        case "wiki":
            uri = uri + '/' + args
            break
    }
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri));

}

class ExtensionInfo {
    name: string;
    uri: string;
    branch: string;
    constructor(name: string, uri: string, branch: string) {
        this.name = name;
        this.uri = uri;
        this.branch = branch;
    }
}


function findGitExtension(data: any): ExtensionInfo[] {
    let gitExtensions: ExtensionInfo[] = [];
    let keys = Object.keys(data)

    for (let key of keys) {
        let extension = data[key]
        let gitInfo = extension['git']
        if (gitInfo != undefined) {
            gitExtensions.push(new ExtensionInfo(key, gitInfo['url'], gitInfo['ref']))
        }
    }
    return gitExtensions
}
let gitUrl = new Map<string, any>()
export async function updateFLutterGitExtension() {
    common.onFlutter(async (data) => {
        let gitExtensions: ExtensionInfo[] = findGitExtension(data['dependencies'])
        let extensionsVersion = new Map<string, any>()
        let extensionsItems = []

        for (let extension of gitExtensions) {
            let items = []
            let cmd = `git ls-remote --heads  --sort=-v:refname '${extension.uri}' | awk '{print $2}' `
            let branchs = await terminal_util.runCommand(cmd)
            let currentVersion = data['dependencies'][extension.name]['git']['ref']
            for (let branch of branchs.split('\n')) {
                branch = branch.replace('refs/heads/', '')
                if (branch != '') {
                    items.push({ label: branch, description: `current version => ${currentVersion}` })
                }
            }

            extensionsItems.push({ label: extension.name, description: `current version => ${currentVersion} `, url: extension.uri });
            extensionsVersion.set(extension.name, items)
            gitUrl.set(extension.name, extension.uri)
        }
        // 選擇要更新的擴展
        let extensionQuickPick = vscode.window.createQuickPick();
        extensionQuickPick.items = extensionsItems;
        extensionQuickPick.placeholder = 'Select extension';
        extensionQuickPick.onDidAccept(() => {
            let extension = extensionQuickPick.selectedItems[0].label
            console.log(`Selected item: ${extension}`);
            extensionQuickPick.dispose();
            let versionItems = extensionsVersion.get(extension)
            // 選擇version
            let versionPick = vscode.window.createQuickPick();
            versionPick.items = versionItems;
            versionPick.placeholder = 'Select version';
            versionPick.onDidAccept(() => {
                versionPick.dispose();
                let version = versionPick.selectedItems[0].label
                let currentVersion = versionPick.selectedItems[0].description?.split('=>')[versionPick.selectedItems[0].description?.split('=>').length - 1]
                currentVersion=currentVersion?.replace(' ','')
                let msg = ''
                if (currentVersion === version) {
                    msg = `${extension}目前版本${currentVersion} 強制更新 ${version}`
                }
                else {
                    msg = `${extension}目前版本${currentVersion} 確定要更新至 ${version}`
                }
                console.log(`Selected version: ${version}`);
                vscode.window.showInformationMessage(msg, '確定', '取消').then(async (option) => {
                    console.log(`asd`);

                    if (option === '確定') {
                        let searchValue = `${extension}:\n    git:\n      url: ${gitUrl.get(extension)}\n      ref: ${currentVersion}\n`
                        let yamlPath = path.join(vscode.workspace.rootPath ?? '', 'pubspec.yaml');
                        let replaceValue = `${extension}:\n    git:\n      url: ${gitUrl.get(extension)}\n      ref: ${version}\n`
                        // find yaml editor
                        let editor = vscode.window.visibleTextEditors.find(e => e.document.fileName === yamlPath)
                        if (!editor) {
                            return
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
                            await editor.edit((editBuilder) => {
                                editBuilder.replace(range, replaceValue);
                            });
                            // 刪除local ..pub-cache/test
                            let delPubCachePath: string = '.pub-cache/git';
                            env_utils.checkDirInEvn(() => {
                                vscode.window.showInformationMessage(`正在刪除${delPubCachePath}`)
                                env_utils.removeDirInEvn(
                                    () => {
                                        vscode.window.showInformationMessage(`已清理${delPubCachePath}`)
                                        terminal_util.runTerminal('flutter pub get')
                                    }, delPubCachePath)
                            },()=>{
                                vscode.window.showWarningMessage(`找不到${delPubCachePath}`)
                            } ,
                            delPubCachePath)

                        }
                    }
                });

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



      

    }, () => { }, true)




}

