import * as vscode from 'vscode';
import { isFlutterProject } from '../utils/dart/pubspec/pubspec_utils';
import { runFlutterPubGet } from '../utils/dart/flutter_commond';
import { logError } from '../utils/icon';

export function registerFileListener(context: vscode.ExtensionContext) {
    let disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (isFlutterProject() && document.uri.path.endsWith('.arb')) {
            /// validate document text is json 
            try {
                JSON.parse(document.getText())
                runFlutterPubGet()
            } catch (e) {
                let fileName = document.uri.path.split('/').pop()
                let message = `File ${fileName} has error Json format`
                logError(message, true)
            }



        }
    });

    context.subscriptions.push(disposable);
}