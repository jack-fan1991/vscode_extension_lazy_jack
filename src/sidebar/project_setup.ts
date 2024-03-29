import { create, delay } from "lodash";
import { ScriptsType, SideBarEntryItem } from "../sidebar";
import { findApplicationId, gradleAddFlavor } from "../utils/android/app_build_gradle";
import { openEditor, showPicker, sleep, tryRun } from "../utils/common";
import { getPubspecPath } from "../utils/dart/pubspec/pubspec_utils";
import { getPubspecAsMap } from "../utils/dart/pubspec/pubspec_utils";
import { Icon_Debug, Icon_Info, Icon_Project, logError, logInfo, showInfo } from "../utils/icon";
import { toLowerCamelCase } from "../utils/regex_utils";
import { spawn } from 'child_process';
import * as path from 'path';
import { runCommand, runTerminal } from "../utils/terminal_utils";
import { getRootPath, getWorkspacePath, openBrowser, reFormat } from "../utils/vscode_utils";
import { BaseTreeDataProvider, TreeDataScript, parseScripts } from "./base_tree_data_provider";
import * as vscode from 'vscode';
import { createFile, getAbsFilePath, isFileExist } from "../utils/file_utils";


const projectSetupScripts: TreeDataScript[] = [
    {
        scriptsType: ScriptsType.customer,
        label: 'Setup flavor',
        script: 'Setup flavor',
        description: 'Use flavorizr to setup flavor',
    },
    {
        scriptsType: ScriptsType.terminal,
        label: 'Run Flavorizr',
        script: 'flutter pub run flutter_flavorizr',
        description: 'flutter pub run flutter_flavorizr',
    },
    {
        scriptsType: ScriptsType.customer,
        label: 'Create firebase by flavor',
        script: 'Create firebase by flavor',
        description: 'Select flavor to create firebase project',
    },
    {
        scriptsType: ScriptsType.customer,
        label: 'Deploy firebase',
        script: 'Setup firebase to project',
        description: 'Deploy firebase project to flavor',
    },
    {
        scriptsType: ScriptsType.customer,
        label: 'Create Application.dart',
        script: 'Create Application dart file',
        description: 'Create Application.dart template',

    },

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

class FirebaseFlavor {
    flavorName: string;
    applicationId: string;
    displayName: string;
    constructor() {
        this.flavorName = ''
        this.applicationId = ''
        this.displayName = ''
    }

    firebaseProjectId(): string {
        return convertApplicationIdToProjectId(this.applicationId)
    }
    bundleId(): string {
        return this.firebaseProjectId().replace(/-/g, '.')
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
        let yaml = await getPubspecAsMap()
        let flavorIsSetup = this.findFlutterFlavorizr(yaml)
        this.showFlavorizrEditor(flavorIsSetup, yaml)
        let script = parseScripts(projectSetupScripts);
        if (flavorIsSetup) {
            script = script.filter((script) => { return script.label != "Setup flavor" })
        }
        return script
    }

    async showFlavorizrEditor(flavorIsSetup: boolean, yaml: any) {
        if (flavorIsSetup) {
            openEditor(getPubspecPath()!)
            let flavors = await this.findFlavors(yaml)
            let currentFlavors = flavors.map((flavor) => { return flavor.flavorName }).join(',')
            vscode.window.showInformationMessage(`Flutter already setup with ${currentFlavors}`, 'Read More').then(async (value) => {
                if (value == 'Read More') {
                    openBrowser('https://pub.dev/packages/flutter_flavorizr')
                }
            })
            return
        }

        vscode.window.showInformationMessage('Setting dependencies on flavorizr', 'Add Flavorizr', 'Read More').then(async (value) => {
            if (value == 'Read More') {
                openBrowser('https://pub.dev/packages/flutter_flavorizr')
            } else if(value == 'Add Flavorizr') {
                openEditor(getPubspecPath()!)
                runTerminal('flutter pub add flutter_flavorizr --dev')
                // wait 1 second to make sure flutter pub add flutter_flavorizr is done
                await sleep(1000)
                let applicationId = findApplicationId()[1]
                let projectName = yaml!['name']
                applicationId = convertApplicationId(applicationId)
                let finalApplicationId = await vscode.window.showInputBox({ prompt: `${Icon_Info} Set up bundleId / applicationId`, value: applicationId }).then((value) => {
                    return value
                })
                if (finalApplicationId == undefined) return
                let appName = await vscode.window.showInputBox({ prompt: `${Icon_Info} Set up App name`, value: projectName }).then((value) => {
                    return value
                })
                if (finalApplicationId == undefined || appName == undefined) return
                let flavor = await vscode.window.showInputBox({ prompt: `${Icon_Info} set Flavor => prod,dev,staging`, value: "prod,dev" }).then((value) => {
                    return value?.split(',')
                })
                if (finalApplicationId == undefined || appName == undefined || flavor == undefined) return
                finalApplicationId = convertApplicationId(finalApplicationId)
                let template = this.createFlavorizrTemplate(finalApplicationId, appName, flavor)
                let pubspecEditor = await openEditor(getPubspecPath()!)
                let lastLine = pubspecEditor!.document.lineAt(pubspecEditor!.document.lineCount - 1)
                // insert template to pubspec.yaml latest line
                pubspecEditor!.edit((editBuilder) => {
                    editBuilder.insert(lastLine.range.end, template)
                }
                )

                // save editor
                await pubspecEditor!.document.save()
                await vscode.window.showInformationMessage("Will create numerous file,make sure your git commit status", "Create", "Cancel").then((value) => {
                    if (value == "Create") {
                        runTerminal("flutter pub run flutter_flavorizr")
                    }
                })


            }
        })
    }

    findFlutterFlavorizr(yaml: any): boolean {
        if (yaml['dev_dependencies'] == undefined) return false
        return yaml['dev_dependencies']['flutter_flavorizr'] != undefined && yaml['flavorizr'] != undefined
    }

    createFlavorizrTemplate(applicationId: string, appName: string, flavor: string[]) {
        let template = `
flavorizr:
  ide: "vscode"
  app:
    android:
      flavorDimensions: "flavor-type"
    ios:

  flavors:      
        `
        for (let f of flavor) {
            template += this.createFlavorTemplate(applicationId, appName, f)
        }
        logInfo(template)
        return template
    }

    createFlavorTemplate(applicationId: string, appName: string, flavor: string) {
        let template = `
    ${flavor}:
      app:
        name: "${appName} ${flavor}"

      android:
        applicationId: "${applicationId}.${flavor}"
        #firebase:
        #  config: ".firebase/${flavor}/google-services.json"

      ios:
        bundleId: "${applicationId}.${flavor}"
        firebase:
          config: ".firebase/${flavor}/GoogleService-Info.plist"
        buildSettings:
        # Development Team is visible in the apple developer portal 
        # DEVELOPMENT_TEAM: YOURDEVTEAMID 
        # PROVISIONING_PROFILE_SPECIFIER: "Dev-ProvisioningProfile"
        `
        return template
    }

    async handleCommand(context: vscode.ExtensionContext, script: TreeDataScript): Promise<void> {
        let allScripts = this.supportScripts.map((item) => { return item.script })
        let cmd: string = script.script
        if (allScripts.includes(cmd)) {
            if (script.scriptsType == ScriptsType.customer) {
                if (script.script == 'Add Flavor') {
                    await this.addFlavor()
                }
                if (script.script == 'Setup flavor') {
                    let yaml = await getPubspecAsMap()
                    await this.showFlavorizrEditor(this.findFlutterFlavorizr(yaml),yaml)
                }
                if (script.script == 'Create firebase by flavor') {
                    this.createFirebaseByFlavor(context)
                }
                if (script.script == 'Setup firebase to project') {
                    this.setupFireBaseOption(context)
                }
                if (script.script == 'Create Application dart file') {
                    this.createApplicationTemplate()
                }


            }
            else {
                super.handleCommand(context, script)
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
        gradleAddFlavor(toLowerCamelCase(flavor))
    }

    async createFirebaseByFlavor(context: vscode.ExtensionContext) {
        let yaml = await getPubspecAsMap()
        let firebaseFlavor: FirebaseFlavor[] = await this.findFlavors(yaml)
        let currentProject = await this.fetchFirebaseFlavor()
        // filter exist project from current project
        if (firebaseFlavor.length == 0) {
            logError("Can't find any flavor, please add flavor first")
            return
        }
        let createAbleProject = firebaseFlavor.filter((item) => {
            return currentProject.filter((f) => {
                let flavorToProjectId = convertApplicationIdToProjectId(item.applicationId)
                return flavorToProjectId != f.projectID
            })
        }
        )
        let createAbleFlavorItem: { label: string; description: string; firebaseFlavor: FirebaseFlavor }[] = []

        for (let f of createAbleProject) {
            let flavorToProjectId = convertApplicationIdToProjectId(f.applicationId)
            createAbleFlavorItem.push({ label: f.flavorName, description: f.displayName, firebaseFlavor: f })
        }
        showPicker("Select flavor to create firebase env ", createAbleFlavorItem, async (item) => {
            let name = yaml!['name']
            let defaultName = convertApplicationIdToProjectId(`${name}-${item.firebaseFlavor.flavorName}`)
            vscode.window.showInformationMessage(`Will create firebase project ${defaultName} `, "Create", "Modify").then((value) => {
                if (value == "Create") {
                    let cmd = `firebase projects:create --display-name= ${defaultName} `
                    runTerminal(cmd)
                }
                if (value == "Modify") {
                    vscode.window.showInputBox({ prompt: "Modify firebase project name", value: `${defaultName}` }).then((value) => {
                        if (value) {
                            value = convertApplicationIdToProjectId(value)
                            let cmd = `firebase projects:create --display-name= ${value} `
                            runTerminal(cmd)
                        }
                    })
                }
            })

        }
        )
    }



    async fetchFirebaseFlavor(): Promise<Project[]> {
        let text = await this.syncFireBase()
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
        return projects

    }

    async findFlavors(yaml: any): Promise<FirebaseFlavor[]> {
        if (yaml == undefined) return []
        let findFlutterFlavorizr = this.findFlutterFlavorizr(yaml)
        if (!findFlutterFlavorizr) return []
        let flavors = yaml['flavorizr']['flavors']
        let firebaseFlavors: FirebaseFlavor[] = []
        // map flavors to firebaseFlavors
        for (let flavor in flavors) {
            let firebaseFlavor = new FirebaseFlavor()
            firebaseFlavor.flavorName = flavor
            firebaseFlavor.applicationId = flavors[flavor]['android']['applicationId']
            firebaseFlavor.displayName = flavors[flavor]['app']['name']
            firebaseFlavors.push(firebaseFlavor)
        }
        return firebaseFlavors

    }

    async syncFireBase(): Promise<string> {
        showInfo("Sync firebase project")
        return await runCommand('firebase projects:list', undefined, undefined, false, true)
    }

    async setupFireBaseOption(context: vscode.ExtensionContext) {

        // runTerminal('dart pub global activate flutterfire_cli')
        let text = await this.syncFireBase()
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
        let firebaseFlavors: FirebaseFlavor[] = await this.findFlavors(yaml)

        let createAbleFlavorItem: { label: string; description: string; firebaseFlavor: FirebaseFlavor }[] = []

        for (let f of firebaseFlavors) {
            createAbleFlavorItem.push({ label: f.flavorName, description: `appName: ${f.displayName} , id : ${f.applicationId} `, firebaseFlavor: f })
        }

        await showPicker(`${Icon_Info} Select flavor to set firebase`, createAbleFlavorItem, async (item) => {
            if (item == undefined) return
            let selectFlavorApplicationId: string = item['firebaseFlavor']['applicationId']
            if (selectFlavorApplicationId.startsWith('com')) {
                selectFlavorApplicationId.replace('com.', '')
            }
            let fileName = convertApplicationIdToFileName(selectFlavorApplicationId)
            let flavor = item.label
            showPicker(`${Icon_Info} Setting firebase to  Flavor ${flavor}  `, projectsItems, async (firebaseSelected) => {
                if (firebaseSelected) {
                    let folder = 'lib/firebase_options'
                    runCommand(`mkdir -p ${folder}`)

                    let cmd = `flutterfire config \
            --project=${firebaseSelected.id} \
            --out=${folder}/${fileName}_firebase_options.dart \
            --ios-bundle-id=${selectFlavorApplicationId} \
            --android-app-id=${selectFlavorApplicationId} `
                    try {
                        if (isFileExist('ios/Runner/GoogleService-Info.plist')) {
                            runCommand(`rm ios/Runner/GoogleService-Info.plist`)
                        }
                        runTerminal(cmd)
                        tryMoveIosFile(context, flavor)
                        tryMoveAndroidFile(flavor)
                    }
                    catch (e) {
                        console.log(e)
                    }

                }
            })
        })

    }



    createEnumTemplate(firebaseFlavors: FirebaseFlavor[]) {
        let fl = firebaseFlavors.map((f) => f.flavorName).join(',')
        return `enum Flavor { ${fl} }\n\n`
    }
    

    async createApplicationTemplate() {
        let isExist = isFileExist('lib/application/application.dart')
        if (isExist) {
            logInfo('lib/application/Application.dart is exist')
            return
        }
        runTerminal('mkdir -p lib/application')
        let absPath = path.join(await getRootPath(), 'lib/application/application.dart')
        let yaml = await getPubspecAsMap()
        let firebaseFlavors: FirebaseFlavor[] = await this.findFlavors(yaml)
        let template =
            `
    /// Auto generated file. By LazyJack

    import 'package:firebase_core/firebase_core.dart';
    import 'package:flutter/material.dart';
    
    ${this.createEnumTemplate(firebaseFlavors)}    
    
    late final FirebaseApp firebaseApp;
    
    
    /// void main() {
    ///    final app = Application(
    ///    appTitle: 'warrior_shield',
    ///    flavor: Flavor.dev,
    ///    child: App(),
    ///  )..init('warrior_shield', Flavor.dev);
    ///
    ///  runApp(app);
    ///
    class Application extends InheritedWidget {
      final Flavor flavor;
      final String appTitle;
      static late AppLocalizations l10n;
      static final NavigationService _navigationService = NavigationService();
      static GlobalKey<NavigatorState> get navigatorKey => _navigationService.navigatorKey;
      static NavigatorState? get navigator => _navigationService.navigator;
      static BuildContext get context => _navigationService.context;
      static NavigationService get navigationService => _navigationService;
      const Application({
        Key? key,
        required Widget child,
        required this.flavor,
        required this.appTitle,
      }) : super(
              key: key,
              child: child,
            );
    
      Future<void> init(String name) async {
        WidgetsFlutterBinding.ensureInitialized();
        // app = await Firebase.initializeApp(
        //   name: name,
        //   options: 
        //   DefaultFirebaseOptions.currentPlatform,
        // );
      }
    
      static Application of(BuildContext context) {
        return context.dependOnInheritedWidgetOfExactType<Application>()!;
      }
    
      @override
      bool updateShouldNotify(covariant InheritedWidget oldWidget) => false;
    }
    
    class NavigationService {
      final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
      BuildContext get context => navigatorKey.currentContext!;
      NavigatorState? get navigator => navigatorKey.currentState;
    
      Future<dynamic> pushNamed(String routeName, {Object? arguments}) {
        return navigatorKey.currentState!
            .pushNamed(routeName, arguments: arguments);
      }
    
      Future<dynamic> pushReplacementNamed(String routeName, {Object? arguments}) {
        return navigatorKey.currentState!
            .pushReplacementNamed(routeName, arguments: arguments);
      }
    
      Future<dynamic> pushNamedAndRemoveUntil(
          String routeName, RoutePredicate predicate,
          {Object? arguments}) {
        return navigatorKey.currentState!
            .pushNamedAndRemoveUntil(routeName, predicate, arguments: arguments);
      }
    
      void pop({Object? result}) {
        return navigatorKey.currentState!.pop(result);
      }
    }
    
    
        `
        try {
            await createFile(absPath, template)
        } catch (e) {
            console.log(e)
        }
        let edit = await openEditor(absPath)
        if (edit == undefined) {
            logError("try again")
        }
        else {

            reFormat()

        }
    }



}


async function tryMoveIosFile(context: vscode.ExtensionContext, flavor: string) {
    let result = await tryRun(
        () => {
            return isFileExist('ios/Runner/GoogleService-Info.plist')
        }
    )
    if (result != undefined) {
        runCommand(`mkdir -p ios/config/${flavor}`)
        runCommand(`mv ios/Runner/GoogleService-Info.plist ios/config/${flavor}/GoogleService-Info.plist`)
        runRubyScript(context)

    }
}


async function tryMoveAndroidFile(flavor: string) {
    let result = await tryRun(
        () => {
            return isFileExist('android/app/google-services.json')
        }
    )
    if (result != undefined) {
        runCommand(`mv android/app/google-services.json android/app/src/${flavor}/google-services.json`)
    }
}


function convertApplicationIdToFileName(string: string) {
    return string.replace(/[.-]/g, "_")
}

function convertApplicationId(string: string) {
    return string.replace(/[_-]/g, ".");
}


function convertApplicationIdToProjectId(string: string) {
    return string.replace(/[._]/g, "-");
}



function runRubyScript(context: vscode.ExtensionContext) {
    const rubyScriptPath = path.join(context.extensionPath, 'src/utils/sh_script/plist_to_flavor.rb'); // Ruby 腳本的路徑
    // walk  extensionPath dir
    const cwd = path.join(getRootPath(), 'ios'); // Ruby 腳本的路徑

    const childProcess = spawn('ruby', [rubyScriptPath], { cwd });

    childProcess.stdout.on('data', (data: string) => {
        logInfo(data.toString()); // 輸出 Ruby 腳本的標準輸出
    });

    childProcess.stderr.on('data', (data: string) => {
        logError(data.toString()); // 輸出 Ruby 腳本的錯誤輸出
    });
}
