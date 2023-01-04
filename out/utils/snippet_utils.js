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
exports.registerDartSnippet = void 0;
const vscode = require("vscode");
const command_import_freezed_part = 'dart.import.freezed';
const command_create_freezed_class_by_base_fileName = 'command_create_freezed_class_by_base_fileName';
const command_create_freezed_union_class_by_base_fileName = 'command_create_freezed_union_class_by_base_fileName';
const command_new_freezed_state_by_base_fileName = 'command_add_freezed_state_by_base_fileName';
const command_create_from_json = 'command_create_from_json';
const snippet_import_freezed = 'import freezed part';
const snippet_create_freezed_class = 'Freezed Data Class';
const snippet_create_freezed_union = 'Freezed Union Class';
const snippet_new_freezed_state = 'Add New freezed State';
const snippet_create_from_json = 'Crate FromJson';
function registerDartSnippet(context) {
    context.subscriptions.push(vscode.commands.registerCommand(command_import_freezed_part, () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('editor.action.insertSnippet', { name: snippet_import_freezed });
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_create_freezed_class_by_base_fileName, () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('editor.action.insertSnippet', { name: snippet_create_freezed_class });
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_create_freezed_union_class_by_base_fileName, () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('editor.action.insertSnippet', { name: snippet_create_freezed_union });
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_new_freezed_state_by_base_fileName, () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('editor.action.insertSnippet', { name: snippet_new_freezed_state });
    })));
    context.subscriptions.push(vscode.commands.registerCommand(command_create_from_json, () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('editor.action.insertSnippet', { name: snippet_create_from_json });
    })));
}
exports.registerDartSnippet = registerDartSnippet;
//# sourceMappingURL=snippet_utils.js.map