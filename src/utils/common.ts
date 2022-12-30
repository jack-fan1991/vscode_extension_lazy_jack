import * as vscode from 'vscode';


export function showInfo2OptionMessage(msg: string, option1?: string, option2?: string, onOption1?: () => void) {
  vscode.window.showInformationMessage(msg, option1 ?? '執行', option2 ?? '取消').then((selectedOption) => {
    if (onOption1 == null) return;
    if (selectedOption === '執行') {
      onOption1();
    } else if (selectedOption === '取消') {
      // 取消相應的操作
    }
  });
}