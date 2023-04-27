import { onDart } from "../../ language_enviroment_check";
import { runCommand } from "../../terminal_utils";
import * as vscode from 'vscode';
import path = require("path");
import { openEditor, replaceText } from "../../common";
import { getPubspecPath } from "./pubspec_utils";
import { getActivateText, saveActivateEditor } from "../../vscode_utils";
import { Icon_Info } from "../../icon";

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
let gitExtensions: DependenciesInfo[] = [];
let gitOverrideExtensions: DependenciesInfo[] = [];
let dependenciesPickerList: { label: string; description: string; url: string; }[] = []
let versionPickerCache = new Map<string, any>()
let gitUriCache = new Map<string, any>()

export async function parseDartGitExtensionInYaml() {
    gitExtensions = []
    gitOverrideExtensions = []
    dependenciesPickerList = []
    await onDart(async (pubspecData) => {
        if (pubspecData == undefined) return undefined
        let gitDependencies = pubspecData['dependencies']
        let dependencyOverrides = pubspecData['dependency_overrides']

        if (gitDependencies != undefined) {
            gitExtensions = convertToDependenciesInfo(gitDependencies)
            await convertDependenciesToPickerItems(pubspecData, gitExtensions)
        }
        if (dependencyOverrides != undefined) {
            gitOverrideExtensions = convertToDependenciesInfo(gitOverrideExtensions)
        }

    }, () => undefined, true)

}



async function convertDependenciesToPickerItems(pubspecData: any, gitDependencies: DependenciesInfo[]) {
    let versionPickerList: { label: string; description: string; url: string; }[] = []
    for (let dependencies of gitDependencies) {
        versionPickerList = []
        let cmd = `git ls-remote --heads  --sort=-v:refname '${dependencies.uri}' | awk '{print $2}' `
        let allBranch = await runCommand(cmd)
        let currentVersion = pubspecData['dependencies'][dependencies.name]['git']['ref']
        // get all branch from git
        for (let branch of allBranch.split('\n')) {
            branch = branch.replace('refs/heads/', '')
            if (branch != '') {
                versionPickerList.push({ label: `${dependencies.name} => ${branch}`, description: `current version => ${currentVersion} `, url: dependencies.uri });
            }
        }
        await showUpdateIfNotMatch(dependencies.name, currentVersion, versionPickerList[0].label.replace(`${dependencies.name} => `, ''))
        versionPickerCache.set(dependencies.name, versionPickerList)
        // Add git dependency to picker list 
        dependenciesPickerList.push({ label: dependencies.name, description: `current version => ${currentVersion} `, url: dependencies.uri });
        versionPickerCache.set(dependencies.name, versionPickerList)
        gitUriCache.set(dependencies.name, dependencies.uri)
    }
}

async function showUpdateIfNotMatch(dependencies: string, currentVersion: string, latestVersion: string) {
    if (currentVersion != latestVersion) return
    let localPath = `../${dependencies}`
    await openEditor(getPubspecPath()!)
    let overrideActivate = getActivateText().indexOf(`${dependencies}:\n    path: ${localPath}`) != -1
    let description = dependenciesPickerList.filter((x) => x.label.includes(dependencies)).map((x) => x.description);
    let msg = overrideActivate ? `now use override local path `:""    // show update or use locale
    vscode.window.showInformationMessage(`[${Icon_Info}Update]${dependencies} ${msg},Update from ${currentVersion}=>${latestVersion}`,'Update', 'Local').then(async (selectedOption) => {
        let depString = `${dependencies}:\n    path: ${localPath}`
        let markString = `# ${dependencies}:\n  #   path: ${localPath}`
        let findMarkString = getActivateText().indexOf(markString) != -1
        if (selectedOption === 'Local') {
            if (!overrideActivate && findMarkString) {
                let yamlPath = getPubspecPath()!;
                let replace = await replaceText(yamlPath, markString, depString);
                vscode.window.showInformationMessage(`${dependencies} use local override ${localPath}`)
            }
        } else if (selectedOption === 'Update') {
            if (overrideActivate) {
                let markString = `# ${dependencies}:\n  #   path: ${localPath}`
                let yamlPath = path.join(vscode.workspace.rootPath ?? '', 'pubspec.yaml');
                let replace = await replaceText(yamlPath, depString, markString);
                vscode.window.showInformationMessage(`${dependencies} remove local override`)
            }
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