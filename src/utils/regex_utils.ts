///这个正则表达式的含义是：以 class 开头，后面可以跟任意数量的空格（\s+）,0~任意空格(\s*/)，
///然后是一个以字母开头的单词（[a-zA-Z]\w*）表示类名，
///然后是 extends 和一个单词（\w+），表示类的继承关系
///匹配泛型 (<[\w\s<>,]*>)?
///这个正则表达式会匹配整个 class 声明语句，而类名会匹配为第一个捕获组。
export const findSubClassRegex = /class\s+([a-zA-Z]\w*)(<[\w\s<>,]*>)?\s+extends\s+\w*/;
export const findClassRegex = /class\s+([a-zA-Z]\w*)(<[\w\s<>,]*>)?\s*/;
export const findSuperClassRegex = /extends\s+([a-zA-Z]\w*)/;
export const findDartImportRegex = /^import\s+['"][^'"]+['"];/gm
export const findPartLine = /part\s+([a-zA-Z]\w*).dart/;
export const findPartOfLine = /part of\s+([a-zA-Z]\w*).dart/;
export const findFreezedClassRegex = /with _\$/;



export function toUpperCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, '')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
      return word.toUpperCase() ;
    })
    .replace(/\s+/g, '');
}

 
export function toLowerCamelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, '')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}
