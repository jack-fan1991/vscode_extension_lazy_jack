import { ScriptsType, SideBarEntryItem } from "../sidebar";
import { showPicker } from "../utils/common";
import { getPubspecAsMap } from "../utils/dart/pubspec/pubspec_utils";
import { Icon_Project } from "../utils/icon";

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
        label: 'Setup firebase to project',
        script: 'firebase projects:list',
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
                if (cmd.includes('projects:list')) {
                   // runTerminal('dart pub global activate flutterfire_cli')
                    let text = await runCommand(script.script, undefined, undefined, false, true)
                    let rows = text.match(/\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│/g)!
                    let projects: Project[] = []
                    for (let r of rows) {
                        let items = r.match(/\│\s*(.*?)\s*\│\s*(.*?)\s*\│\s*(.*?)\s*\│/g)![0].split('│').filter((i) => i != '').map((i) => i.trim())
                        if (items[0].includes('Display Name')) continue
                        let project: Project = new Project()
                        project.projectDisplayName = items[0]
                        project.projectID = items[1]
                        project.projectNumber = items[2]
                        projects.push(project)
                    }
                    let projectsItems: { label: string; id: string; }[] = []
                    projectsItems = projects.map((p) => { return { label: `${Icon_Project} ${p.projectDisplayName}`, id: p.projectID } })
                    let yaml = await getPubspecAsMap()
                    let packageName = yaml!['name']
                    showPicker("Select project", projectsItems, (selected) => {
                        if (selected) {
                            let a=selected.id.replace('-','.')
                            let bundleId =`com.${selected.id.replace('-','.').replace('-','.')}`
                            let cmd = `flutterfire config \
                            --project=${selected.id} \
                            --out=lib/firebase_options_${selected.id}.dart \
                            --ios-bundle-id=${bundleId} \
                            --macos-bundle-id=${bundleId} \  
                            --android-app-id=${bundleId} `
                            try{
                                runTerminal(cmd)

                            }
                            catch(e){
                                console.log(e)
                            }
                        }
                    })

                } else {
                    runTerminal('firebase logout')
                    runTerminal(`firebase  login`, '', true)
                }
            }
        }
    }
}

