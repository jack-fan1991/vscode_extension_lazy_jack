import * as vscode from 'vscode';
import { isFlutterProject } from '../utils/dart/pubspec/pubspec_utils';
import { runFlutterPubGet } from '../utils/dart/flutter_commond';
import { logError } from '../utils/icon';
import { FileListenerBase } from './base_file_listener';
import { getActivateTextEditor } from '../utils/vscode_utils';

class ArbFileListener extends FileListenerBase {
    constructor() {
        super();
    }
    onDidSaveTextDocument(): vscode.Disposable | undefined {
        return vscode.workspace.onDidSaveTextDocument((document) => {
            let editor = getActivateTextEditor()
            if (isFlutterProject(), editor?.document.uri.path.endsWith('.arb') ) {
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
        })
    }
}

export const arbFileListener = new ArbFileListener()
