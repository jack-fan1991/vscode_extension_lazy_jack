"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomType = exports.CustomTypeManger = exports.JsonObjectManger = void 0;
const freezed_template_1 = require("./freezed_template");
class JsonObjectManger {
    constructor() {
        this.freezedFieldsCache = new Map();
        this.classWrapper = new Map();
        this.freezedTemplateList = [];
    }
    getCustomTypeManger(key) {
        return this.freezedFieldsCache.get(key);
    }
    setCustomTypeManger(key, value) {
        this.freezedFieldsCache.set(key, value);
    }
    getFreezedFields(key) {
        var _a;
        return (_a = this.freezedFieldsCache.get(key)) === null || _a === void 0 ? void 0 : _a.customTypeList.map((item) => item.toFreezedFieldFormat());
    }
    printCache() {
        for (const key of this.freezedFieldsCache.keys()) {
            let value = this.freezedFieldsCache.get(key);
            console.log(`freezedFieldsCache key: ${key} value: ${value === null || value === void 0 ? void 0 : value.customTypeList.map((item) => item.toFreezedFieldFormat())}`);
        }
    }
    parsWrapper() {
        if (this.classWrapper.size == 0) {
            return;
        }
        for (const className of this.classWrapper.keys()) {
            let value = this.classWrapper.get(className);
            if (value != null) {
                let template = (0, freezed_template_1.freezedWrapperClassTemplate)(className, [value.toFreezedFieldFormat()], value.fieldType);
                this.freezedTemplateList.push(template);
            }
        }
    }
    // @param mainClass: 最外層的class name 這裡使用baseFileName
    toFreezedTemplate(mainClass) {
        var _a, _b, _c;
        this.parsWrapper();
        let result = '';
        let mainFreezedFields = (_a = this.getFreezedFields(mainClass)) !== null && _a !== void 0 ? _a : [];
        let subClass = (_c = (_b = this.getCustomTypeManger(mainClass)) === null || _b === void 0 ? void 0 : _b.customTypeList.map((customType) => customType.fieldName)) !== null && _c !== void 0 ? _c : [];
        if (mainFreezedFields.length == 0) {
            throw new Error(`mainClass: ${mainClass} not found`);
        }
        let mainClassTemplate = (0, freezed_template_1.freezedClassTemplate)(mainClass, mainFreezedFields);
        this.freezedTemplateList.push(mainClassTemplate);
        for (let className of subClass) {
            let customTypeManger = this.getCustomTypeManger(className);
            if (customTypeManger != null) {
                this.toFreezedTemplate(className);
            }
        }
        return this.freezedTemplateList.join('\r\n\n');
    }
}
exports.JsonObjectManger = JsonObjectManger;
class CustomTypeManger {
    constructor() {
        this.customTypeList = [];
    }
    // 
    addCustomType(customType) {
        if (this.customTypeList.length === 0) {
            this.customTypeList.push(customType);
            return;
        }
        // 
        if (this.customTypeList.filter((t) => t.fieldName === customType.fieldName).length > 0) {
            for (let t of this.customTypeList) {
                if (customType.fieldName === t.fieldName) {
                    if (customType.fieldType == t.fieldType) {
                        return;
                    }
                    if (t.fieldType == 'dynamic') {
                        let idx = this.customTypeList.indexOf(t);
                        this.customTypeList[idx] = customType;
                    }
                }
            }
        }
        else {
            this.customTypeList.push(customType);
        }
    }
}
exports.CustomTypeManger = CustomTypeManger;
class CustomType {
    constructor(fieldType, fieldName, isArray = false) {
        this.fieldType = fieldType;
        this.fieldName = fieldName;
        this.isArray = isArray;
    }
    toFreezedFieldFormat() {
        return this.isArray ? (0, freezed_template_1.toFreezedArrayFieldFormat)(this.fieldType, this.fieldName) : (0, freezed_template_1.toFreezedFieldFormat)(this.fieldType, this.fieldName);
    }
}
exports.CustomType = CustomType;
//# sourceMappingURL=json_object_helper.js.map