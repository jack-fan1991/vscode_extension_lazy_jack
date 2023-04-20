// import * as yaml from "js-yaml";
// import { workspace, Uri } from "vscode";
// import { getWorkspacePath } from "../../workout_space_utils";
// import { readFile } from "../../file_utils";


// const PUBSPEC_FILE_NAME = "pubspec.yaml";
// const PUBSPEC_LOCK_FILE_NAME = "pubspec.lock";

// export function getPubspecPath(): string | undefined {
//   return getWorkspacePath(PUBSPEC_FILE_NAME);
// }

// export function getPubspecLockPath(): string | undefined {
//   return getWorkspacePath(PUBSPEC_LOCK_FILE_NAME);
// }



// export async function getPubspec(): Promise<Record<string, any> | undefined> {
//   const pubspecPath = getPubspecPath();
//   return getYAMLFileContent(pubspecPath);
// }

// export async function getPubspecLock(): Promise<Record<string, any> | undefined> {
//   const pubspecLockPath = getPubspecLockPath();
//   return getYAMLFileContent(pubspecLockPath);
// }

// async function getYAMLFileContent(path: string | undefined): Promise<any | undefined> {
//   if (path) {
//     try {
//       let content = await readFile(path);
//       return yaml.load(content);
//     } catch (_) { }
//   }
// }
