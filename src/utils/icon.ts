export const Icon_Error = '⛔';
export const Icon_Warning = '⚠️';
export const Icon_Info = '💡';
export const Icon_Success2 = '✔️';
export const Icon_Debug = '🐛';
export const Icon_Star = '⭐';

export function logError(msg: any = "") {
    console.log(`${Icon_Error} : ${msg}`);
}

export function logInfo(msg: string = "") {
    console.log(`${Icon_Info} : ${msg}`);
}
