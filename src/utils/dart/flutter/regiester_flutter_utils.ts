import * as vscode from 'vscode';
const wrapTest ="extension.wrap-test"


export function flutterCommandRegister(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand(wrapTest, async () => {
    }));
   
  }