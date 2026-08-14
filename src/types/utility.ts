/** 递归地将对象属性变为可选；函数类型保持原签名。 */
export type DeepPartial<T> = T extends (...args: any[]) => unknown
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
