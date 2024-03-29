import * as vscode from 'vscode'
import { registerDartSnippet } from './utils/snippet_utils';
import { registerToRequireParams, registerJsonToFreezed, registerCommandDartSelectedToFactory, registerGenerateAssert } from './dart/dart';
import { registerFastGithubCmd } from './github/github_utils';
import * as sidebar from './sidebar';
import * as codeAction from './code_action/code_action';
import { parseDartGitExtensionInYaml } from './utils/dart/pubspec/analyze_dart_git_dependency';
import { registerUpdateDependencyVersion } from './utils/dart/pubspec/update_git_dependency';
import { registerEzAction } from './code_action/ez_code_action';
import { registerFileListener } from './file_listener/activate_file_listener';
import { registerCompletionItemProvider } from './completion_item_provider/completion_item_provider';
import { FirebaseDataProvider } from './sidebar/firebase';
import { BaseTreeDataProvider, TreeDataScript, sidebar_command_onselect } from './sidebar/base_tree_data_provider';
import { openBrowser } from './utils/vscode_utils';
import { ProjectSetupDataProvider } from './sidebar/project_setup';


export async function activate(context: vscode.ExtensionContext) {
  console.log('your extension "sugar-demo-vscode" is now active!')
  parseDartGitExtensionInYaml(true)
  registerDartSnippet(context)
  registerFastGithubCmd(context)
  registerToRequireParams(context)
  registerJsonToFreezed(context)
  registerCommandDartSelectedToFactory(context)
  registerGenerateAssert(context)
  registerUpdateDependencyVersion(context)
  codeAction.register(context)
  registerEzAction(context)
  registerFileListener(context)
  // 自動補全
  registerCompletionItemProvider(context)


  //註冊 views id
  vscode.window.registerTreeDataProvider("flutter-lazy-cmd", new sidebar.FlutterTreeDataProvider());
  vscode.window.registerTreeDataProvider("build_runner-lazy-cmd", new sidebar.RunBuilderTreeDataProvider());
  vscode.window.registerTreeDataProvider("git-lazy-cmd", new sidebar.GitTreeDataProvider());
  vscode.window.registerTreeDataProvider("npm-lazy-cmd", new sidebar.NpmTreeDataProvider());
  vscode.window.registerTreeDataProvider("vscode-extension-lazy-cmd", new sidebar.VscodeExtensionTreeDataProvider());

  //註冊命令回調
  vscode.commands.registerCommand(sidebar.sidebar_command, (args) => {
    sidebar.onTreeItemSelect(context, args)
  })

  let sideBars: BaseTreeDataProvider[] = []
  sideBars.push(new FirebaseDataProvider())
  sideBars.push(new ProjectSetupDataProvider())

  for (let sideBar of sideBars) {
    sideBar.register(context)
  }
  //註冊命令回調
  vscode.commands.registerCommand(sidebar_command_onselect, (args) => {
    let dataScript = args as TreeDataScript
    if (dataScript.scriptsType == sidebar.ScriptsType.browser) {
      openBrowser(dataScript.script)
      return
    }

    for (let sideBar of sideBars) {
      sideBar.handleCommand(context, dataScript)
    }
  })
}

export function deactivate() { }


