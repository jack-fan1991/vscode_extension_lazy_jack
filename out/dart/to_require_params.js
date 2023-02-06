"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerToRequireParams = void 0;
const vscode = require("vscode");
const command_dart_2_require_param = "command_dart_2_require_param";
let s;
let setter;
let arr = [];
function registerToRequireParams(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_dart_2_require_param, () => __awaiter(this, void 0, void 0, function* () {
        generator();
    })));
}
exports.registerToRequireParams = registerToRequireParams;
function generator() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const selection = editor.selection;
    let text = editor.document.getText(selection);
    if (text.length < 1) {
        vscode.window.showErrorMessage('No selected properties.');
        return;
    }
    let properties = text.split(',');
    let required = [];
    let unRequired = [];
    for (let p of properties) {
        required.push("required " + p);
    }
    let result = '{';
    for (let r of required) {
        result += r + ", ";
    }
    result += "}";
    editor.document.getText(editor.selection);
    let e = new vscode.WorkspaceEdit();
    e.replace(editor.document.uri, editor.selection, result);
    vscode.workspace.applyEdit(e);
}
//# sourceMappingURL=to_require_params.js.map