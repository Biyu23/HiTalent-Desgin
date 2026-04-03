/**
 * title: 字符串提交与全选
 * description: 极其适合老旧后端的 `varchar` 字段。配置 `valueType="string"` 后，组件的内外数据交互将自动转换为按逗号拼接的字符串。全选按钮会智能匹配当前的搜索结果。
 */
import { PopoverSelect } from 'myui';
import React, { useState } from 'react';
import { standardOptions } from './mock';

export default () => {
  // 注意：这里的初始值是 string，而不是数组！
  const [values, setValues] = useState<string>('FE,PM');

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        options={standardOptions}
        value={values}
        onChange={(val) => setValues(val as string)}
        valueType="string" // 【核心】提交值和接收值都视为字符串
        valueSeparator="," // 按逗号拼接 (默认就是逗号，可不传)
        showSearch={true} // 开启搜索
        showSelectAll={true} // 【核心】开启全选
        placeholder="支持全选与字符串提交"
      />
      <div style={{ marginTop: 8, color: '#1677ff', fontSize: 12 }}>
        实际提交给后端的值：<strong>{values || '无'}</strong> (类型:{' '}
        {typeof values})
      </div>
    </div>
  );
};
