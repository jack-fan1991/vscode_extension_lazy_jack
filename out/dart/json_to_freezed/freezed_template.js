"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.freezedWrapperClassTemplate = exports.freezedClassTemplate = exports.toFreezedFieldFormat = exports.toFreezedArrayFieldFormat = void 0;
const regex_utils_1 = require("../../utils/regex_utils");
function freezedFromJsonMethod(className) {
    return `factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`;
}
function freezedWrapperFromJsonMethod(className, protoType) {
    return `factory ${className}.fromJson(List<dynamic> jsonArray) => _$${className}FromJson({"${(0, regex_utils_1.toLowerCamelCase)(protoType)}":jsonArray});`;
}
function freezedToJsonMethod(className) {
    return `Map<String, dynamic> toJson() => _$${className}ToJson(this);`;
}
function toFreezedArrayFieldFormat(dartType, fieldName) {
    if (dartType != 'dynamic') {
        dartType = (0, regex_utils_1.toUpperCamelCase)(dartType);
    }
    fieldName = (0, regex_utils_1.toLowerCamelCase)(fieldName);
    let prefix = dartType === 'dynamic' ? "// Parse Null value as dynamic\n\t\t" : '';
    if ((0, regex_utils_1.isLowerCamelCase)(fieldName)) {
        return `${prefix}@Default([]) final List<${dartType}> ${fieldName}`;
    }
    else {
        return `${prefix}@JsonKey(name: '${fieldName}')\t@Default([]) final List<${dartType}> ${fieldName}`;
    }
}
exports.toFreezedArrayFieldFormat = toFreezedArrayFieldFormat;
function toFreezedFieldFormat(dartType, fieldName) {
    if (!['int', 'double', 'dynamic', 'bool'].includes(dartType)) {
        dartType = (0, regex_utils_1.toUpperCamelCase)(dartType);
    }
    fieldName = (0, regex_utils_1.toLowerCamelCase)(fieldName);
    let prefix = dartType === 'dynamic' ? "// Parse Null value as dynamic\n\t\t" : '';
    if ((0, regex_utils_1.isLowerCamelCase)(fieldName)) {
        return `${prefix}final ${dartType}? ${fieldName}`;
    }
    else {
        return `${prefix}@JsonKey(name: '${fieldName}')\tfinal ${dartType}? ${fieldName}`;
    }
}
exports.toFreezedFieldFormat = toFreezedFieldFormat;
/// 這裡的 params 要轉成 dart  的格式 =>[final String? name]
function freezedClassTemplate(className, fields) {
    className = (0, regex_utils_1.toUpperCamelCase)(className);
    let fromJsonMethod = freezedFromJsonMethod(className);
    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${fields.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`;
    if ((0, regex_utils_1.isPlural)(className) && !className.endsWith('ss')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz;
}
exports.freezedClassTemplate = freezedClassTemplate;
/// 這裡的 params 要轉成 dart  的格式 =>[final String? name]
function freezedWrapperClassTemplate(className, fields, protoType) {
    className = (0, regex_utils_1.toUpperCamelCase)(className);
    let fromJsonMethod = freezedWrapperFromJsonMethod(className, protoType);
    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${fields.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`;
    if ((0, regex_utils_1.isPlural)(className) && !className.endsWith('ss')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz;
}
exports.freezedWrapperClassTemplate = freezedWrapperClassTemplate;
//# sourceMappingURL=freezed_template.js.map