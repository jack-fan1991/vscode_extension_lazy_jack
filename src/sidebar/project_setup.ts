import { ScriptsType, SideBarEntryItem } from "../sidebar";
import { gradleAddFlavor } from "../utils/android/app_build_gradle";
import { showPicker } from "../utils/common";
import { getPubspecAsMap } from "../utils/dart/pubspec/pubspec_utils";
import { Icon_Project } from "../utils/icon";
import { toLowerCamelCase } from "../utils/regex_utils";

import { runCommand, runTerminal } from "../utils/terminal_utils";
import { BaseTreeDataProvider, TreeDataScript, parseScripts } from "./base_tree_data_provider";
import * as vscode from 'vscode';


const projectSetupScripts: TreeDataScript[] = [
    {
        scriptsType: ScriptsType.customer,
        label: 'Add Flavor',
        script: 'Add Flavor',
    }

]

class Project {
    projectDisplayName: string;
    projectID: string;
    projectNumber: string;

    constructor() {
        this.projectDisplayName = ''
        this.projectID = ''
        this.projectNumber = ''
    }
}



export class ProjectSetupDataProvider extends BaseTreeDataProvider {
    providerLabel = "ProjectSetupDataProvider"
    supportScripts = [...projectSetupScripts];
    getChildren(
        element?: SideBarEntryItem
    ): vscode.ProviderResult<SideBarEntryItem[]> {
        return Promise.resolve(this.createData(),);
    }

    private async createData(): Promise<SideBarEntryItem[]> {
        return parseScripts(projectSetupScripts);
    }

    async handleCommand(context: vscode.ExtensionContext, script: TreeDataScript): Promise<void> {
        let allScripts = this.supportScripts.map((item) => { return item.script })
        let cmd: string = script.script
        if (allScripts.includes(cmd)) {
            if (script.scriptsType == ScriptsType.customer) {
                if (script.script == 'Add Flavor') {
                    await this.addFlavor()
                }

            }
        }
    }

    async addFlavor() {
        let flavor = await vscode.window.showInputBox({ prompt: "Add Flavor" }).then((value) => {
            if (value) {
                return value
            }
        })
        if (flavor == undefined) return
        gradleAddFlavor(toLowerCamelCase(flavor) )

    }
}

