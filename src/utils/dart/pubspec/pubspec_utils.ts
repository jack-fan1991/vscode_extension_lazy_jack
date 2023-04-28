import { getWorkspacePath } from "../../vscode_utils";
import * as yaml from "yaml";
import * as fs from 'fs';
import { logError, logInfo } from "../../icon";
import { readFileToText, replaceText } from "../../file_utils";


const PUBSPEC_FILE_NAME = "pubspec.yaml";
const PUBSPEC_LOCK_FILE_NAME = "pubspec.lock";

export function getPubspecPath(): string | undefined {
  return getWorkspacePath(PUBSPEC_FILE_NAME);
}

export function getPubspecLockPath(): string | undefined {
  return getWorkspacePath(PUBSPEC_LOCK_FILE_NAME);
}


export async function getPubspecAsMap(): Promise<Record<string, any> | undefined> {
    const pubspecPath = getPubspecPath();
    return getYAMLFileContent(pubspecPath);
  }

  export  function getPubspecAsText(): string {
    const pubspecPath = getPubspecPath();
    return getYAMLFileText(pubspecPath??'');
  }
  
  
  export async function getPubspecLockAsMap(): Promise<Record<string, any> | undefined> {
    const pubspecLockPath = getPubspecLockPath();
    return getYAMLFileContent(pubspecLockPath);
  }
  
  async function getYAMLFileContent(path: string | undefined): Promise<Record<string, any> | undefined> {
      try {
        if (path==undefined) throw new Error("path is undefined");
        logInfo(`正在解析 ${path}`,true)
        const fileContents = fs.readFileSync(path, 'utf-8');
        return yaml.parse(fileContents);
      } catch (e) {
        logError(`getYAMLFileContent ${e}`,true)
      }
    
  }
  
export function getYAMLFileText(path: string ){
 return readFileToText(path)
}

export async function replaceInPubspecFile( searchValue: string, replaceValue: string): Promise<boolean> {
  const pubspecPath = getPubspecPath();
  return await replaceText(pubspecPath!,searchValue,replaceValue)
}