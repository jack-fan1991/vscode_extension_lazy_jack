
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
  }
}

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
  const factory Data(@JsonKey(name: "whitelist") final WhiteList whiteList) =
      _Data;
  factory Data.fromJson(Map<String, dynamic> json) => _$DataFromJson(json);
}

@freezed
class WhiteList with _$WhiteList {
  const WhiteList._();
  const factory WhiteList(
      {@Default([]) final List<String> startsWithList,
      @Default([]) final List<String> containsList}) = _WhiteList;
  factory WhiteList.fromJson(Map<String, dynamic> json) =>
      _$WhiteListFromJson(json);
}
