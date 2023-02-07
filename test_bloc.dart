part 'test_bloc.g.dart';

@freezed
class ExternalLaunchResponse with _$ExternalLaunchResponse {
  const ExternalLaunchResponse._();
  const factory ExternalLaunchResponse(final Data data) =
      _ExternalLaunchResponse;
  factory ExternalLaunchResponse.fromJson(Map<String, dynamic> json) =>
      _$ExternalLaunchResponseFromJson(json);
}

@freezed
class Data with _$Data {
  const Data._();
  const factory Data(final WhiteList whiteList) = _Data;


  factory Data.fromJson(Map<String, dynamic> json) => _DataFromJson(json);
  Map<String, dynamic> toJson() => _$DataToJson(this);
}


@freezed
class ExternalLaunchResponse with _$ExternalLaunchResponse {
  const ExternalLaunchResponse._();
  const factory ExternalLaunchResponse.success(final Data data) = _Success;
  const factory ExternalLaunchResponse.failed() = _Failed;


  factory ExternalLaunchResponse.fromJson(Map<String, dynamic> json) => _ExternalLaunchResponseFromJson(json);
  Map<String, dynamic> toJson() => _$ExternalLaunchResponseToJson(this);
}

@freezed
class WhiteList with _$WhiteList {
  const WhiteList._();
  const factory WhiteList(
      {@Default([]) final List<String> startWith,
      @Default([]) final List<int> contains}) = _WhiteList;
 


  factory WhiteList.fromJson(Map<String, dynamic> json) => _WhiteListFromJson(json);
  Map<String, dynamic> toJson() => _$WhiteListToJson(this);
 }


{
  "data": {
    "whitelist": {
      "startsWithList": [
        "blog.owlting.com"
      ],
      "containsList": [
        "blog.owlting.com"
      ]
    }
  },
  "data2": {
    "whitelist": {
      "startsWithList": [
        "blog.owlting.com"
      ],
      "containsList": [
        "blog.owlting.com"
      ]
    }
  }
  
}