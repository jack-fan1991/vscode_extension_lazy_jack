"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryParseJson = void 0;
const vscode = require("vscode");
const icon_1 = require("./icon");
function tryParseJson(text) {
    try {
        return JSON.parse(text);
    }
    catch (_) {
        (0, icon_1.logError)(`JSON parse error`);
        vscode.window.showErrorMessage(`JSON parse error`);
        throw _;
    }
}
exports.tryParseJson = tryParseJson;
//# sourceMappingURL=json_utils.js.map