import { openEditor } from "../common"
import { readFileToText } from "../file_utils"
import { logInfo } from "../icon";
import { BiggerOpenCloseFinder } from "../open_close_finder"
import { getRootPath } from "../vscode_utils"
import * as vscode from 'vscode';

const APP_BUILD_GRADLE = 'android/app/build.gradle'
const biggerOpenCloseFinder = new BiggerOpenCloseFinder(true)

export function getAndroidGradlePath() {
    let root = getRootPath()
    let path = root + '/' + APP_BUILD_GRADLE
    return path
}

export function getAndroidGradleText() {
    let path = getAndroidGradlePath()
    let gradleText = readFileToText(path)
    return gradleText
}


export async function gradleAddFlavor(flavor: string) {

    let gradleText = getAndroidGradleText()
    let editor = await openEditor(getAndroidGradlePath())
    let line = gradleText.split('\n')
    let insertIndex = 0
    for (let l of line) {
        insertIndex++
        if (!l.includes('buildTypes')) continue
        while (!l.includes('}')) {
            l = line[insertIndex]
            insertIndex--
        }
        break
    }
    insertIndex++
    let productFlavorsRange = biggerOpenCloseFinder.findRange(editor!.document, insertIndex)
    let productFlavorsText = editor?.document.getText(productFlavorsRange)
    if (!productFlavorsText?.includes('productFlavors')) {
        let template = productFlavorsTemplateAll(flavor)
        editor?.edit((editBuilder) => {
            editBuilder.insert(new vscode.Position(insertIndex + 1, 0), template)
        }
        )
    } else {
        if (productFlavorsText.includes(flavor)) {
            logInfo(`${flavor} already exists`)
            return
        }
        let template = productFlavorsTemplate(flavor)
        editor?.edit((editBuilder) => {
            editBuilder.insert(new vscode.Position(insertIndex - 1, 0), template)
        })
    }
    return gradleText


}

function productFlavorsTemplate(flavor: string): string {
    return `
        ${flavor} {
            dimension 'site'
            resValue "string", "app_name", app_name.${flavor}
            // signingConfig signingConfigs.${flavor}
        }
    `
}
function productFlavorsTemplateAll(flavor: string): string {
    return `
    flavorDimensions 'site'
    productFlavors {
        ${flavor} {
            dimension 'site'
            resValue "string", "app_name", app_name.${flavor}
            // signingConfig signingConfigs.${flavor}
        }
        
    }
    `
}