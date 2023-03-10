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

export async function updateFLutterGitExtension() {
    common.onFlutter(onPubspecYamlParse, () => { }, true)
}



class DependenciesInfo {
    name: string;
    uri: string;
    branch: string;
    constructor(name: string, uri: string, branch: string) {
        this.name = name;
        this.uri = uri;
        this.branch = branch;
    }
}


function findGitExtension(data: any): DependenciesInfo[] {
    let gitExtensions: DependenciesInfo[] = [];
    let keys = Object.keys(data)

    for (let key of keys) {
        let extension = data[key]
        let gitInfo = extension['git']
        if (gitInfo != undefined) {
            gitExtensions.push(new DependenciesInfo(key, gitInfo['url'], gitInfo['ref']))
        }
    }
    return gitExtensions
}
let gitUrl = new Map<string, any>()

const onVersionSelect = async function onVersionSelect(dependencies: string, item: any) {
    let version = item.label
    let currentVersion = item.description?.split('=>')[item.description?.split('=>').length - 1]
    currentVersion = currentVersion?.replace(' ', '')
    let msg = ''
    if (currentVersion === version) {
        msg = `${dependencies}????????????${currentVersion} ???????????? ${version}`
    }
    else {
        msg = `${dependencies}????????????${currentVersion} ?????????????????? ${version}`
    }
    console.log(`Selected version: ${version}`);
    vscode.window.showInformationMessage(msg, '??????', '??????').then(async (option) => {
        console.log(`asd`);

        if (option === '??????') {
            let searchValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${currentVersion}\n`
            let yamlPath = path.join(vscode.workspace.rootPath ?? '', 'pubspec.yaml');
            let replaceValue = `${dependencies}:\n    git:\n      url: ${gitUrl.get(dependencies)}\n      ref: ${version}\n`
            // ??????yaml ?????? version
            let replace = await common.replaceText(yamlPath, searchValue, replaceValue);
            if (!replace) {
                return
            }
            // ??????local ..pub-cache/test
            let delPubCachePath: string = '.pub-cache/git';
            env_utils.checkDirInEvn(() => {
                vscode.window.showInformationMessage(`????????????${delPubCachePath}`)
                env_utils.removeDirInEvn(
                    () => {
                        vscode.window.showInformationMessage(`?????????${delPubCachePath}`)
                        terminal_util.runTerminal('flutter pub get')
                    }, delPubCachePath)
            }, () => {
                vscode.window.showWarningMessage(`?????????${delPubCachePath}`)
            },
                delPubCachePath)

        }
    });

}

const onPubspecYamlParse = async function onPubspecYamlParse(data: any) {
    let gitDependencies: DependenciesInfo[] = findGitExtension(data['dependencies'])
    let dependenciesVersionCache = new Map<string, any>()
    let dependenciesNames = []

    for (let dependencies of gitDependencies) {
        let items = []
        let cmd = `git ls-remote --heads  --sort=-v:refname '${dependencies.uri}' | awk '{print $2}' `
        let allBranch = await terminal_util.runCommand(cmd)
        let currentVersion = data['dependencies'][dependencies.name]['git']['ref']
        for (let branch of allBranch.split('\n')) {
            branch = branch.replace('refs/heads/', '')
            if (branch != '') {
                items.push({ label: branch, description: `current version => ${currentVersion}` })
            }
        }

        dependenciesNames.push({ label: dependencies.name, description: `current version => ${currentVersion} `, url: dependencies.uri });
        dependenciesVersionCache.set(dependencies.name, items)
        gitUrl.set(dependencies.name, dependencies.uri)
    }
    // ????????????????????????
    common.showPicker('Select dependencies', dependenciesNames, (item) => {
        let dependencies = item.label
        let versionItems = dependenciesVersionCache.get(dependencies)
        console.log(`Selected dependencies: ${dependencies}`);
        common.showPicker('Select version', versionItems, (item) => onVersionSelect(dependencies, item),)
    })
}

