import * as vscode from 'vscode';
import { StringConvertFixer } from './dart/ez_code_action/string_convert_fixer';
import { ExtractClassFixer } from './dart/ez_code_action/class_action';
import { CurserDetector } from './dart/ez_code_action/cursor_detector';
// 設定常數，代表指令的名稱
const DART_MODE = { language: "dart", scheme: "file" };
const quickFixCodeAction = [vscode.CodeActionKind.Refactor];
// 啟動擴充套件
export function registerEzAction(context: vscode.ExtensionContext) {
    let providers: EzCodeActionProviderInterface[] = []
    providers.push(new StringConvertFixer())
    providers.push(new ExtractClassFixer())
    // providers.push(new CurserDetector())
    for (let p of providers) {
        // 註冊命令回調
        p.registerCommand(context)
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(
                p.getLangrageType(),
                p,
               ));
    }
}



export interface EzCodeActionProviderInterface extends vscode.CodeActionProvider {
    registerCommand(context: vscode.ExtensionContext): void
    getLangrageType(): vscode.DocumentSelector

}