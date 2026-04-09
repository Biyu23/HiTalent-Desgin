/**
 * 检查值是否为 null、undefined、空字符串或空对象
 * @method 判断是否空白值,`null`/`undefined`/""/`NaN`会返回`true`
 * @param value - 需要检查的值
 * @param strictMode - 若为 true，则会识别空数组 [] 和空对象 {} 为广义空值，默认是 false
 * @returns {boolean} 是否为空白值
 */
export function isNullOrBlank(
  value: unknown,
  strictMode: boolean = false,
): boolean {
  // 检查 null 或 undefined
  if (value === null || value === undefined) {
    return true;
  }

  // 检查空字符串
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }

  // 检查 NaN (推荐使用 Number.isNaN 替代全局 isNaN，更加严谨)
  if (typeof value === 'number' && Number.isNaN(value)) {
    return true;
  }

  // 严格模式：检查空数组和空对象
  if (strictMode) {
    // 检查空数组
    if (Array.isArray(value) && value.length === 0) {
      return true;
    }

    // 检查空对象 (替代原有的 isObject 判断)
    // typeof 排除 null 和数组后，判断对象及其键的长度
    if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return true;
    }
  }

  return false;
}
