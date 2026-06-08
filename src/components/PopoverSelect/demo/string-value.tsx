/**
 * title: 字符串提交与全选
 * description: 极其适合老旧后端的 `varchar` 字段。配置 `valueType="string"` 后，组件的内外数据交互将自动转换为按逗号拼接的字符串。全选按钮会智能匹配当前的搜索结果。
 */
import { PopoverSelect } from 'myui';
import { useDemoIntl } from 'myui/demoIntl';
import React, { useState } from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'str.placeholder': '支持全选与字符串提交',
    'str.submitted': '实际提交给后端的值',
    'str.type': '类型',
    'str.none': '无',
  },
  'en-US': {
    'str.placeholder': 'Select All & String Submit',
    'str.submitted': 'Value sent to backend',
    'str.type': 'Type',
    'str.none': 'None',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [values, setValues] = useState<string>('FE,PM');

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        options={standardOptions}
        value={values}
        onChange={(val) => setValues(val as string)}
        valueType="string"
        valueSeparator=","
        showSearch
        showSelectAll
        placeholder={t('str.placeholder')}
      />
      <div style={{ marginTop: 8, color: '#1677ff', fontSize: 12 }}>
        {t('str.submitted')}：<strong>{values || t('str.none')}</strong> (
        {t('str.type')}: {typeof values})
      </div>
    </div>
  );
};
