import { onDart } from "../../ language_enviroment_check";
import { runCommand } from "../../terminal_utils";
import * as vscode from 'vscode';
import path = require("path");
import { getPubspecAsText, getPubspecPath, replaceInPubspecFile } from "./pubspec_utils";
import { getActivateText, getActivateTextEditor, isWindows, saveActivateEditor } from "../../vscode_utils";
import { Icon_Info, logInfo } from "../../icon";
import { extension_updateDependencyVersion } from "./update_git_dependency";
import { getPubspecDependencyOverridePath } from "../../regex_utils";
import { openEditor, showPicker } from "../../common";
export class DependenciesInfo {
    name: string;
    uri: string;
    branch: string;
    constructor(name: string, uri: string, branch: string) {
        this.name = name;
        this.uri = uri;
        this.branch = branch;
    }
}

export class OverrideDependenciesInfo {
    name: string;
    path: string;
    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    commentString(): string {
        return `${this.name}:\n    path: ${this.path}`
    }

    unCommentString(): string {
        return `# ${this.name}:\n  #   path: ${this.path}`
    }

    isActivate(): boolean {
        return getPubspecAsText().indexOf(this.unCommentString()) == -1
    }
    isDeactivate(): boolean {
        return !this.isActivate()
    }
}


let gitExtensions: DependenciesInfo[] = [];
let gitDependenciesOverrides: OverrideDependenciesInfo[] = [];
let gitDependenciesPickerList: { label: string; description: string; url: string; }[] = []
let versionPickerCache = new Map<string, any>()
let isFirstOpen = true


export async function parseDartGitExtensionInYaml(showUpdate: boolean = false) {
    gitExtensions = []
    gitDependenciesOverrides = []
    gitDependenciesPickerList = []
    await onDart(async (pubspecData) => {
        if (pubspecData == undefined) return undefined
        let gitDependencies = pubspecData['dependencies']
        let dependencyOverrides = pubspecData['dependency_overrides']
        if (dependencyOverrides != undefined) {
            gitDependenciesOverrides = convertToOverrideDependenciesInfo(dependencyOverrides)
        }
        gitDependenciesOverrides = [...gitDependenciesOverrides, ...parseIfOverrideMark()]
        if (gitDependencies != undefined) {
            gitExtensions = convertToDependenciesInfo(gitDependencies)
            await convertDependenciesToPickerItems(pubspecData, gitExtensions, showUpdate)
        }
    }, () => undefined, true)

}



async function convertDependenciesToPickerItems(pubspecData: any, gitDependencies: DependenciesInfo[], showUpdate: boolean = false) {
    let versionPickerList: { label: string; description: string; url: string; }[] = []
    for (let dependenciesInfo of gitDependencies) {
        versionPickerList = []
        const gitCommand: Command = {
            windows: `git ls-remote --heads --sort=-v:refname '${dependenciesInfo.uri}' | ForEach-Object { $_.Split()[1] } `,
            mac: `git ls-remote --heads  --sort=-v:refname '${dependenciesInfo.uri}' | awk '{print $2}' `,
        };
        let allBranch = await runCommand(isWindows() ? gitCommand.windows : gitCommand.mac)
        let currentVersion = pubspecData['dependencies'][dependenciesInfo.name]['git']['ref']
        // get all branch from git
        for (let branch of allBranch.split('\n')) {
            branch = branch.replace('refs/heads/', '').replace(/\r/g, '')
            if (branch != '' && branch != 'main') {
                versionPickerList.push({ label: `${branch}`, description: `current version => ${currentVersion} `, url: dependenciesInfo.uri });
            }
        }
        let lastVersion = versionPickerList[0].label.replace(`${dependenciesInfo.name} => `, '')
        if (showUpdate) {
            await showUpdateIfNotMatch(dependenciesInfo, lastVersion)
        }
        versionPickerCache.set(dependenciesInfo.name, versionPickerList)
        // Add git dependency to picker list 
        gitDependenciesPickerList.push({ label: dependenciesInfo.name, description: `current version => ${currentVersion} `, url: dependenciesInfo.uri });
        versionPickerCache.set(dependenciesInfo.name, versionPickerList)
    }
}

