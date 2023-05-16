import { ScriptsType, SideBarEntryItem } from "../sidebar";
import { runCommand, runTerminal } from "../utils/terminal_utils";
import { BaseTreeDataProvider, TreeDataScript, parseScripts } from "./base_tree_data_provider";
import * as vscode from 'vscode';
const fireBaseUninstallScripts: TreeDataScript[] = [
    {
        scriptsType: ScriptsType.terminal,
        label: 'firebase install',
        script: 'npm install -g firebase-tools',

    }
]

const fireBaseInstallScripts: TreeDataScript[] = [
    {
        scriptsType: ScriptsType.browser,
        label: 'Open Firebase Console',
        script: 'https://console.firebase.google.com/',
    },
    {
        scriptsType: ScriptsType.command,
        label: 'Switch user',
        script: 'firebase login:list',
    },

    {
        scriptsType: ScriptsType.terminal,
        label: 'Projects',
        script: 'firebase projects:list',
    },
    {
        scriptsType: ScriptsType.terminal,
        label: 'Login',
        script: 'firebase login',
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



export class FirebaseDataProvider extends BaseTreeDataProvider {
    providerLabel = "FirebaseDataProvider"
    supportScripts = [...fireBaseUninstallScripts, ...fireBaseInstallScripts];
    getChildren(
        element?: SideBarEntryItem
    ): vscode.ProviderResult<SideBarEntryItem[]> {
        return Promise.resolve(this.firebaseTree(),);
    }

    private async firebaseTree(): Promise<SideBarEntryItem[]> {
        let childrenList: SideBarEntryItem[] = []
        try {
            await runCommand("firebase --version", undefined, undefined, false, true)
        }
        catch {
            return parseScripts(fireBaseUninstallScripts);

        }
        return parseScripts(fireBaseInstallScripts);

    }

    async handleCommand(context: vscode.ExtensionContext, script: TreeDataScript): Promise<void> {
        let allScripts = this.supportScripts.map((item) => { return item.script })
        let cmd: string = script.script
        if (allScripts.includes(cmd)) {
            if (script.scriptsType == ScriptsType.terminal) {
                runTerminal(cmd)
            } else if (script.scriptsType == ScriptsType.command) {
                runTerminal('firebase logout')
                runTerminal(`firebase  login`, '', true)
            }
        }
    }
}

