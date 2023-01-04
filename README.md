## Features

* Use tab to next cursor, modify snippets code
* Prefix "c2" snippets, means "clipboard to" will use clipboard as value
* Prefix "b2" snippets means "baseFileName to" will use baseFileName as value
* Quick fix(on_text_selected) => Extension can be used on selected text 

#### 一般

|  快捷   |  描述  | 補充| 支援|
|  ----  | ----  |------|-----|
| c2up     | clipboard to Uppercase|剪貼板的文字為預設值  |Quick fix ( onText Selected )|
| c2low    | clipboard to lowerCase|剪貼板的文字為預設值  |Quick fix ( onText Selected )|
| c2camel  | clipboard to camelCase|剪貼板的文字為預設值  |Quick fix ( onText Selected )|
| fun      | Function definition ||

#### dart 

|  快捷   |  描述  | 補充| 支援|
|  ----  | ----  |------|-----|
| forLoop<br>forl  | just for loop   |||
| for    | just for loop   ||
| finalMember    | |final member= Member(); |
| finalMember    | |final member= Member(); |
| tc     | Try catch||
| toc    | Try on catch||
| fun    |  Function definition ||
| c2Factory  | clipboard to factory | const factory Clipboard.name() = Clipboard(); |
| c2FromJson   | clipboard to FromJson |  factory Clipboard.fromJson(Map<String, dynamic> json) => _ClipboardFromJson(json); <br>  Map<String, dynamic> toJson() => _$ClipboardToJson(this); |
| b2FromJson   | base file name to FromJson |factory baseFileName.fromJson(Map<String, dynamic> json) => _baseFileNameFromJson(json); <br> Map<String, dynamic> toJson() => _$baseFileNameToJson(this); |右鍵菜單|

#### freezed 

* State  snippets: will take base file name as class name 

|  快捷   |  描述  | 補充|支援|
|  ----  | ----  |------|------|
| fz.p     |import base_filename.g.dart<br>import base_filename.freezed.dart<br>  |引入後可選( .g / .freezed )|右鍵菜單 |
| fzClass    | Create Freezed Data Class  | 用於任何文件字定義 freezed class |右鍵菜單 |
| fzUnion   |Create Freezed Data Class with state  |參照freezed Union types and Sealed classes 生成的模板<br>|右鍵菜單 |
| fzAddState    | Add New Freezed State | 搭配 freezed Union types|右鍵菜單 |
| fzC2State  | Copy Class Name to Freezed State| 搭配 freezed Union types|

### 參考文件結構為範例

```
login
    |___bloc 
    |   |___login_bLoc.dart
    |   |___login_event.dart   
    |   |___login_state.dart
    |
    |__login_view.dart
    
```

### customer freeze class

```dart
// fzc
@freezed
abstract class DataClass with _$DataClass {
  const factory DataClass() = _DataClass;
  // copy class name "DataClass"
  // now "DataClass" in your copy board
  // fzc2State
  const factory DataClass.newState() = _DataClassNewState;
} 
```

### Use state snippets 

*  login_bLoc.dart

```dart
//fzWithState
@freezed
abstract class LoginBloc with _$LoginBloc {
  const factory LoginBloc.init() = _Initial;
  //fzState
  const factory LoginBloc.newState() = _NewState;
    }
}   
```

*  login_event.dart

```dart
//fzWithState
@freezed
abstract class LoginEvent with _$LoginEvent {
  const factory LoginEvent.initial() = _Initial;
  //fzState
  const factory LoginEvent.newState() = _NewState;
}

```

*  login_event.dart

```dart
//fzWithState
@freezed
abstract class LoginState with _$LoginState {
  const factory LoginState.initial() = _Initial;
  //fzState
  const factory LoginState.newState() = _NewState;
}
```

#### dart test

|  快捷   |  描述  | 補充|
|  ----  | ----  |------|
| ut     | Define a Unit test||
| utg    | Define a Unit test group||

## For more information

#### 右鍵菜單

|  名稱  |  描述  | 補充| 條件|
|  ----  | ----  |------|-----|
|Generate getter setter| Generate getter setter||onText Selected|
|To require param| To require param||onText Selected|
|  ----  | ----  |------|-----|
|Import freezed part| ||dart file|
|Create freezed Union| ||dart file|
|Add new freezed State by file name| ||dart file|
|  ----  | ----  |------|-----|
|Add new freezed State by file name| ||dart file|
|Create FromJson by file name| ||dart file|

* Generate getter setter

```dart
class Sample {
  bool open;
  //  selected 'bool open' => right click menu Generate getter setter
  //  auto Generate getter setter
  bool get getOpen => this.open;
  set setOpen(bool open) => this.open = open;
  Sample(this.open);
}

```

* To require param

```dart
class Sample {
  Sample(this.open, bool close);
  //  selected 'this.open' => right click menu To require param
  >> Sample({required this.open, required  bool close, });

}

```

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
