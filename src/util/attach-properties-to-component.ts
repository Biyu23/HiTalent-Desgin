/**
 * @name 融合属性到组件
 * @param component 待添加属性的组件
 * @param properties 属性对象
 */
export function attachPropertiesToComponent<C, P extends object>(
  component: C,
  properties: P,
): C & P {
  const ret = component as C & P;
  for (const key in properties) {
    if (Object.prototype.hasOwnProperty.call(properties, key)) {
      (ret as any)[key] = properties[key];
    }
  }

  return ret;
}
