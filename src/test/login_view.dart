class LoginView with _$Test {
  const Test._();
  const factory Test({
    final String? street,
    final String? city,
    final int? phone,
    final bool? isBoy,
    final double? weight,
    // Parse Null value as dynamic
    final Dynamic? test,
  }) = _Test;
  factory Test.fromjson(Map<String, dynamic> json) => _$TestFromJson(json);
}
