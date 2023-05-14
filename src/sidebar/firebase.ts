import { ScriptsType, SideBarEntryItem } from "../sidebar";
import { logInfo } from "../utils/icon";
import { runCommand, runTerminal } from "../utils/terminal_utils";
import { BaseTreeDataProvider, Script, parseScripts } from "./base_tree_data_provider";
import * as vscode from 'vscode';
const fireBaseUninstallScripts: Script[] = [
    {
        scriptsType: ScriptsType.terminal,
        label: 'firebase install',
        script: 'npm install -g firebase-tools',

    }
]

const fireBaseInstallScripts: Script[] = [
    {
        scriptsType: ScriptsType.terminal,
        label: 'firebase login',
        script: 'firebase login',
    },
    {
        scriptsType: ScriptsType.command,
        label: 'list projects',
        script: 'firebase projects:list',
    },


]

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

    async handleCommand(context: vscode.ExtensionContext, script: Script): Promise<void> {
        let allScripts = this.supportScripts.map((item) => { return item.script })
        if (allScripts.includes(script.script)) {
            if (script.scriptsType == ScriptsType.terminal) {
                runTerminal(script.script)
            }
            else {
                let text = await runCommand(script.script, undefined, undefined, false, true)
                let rows = text.match(/\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│/g)!
                for (let r of rows) {
                    let items = r.match(/\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│/g)![0].split('│').filter((i) => i != '').map((i) => i.trim())
                    let obj = {
                        'Project Display Name': items[0],
                        'Project ID': items[1],
                        'Project Number': items[2],
                    };
                    logInfo(JSON.stringify(obj))
                }


            }
        }
        logInfo('')
    }


}


