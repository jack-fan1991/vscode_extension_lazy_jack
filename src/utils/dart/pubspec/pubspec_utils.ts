import * as vscode from "vscode";
import { getWorkspacePath } from "../../vscode_utils";
import * as yaml from "yaml";
import * as fs from 'fs';
import { logError, logInfo } from "../../icon";


const PUBSPEC_FILE_NAME = "pubspec.yaml";
const PUBSPEC_LOCK_FILE_NAME = "pubspec.lock";

export function getPubspecPath(): string | undefined {
  return getWorkspacePath(PUBSPEC_FILE_NAME);
}

export function getPubspecLockPath(): string | undefined {
  return getWorkspacePath(PUBSPEC_LOCK_FILE_NAME);
}


export async function getPubspec(): Promise<Record<string, any> | undefined> {
    const pubspecPath = getPubspecPath();
    return getYAMLFileContent(pubspecPath);
  }
  
  export async function getPubspecLock(): Promise<Record<string, any> | undefined> {
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
  