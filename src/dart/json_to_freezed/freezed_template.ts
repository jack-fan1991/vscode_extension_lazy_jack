import { isLowerCamelCase, isPlural, toLowerCamelCase, toUpperCamelCase } from "../../utils/regex_utils";

function freezedFromJsonMethod(className: string): string {
    return `factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);`;
}
function freezedWrapperFromJsonMethod(className: string, protoType: string): string {
    return `factory ${className}.fromJson(List<dynamic> jsonArray) => _$${className}FromJson({"${toLowerCamelCase(protoType)}":jsonArray});`;
}

function freezedToJsonMethod(className: string): string {
    return `Map<String, dynamic> toJson() => _$${className}ToJson(this);`;
}


export function toFreezedArrayFieldFormat(dartType: string, fieldName: string): string {
    if (dartType != 'dynamic') {
        dartType = toUpperCamelCase(dartType)
    }
    fieldName = toLowerCamelCase(fieldName)
    let prefix = dartType === 'dynamic' ? "// Parse Null value as dynamic\n\t\t" : ''
    if (isLowerCamelCase(fieldName)) {
        return `${prefix}@Default([]) final List<${dartType}> ${fieldName}`;
    } else {
        return `${prefix}@JsonKey(name: '${fieldName}')\t@Default([]) final List<${dartType}> ${fieldName}`;
    }
}

export function toFreezedFieldFormat(dartType: string, fieldName: string): string {
    if (!['int', 'double', 'dynamic', 'bool'].includes(dartType)) {
        dartType = toUpperCamelCase(dartType)
    }
    fieldName = toLowerCamelCase(fieldName)
    let prefix = dartType === 'dynamic' ? "// Parse Null value as dynamic\n\t\t" : ''
    if (isLowerCamelCase(fieldName)) {
        return `${prefix}final ${dartType}? ${fieldName}`;
    } else {
        return `${prefix}@JsonKey(name: '${fieldName}')\tfinal ${dartType}? ${fieldName}`;
    }
}


/// 這裡的 params 要轉成 dart  的格式 =>[final String? name]
export function freezedClassTemplate(className: string, fields: string[]): string {
    className = toUpperCamelCase(className)
    let fromJsonMethod = freezedFromJsonMethod(className);
    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${fields.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`
    if (isPlural(className) && !className.endsWith('ss')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz
}


/// 這裡的 params 要轉成 dart  的格式 =>[final String? name]
export function freezedWrapperClassTemplate(className: string, fields: string[], protoType: string): string {
    className = toUpperCamelCase(className)
    let fromJsonMethod = freezedWrapperFromJsonMethod(className, protoType);
    let clz = `@freezed
class ${className} with _$${className} {
\tconst ${className}._();
\tconst factory ${className}({\n\t\t${fields.join(',\n\t\t')},
\t}) = _${className};
\t${fromJsonMethod}
}`
    if (isPlural(className) && !className.endsWith('ss')) {
        clz = `/// ignore Verify plural type naming confusion\n${clz}`;
    }
    return clz
}

