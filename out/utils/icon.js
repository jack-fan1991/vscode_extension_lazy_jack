"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = exports.logError = exports.Icon_Star = exports.Icon_Debug = exports.Icon_Success2 = exports.Icon_Info = exports.Icon_Warning = exports.Icon_Error = void 0;
exports.Icon_Error = '⛔';
exports.Icon_Warning = '⚠️';
exports.Icon_Info = '💡';
exports.Icon_Success2 = '✔️';
exports.Icon_Debug = '🐛';
exports.Icon_Star = '⭐';
function logError(msg = "") {
    console.log(`${exports.Icon_Error} : ${msg}`);
}
exports.logError = logError;
function logInfo(msg = "") {
    console.log(`${exports.Icon_Info} : ${msg}`);
}
exports.logInfo = logInfo;
//# sourceMappingURL=icon.js.map