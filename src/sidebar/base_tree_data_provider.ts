import { ScriptsType, SideBarEntryItem } from "../sidebar";
import * as vscode from 'vscode';
import { runCommand, runTerminal } from "../utils/terminal_utils";
export const sidebar_command_onselect = 'lazyjack.sidebar.command.onselect';

export type TreeDataScript = {
    scriptsType: ScriptsType;
    label: string;
    script: string;
    description?: string;

};

function decorateDescription(description: string|undefined): string|undefined {
    return description==undefined? undefined :`( ${description}))`
}
 
export function parseScripts(scripts: TreeDataScript[]): SideBarEntryItem[] {
    let childrenList: SideBarEntryItem[] = []
    for (let index = 0; index < scripts.length; index++) {
        let script = scripts[index]
        let item = new SideBarEntryItem(
            decorateDescription(script.description) ??'1.0.0',
            script.label ?? script.script,
            vscode.TreeItemCollapsibleState.None
        )
        item.command = {
            command: sidebar_command_onselect, //命令id
            title: "run" + scripts[index].label + "on" + scripts[index].scriptsType,
            arguments: [scripts[index]], //命令接收的参数
        }
        childrenList[index] = item
    }
    return childrenList
}

export class BaseTreeDataProvider implements vscode.TreeDataProvider<SideBarEntryItem> {
    readonly supportScripts: TreeDataScript[] = []
    readonly providerLabel: string=''
    constructor(private workspaceRoot?: string) { }
    register(context : vscode.ExtensionContext){
        vscode.window.registerTreeDataProvider(this.providerLabel, this);
  
    }
    getTreeItem(element: SideBarEntryItem): vscode.TreeItem {
        return element
    }
    getChildren(): vscode.ProviderResult<SideBarEntryItem[]> {
        return []
    }
    handleCommand(context: vscode.ExtensionContext, script: TreeDataScript) {
        let allScripts = this.supportScripts.map((item) => { return item.script })
        if (allScripts.includes(script.script)) {
            if (script.scriptsType == ScriptsType.terminal) {
                runTerminal(script.script)
            }
            else{
                runCommand(script.script)
            }
        }
    }
}
