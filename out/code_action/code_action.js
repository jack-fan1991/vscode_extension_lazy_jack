"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.diagnostics = void 0;
const vscode = require("vscode");
const dart_part_fixer_1 = require("./dart/dart_part_fixer");
const diagnostics_error_code_handler_1 = require("./dart/diagnostics_error_code_handler");
const diagnostics_1 = require("./dart/diagnostics");
const freezed_import_fixer_1 = require("./dart/freezed_import_fixer");
const json_to_freezed_fixer_1 = require("./dart/json_to_freezed_fixer");
const freezed_union_fixer_1 = require("./dart/freezed_union_fixer");
const param_to_required_fixer_1 = require("./dart/param_to_required_fixer");
const refator_text_style_fixer_1 = require("./dart/refator_text_style_fixer");
// 設定常數，代表指令的名稱
const DART_MODE = { language: "dart", scheme: "file" };
const quickFixCodeAction = [vscode.CodeActionKind.Refactor];
exports.diagnostics = vscode.languages.createDiagnosticCollection("DartPartFixer");
// 啟動擴充套件
function register(context) {
    let providers = [];
    providers.push(new freezed_union_fixer_1.FreezedUnionFixer());
    providers.push(new dart_part_fixer_1.DartPartFixer());
    providers.push(new freezed_import_fixer_1.FreezedFixer());
    providers.push(new json_to_freezed_fixer_1.JsonToFreezedFixer());
    providers.push(new param_to_required_fixer_1.ParamToRequiredFixer());
    // providers.push(new StringConvertFixer())
    providers.push(new refator_text_style_fixer_1.RefactorTextStyleFixer());
    for (let p of providers) {
        // 註冊命令回調
        p.setOnActionCommandCallback(context);
        // 註冊支援程式碼動作的提供者，並指定支援的程式語言為 dart
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(p.getLangrageType(), p, {
            providedCodeActionKinds: p.getProvidedCodeActionKinds()
        }));
    }
    // 建立語言診斷集合
    context.subscriptions.push(exports.diagnostics);
    // 訂閱文件變更事件，以重新計算語言診斷
    (0, diagnostics_1.subscribeToDocumentChanges)(context, exports.diagnostics, providers);
    // 註冊支援程式碼動作的提供者，並指定支援的程式語言為 dart
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(DART_MODE, new diagnostics_error_code_handler_1.DiagnosticsErrorCodeHandler(providers), {
        providedCodeActionKinds: diagnostics_error_code_handler_1.DiagnosticsErrorCodeHandler.providedCodeActionKinds
    }));
}
exports.register = register;
//# sourceMappingURL=code_action.js.map