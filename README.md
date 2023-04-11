# Feature
### QuickFix part of
![](./image/quickfix/part_of_error.png)
![](./image/quickfix/part_of_quick_fix_action.png)
![](./image/quickfix/part_of_quick_fix_done.png)

### Freezed auto import
* After input "@freezed" will auto import
![](./image/quickfix/freezed_auto_import.png)

### Freezed extension action
* Show when cursor on class Line
![](./image/quickfix/freezed_extension.png)
![](./image/quickfix/freezed_extension_action.png)
### Freezed from json method
![](./image/quickfix/freezed_extension_fromJson_done.png)
* put cursor on from json method will Auto add "part baseFileName.g.dart"
![](./image/quickfix/freezed_auto_g.png)



### Freezed union create
![](./image/quickfix/freezed_union.png)

### Freezed add union state
![](./image/quickfix/freezed_new_state_done.png)


### Json to freezed
![](./image/quickfix/json_to_freezed.png)
* Menu
![](./image/quickfix/json_to_freezed_fix_action.png)
* Fix Action
	* !! Show Only Json format!!
![](./image/quickfix/json_to_freezed_menu.png)
#### Convert to freezed
```dart 
import 'package:freezed_annotation/freezed_annotation.dart';
part 'test_api.g.dart';
part 'test_api.freezed.dart';

@freezed
class TestApi with _$TestApi {
  const TestApi._();
  const factory TestApi({
    final User? user,
    final Location? location,
    @Default([]) final List<String> devices,
    @Default([]) final List<Devices2> devices2,
  }) = _TestApi;
  factory TestApi.fromJson(Map<String, dynamic> json) =>
      _$TestApiFromJson(json);
}

@freezed
class Devices2 with _$Devices2 {
  const Devices2._();
  const factory Devices2({
    final String? logo,
  }) = _Devices2;
  factory Devices2.fromJson(Map<String, dynamic> json) =>
      _$Devices2FromJson(json);
}

@freezed
class Location with _$Location {
  const Location._();
  const factory Location({
    final String? city,
    final String? state,
    final int? zipcode,
  }) = _Location;
  factory Location.fromJson(Map<String, dynamic> json) =>
      _$LocationFromJson(json);
}

@freezed
class User with _$User {
  const User._();
  const factory User({
    final Name? name,
    final int? age,
    final String? email,
  }) = _User;
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class Name with _$Name {
  const Name._();
  const factory Name({
    final String? first,
    final String? last,
  }) = _Name;
  factory Name.fromJson(Map<String, dynamic> json) => _$NameFromJson(json);
}


```
 

 ##  Class to factory (dev)

* Select text

![](./image/to_factory/menu.png)
* Enter name

![](./image/to_factory/input.png)
* Finish

![](./image/to_factory/finsh.png)

## Support
* [Snippets Menu](./doc/snippets.md)
* [Right click Menu](./doc/menu_right_click.md)


## SideBar GUI

![Before](./image/sideBar.png)


