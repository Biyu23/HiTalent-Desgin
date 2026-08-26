/**
 * 检查值是否为 null、undefined、空字符串或空对象（Type Guard）
 * @method 判断是否空白值, `null`/`undefined`/""/`NaN` 会返回 `true`
 * @param value - 需要检查的值
 * @param strictMode - 若为 true，则会识别空数组 [] 和空对象 {} 为广义空值，默认是 false
 * @returns {boolean} 是否为空白值，若返回 false 则自动将变量类型窄化为非空类型
 */
export function isNullOrBlank(
  value: unknown,
  strictMode: boolean = false,
): value is null | undefined | '' {
  if (value === null || value === undefined) return true;

  if (typeof value === 'string' && value.trim() === '') return true;

  if (typeof value === 'number' && Number.isNaN(value)) return true;

  if (strictMode) {
    if (Array.isArray(value) && value.length === 0) return true;

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

/**
 * 判断值是否为有效非空白值（Type Guard）
 * @param value - 需要检查的值
 * @param strictMode - 若为 true，则空数组 [] 和空对象 {} 也会被判定为无效值
 * @returns {boolean} 是否为有效非空值
 */
export function isNotBlank<T>(
  value: T,
  strictMode: boolean = false,
): value is NonNullable<T> {
  return !isNullOrBlank(value, strictMode);
}
