"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showInfo2OptionMessage = void 0;
const vscode = require("vscode");
function showInfo2OptionMessage(msg, option1, option2, onOption1) {
    vscode.window.showInformationMessage(msg, option1 !== null && option1 !== void 0 ? option1 : '執行', option2 !== null && option2 !== void 0 ? option2 : '取消').then((selectedOption) => {
        if (onOption1 == null)
            return;
        if (selectedOption === '執行') {
            onOption1();
        }
        else if (selectedOption === '取消') {
            // 取消相應的操作
        }
    });
}
exports.showInfo2OptionMessage = showInfo2OptionMessage;
//# sourceMappingURL=common.js.map