async function showUpdateIfNotMatch(dependenciesInfo: DependenciesInfo, latestVersion: string) {
    if (dependenciesInfo.branch == latestVersion) return
    let dependencyOverride = gitDependenciesOverrides.filter((x) => x.name.includes(dependenciesInfo.name))[0];
    let overrideActivate = dependencyOverride == undefined ? false : dependencyOverride.isActivate()
    let localPathInfo = overrideActivate ? `Project using override path「 ${dependencyOverride.path} 」 ` : ""    // show update or use locale
    vscode.window.showInformationMessage(`[ New Version ${latestVersion}] ${dependenciesInfo.name} : In Project from ${dependenciesInfo.branch}=>${latestVersion},  ${localPathInfo} `, 'Update', !overrideActivate ? 'Debug Local' : "").then(async (selectedOption) => {
        if (selectedOption === 'Debug Local') {
            if (!overrideActivate) {
                if (dependencyOverride == undefined) {
                    await vscode.window.showInputBox({ prompt: `Please input ${dependenciesInfo.name} local path`, value: `../${dependenciesInfo.name}` }).then(async (localPath) => {
                        if (localPath == undefined) return
                        dependencyOverride = new OverrideDependenciesInfo(dependenciesInfo.name, localPath!)
                        openEditor(getPubspecPath()!)
                        let text = getActivateText()
                        let editor =getActivateTextEditor()
                        let assertLineAt = text.split('\n').indexOf('assets:')-1
                        editor.edit((editBuilder) => {
                            editBuilder.insert(new vscode.Position(assertLineAt, 0),`\ndependency_overrides:\n  ${dependencyOverride.commentString()}\n` )
                        })
                        logInfo(`Activate ${dependencyOverride.name} local override ${dependencyOverride.path}`)
                    
                    }
                    )
                } else {
                    await replaceInPubspecFile(dependencyOverride.unCommentString(), dependencyOverride.commentString());
                    logInfo(`Activate ${dependencyOverride.name} local override ${dependencyOverride.path}`)
                }
            }

        } else if (selectedOption === 'Update') {
            await vscode.commands.executeCommand(extension_updateDependencyVersion, dependenciesInfo, latestVersion, dependencyOverride);
        }
        saveActivateEditor()

    });
}

function convertToDependenciesInfo(data: any): DependenciesInfo[] {
    let gitExtensions: DependenciesInfo[] = [];
    let keys = Object.keys(data)
    for (let key of keys) {
        let extension = data[key]
        let gitInfo = extension['git']
        if (gitInfo != undefined) {
            gitExtensions.push(new DependenciesInfo(key, gitInfo['url'], gitInfo['ref']))
        }
    }
    return gitExtensions;
}
function convertToOverrideDependenciesInfo(data: any): OverrideDependenciesInfo[] {
    let dependenciesOverrideInfo: OverrideDependenciesInfo[] = [];
    let keys = Object.keys(data)
    for (let key of keys) {
        let extension = data[key]
        if (extension != undefined) {
            dependenciesOverrideInfo.push(new OverrideDependenciesInfo(key, extension['path']))
        }
    }
    return dependenciesOverrideInfo;
}

function parseIfOverrideMark(): OverrideDependenciesInfo[] {
    let dependenciesOverrideInfo: OverrideDependenciesInfo[] = [];
    let start = false
    let text = getPubspecAsText()
    let textLine = text.split('\n')
    textLine.forEach((line) => {
        let index = text.indexOf(line)
        if (!start && line.includes('dependency_overrides:')) {
            start = true
        }
        if (start && line.includes('#')) {
            let target = line + text[index + 1]
            let dependency = line.replace('#', '').replace(':', '').trim()
            let path = getPubspecDependencyOverridePath(dependency)
            if (path != undefined) {
                dependenciesOverrideInfo.push(new OverrideDependenciesInfo(dependency, path ?? ''))
            }
        }
    })

    return dependenciesOverrideInfo;
}


export async function selectToUpdate() {
    await parseDartGitExtensionInYaml()
    showPicker('Select dependencies', gitDependenciesPickerList, (item) => {
        let dependenciesInfo = gitExtensions.filter((x) => x.name == item.label)[0]
        let dependencyOverride = gitDependenciesOverrides.filter((x) => x.name.includes(dependenciesInfo.name))[0]
        let versionPickerList = versionPickerCache.get(item.label)
        showOverrideDependencySwitcher(dependenciesInfo, dependencyOverride)
        showPicker('Select version', versionPickerList, async (item) => {
            let version = item.label.replace(`${dependenciesInfo.name} => `, '')
            await vscode.commands.executeCommand(extension_updateDependencyVersion, dependenciesInfo, version, dependencyOverride), dependencyOverride
        })
    }
    )
}

// 這裡處理override 的切換
function showOverrideDependencySwitcher(dependenciesInfo: DependenciesInfo, dependenciesOverrideInfo: OverrideDependenciesInfo) {
    let msg = ''
    if (dependenciesOverrideInfo.isActivate()) {
        msg = `${dependenciesInfo.name} is using override path「 ${dependenciesOverrideInfo.path} 」 `
    } else {
        msg = `Switch ${dependenciesInfo.name} to override path「 ${dependenciesOverrideInfo.path} 」 `
    }
    vscode.window.showInformationMessage(` ${msg}`, dependenciesOverrideInfo.isActivate() ? 'comment override path' : 'Switch to override path').then(async (selectedOption) => {
        if (selectedOption === 'comment override path') {
            replaceInPubspecFile(dependenciesOverrideInfo.commentString(), dependenciesOverrideInfo.unCommentString())
            logInfo(`${dependenciesInfo.name} using remote branch ${dependenciesInfo.branch} now`)
        }
        if (selectedOption === 'Switch to override path') {
            replaceInPubspecFile(dependenciesOverrideInfo.unCommentString(), dependenciesOverrideInfo.commentString())
            logInfo(`${dependenciesInfo.name} using override path ${dependenciesOverrideInfo.path} now`)
        }


    })

}