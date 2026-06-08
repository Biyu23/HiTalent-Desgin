/**
 * title: 基础单选与搜索
 * description: 默认模式为单选，点击后立即选中并关闭弹窗。配置 `showSearch` 可开启本地关键字过滤。
 */
import { PopoverSelect } from 'myui';
import { useDemoIntl } from 'myui/demoIntl';
import React, { useState } from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'basic.placeholder': '请选择职位',
    'basic.current': '当前选中',
    'basic.none': '无',
  },
  'en-US': {
    'basic.placeholder': 'Select a position',
    'basic.current': 'Current selection',
    'basic.none': 'None',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [value, setValue] = useState<string>();

  return (
    <div style={{ width: 240 }}>
      <PopoverSelect
        options={standardOptions}
        value={value}
        onChange={(val) => setValue(val as string)}
        placeholder={t('basic.placeholder')}
        allowClear
        showSearch
      />
      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
        {t('basic.current')}：{value || t('basic.none')}
      </div>
    </div>
  );
};
