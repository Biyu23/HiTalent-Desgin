/**
 * title: 基础单选与搜索
 * description: 默认模式为单选，点击后立即选中并关闭弹窗。配置 `showSearch` 可开启本地关键字过滤。
 */
import { PopoverSelect } from 'myui';
import React, { useState } from 'react';
import { standardOptions } from './mock';

export default () => {
  const [value, setValue] = useState<string>();

  return (
    <div style={{ width: 240 }}>
      <PopoverSelect
        options={standardOptions}
        value={value}
        onChange={(val) => setValue(val as string)}
        placeholder="请选择职位"
        allowClear={true} // 悬浮时显示清空图标
        showSearch={true} // 开启顶部搜索框
      />
      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
        当前选中：{value || '无'}
      </div>
    </div>
  );
};
