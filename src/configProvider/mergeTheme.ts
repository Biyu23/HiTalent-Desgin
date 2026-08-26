import type { ThemeConfig } from 'antd';
import { isPlainObject } from '../util';

/**
 * 深度安全合并普通对象
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T | undefined,
  source: Partial<T> | undefined,
): T {
  if (!target) return (source ? { ...source } : {}) as T;
  if (!source) return { ...target };

  const result: Record<string, unknown> = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  });

  return result as T;
}

/**
 * 深度合并 Ant Design 5 ThemeConfig
 *
 * 遵循 Ant Design 5 设计规范：
 * 1. 当 `currentTheme.inherit === false` 时，严格不继承父级配置，直接以子级为准；
 * 2. `token`：深度合并（子级覆盖父级对应 key）；
 * 3. `components`：按组件名深度合并（子级组件 token 覆盖父级同名组件 token）；
 * 4. `algorithm`：子级显式配置优先，否则继承父级；
 * 5. `cssVar` / `hashed` / `inherit`：子级显式配置优先，否则继承父级。
 */
export function mergeTheme(
  parentTheme?: ThemeConfig,
  currentTheme?: ThemeConfig,
): ThemeConfig | undefined {
  if (!parentTheme) return currentTheme;
  if (!currentTheme) return parentTheme;

  // 若子级显式声明 inherit: false，则完全独立，不继承父级任何 token 与 components
  if (currentTheme.inherit === false) {
    return currentTheme;
  }

  const mergedToken = deepMerge(parentTheme.token, currentTheme.token);
  const mergedComponents = deepMerge(
    parentTheme.components as Record<string, unknown> | undefined,
    currentTheme.components as Record<string, unknown> | undefined,
  );

  const mergedCssVar =
    isPlainObject(parentTheme.cssVar) && isPlainObject(currentTheme.cssVar)
      ? { ...parentTheme.cssVar, ...currentTheme.cssVar }
      : currentTheme.cssVar ?? parentTheme.cssVar;

  return {
    ...parentTheme,
    ...currentTheme,
    token: Object.keys(mergedToken).length > 0 ? mergedToken : undefined,
    components:
      Object.keys(mergedComponents).length > 0
        ? (mergedComponents as ThemeConfig['components'])
        : undefined,
    algorithm: currentTheme.algorithm ?? parentTheme.algorithm,
    hashed: currentTheme.hashed ?? parentTheme.hashed,
    inherit: currentTheme.inherit ?? parentTheme.inherit,
    cssVar: mergedCssVar,
  };
}
