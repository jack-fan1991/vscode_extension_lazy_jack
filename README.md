## Features

* teb to next cursor
* c2 snippets will use clipboard as value
#### 一般

|  快捷   |  描述  | 補充|
|  ----  | ----  |------|
| c2up     | clipboard to Uppercase|剪貼板的文字為預設值 |
| c2low    | clipboard to lowerCase|剪貼板的文字為預設值 |
| c2camel  | clipboard to camelCase|剪貼板的文字為預設值 |
| fun      | Function definition |

#### dart 

|  快捷   |  描述  | 補充|
|  ----  | ----  |------|
| forLoop<br>forl  | just for loop   ||
| for    | just for loop   ||
| finalMember<br>fm     | final member= Member();||
| tc     | Try catch||
| toc    | Try on catch||
| c2Factory<br> c2f    | clipboard to factory |複製小要新增的 factory case 的 class name ,<br>複製的class name 為factory class name|
| fun    |  Function definition ||

#### freezed 

* State  snippets: will take base file name as class name 

|  快捷   |  描述  | 補充|
|  ----  | ----  |------|
| fz.p     |import current_filename.g.dart<br>import current_filename.freezed.dart<br>  |可選( .g / .freezed )|
| fzClass<br>fzc     |  Freezed Data Class  | 自定義class|
| fzWithState<br>fzw     |  Freezed Data Class with state  |參照freezed Union types and Sealed classes 生成的模板<br>|
| fzState<br>fzs    | Create Freezed State | 搭配 freezed Union types|
| fzC2State<br>fzc2s    | Copy Class Name to Freezed State| 搭配 freezed Union types|


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

``` dart
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
``` dart
//fzWithState
@freezed
abstract class LoginBloc with _$LoginBloc {
  const factory LoginBloc.init() = _LoginBlocInit;
  //fzState
  const factory LoginBloc.newState() = _login_blocNewState;
    }
}   
```

*  login_event.dart
``` dart
//fzWithState
@freezed
abstract class LoginEvent with _$LoginEvent {
  const factory LoginEvent.init() = _LoginEventInit;
  //fzState
  const factory LoginEvent.newState() = _login.eventNewState;
}

```

*  login_event.dart
``` dart
//fzWithState
@freezed
abstract class LoginState with _$LoginState {
  const factory LoginState.init() = _LoginStateInit;
  //fzState
  const factory LoginState.newState() = _login_stateNewState;
}
```





#### dart test

|  快捷   |  描述  | 補充|
|  ----  | ----  |------|
| ut     | Define a Unit test||
| utg    | Define a Unit test group||

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)


**Enjoy!**
