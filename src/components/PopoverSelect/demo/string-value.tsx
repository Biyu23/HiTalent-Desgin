/**
 * description: 配置 `valueType="string"` 后，组件以 JSON 数组字符串提交，完整保留字符串与数字选项值的类型；全选联动当前搜索结果。
 */
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
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
  const [values, setValues] = useState<string>(JSON.stringify([1, 'PM']));
  const options = [{ label: 'Numeric ID 1', value: 1 }, ...standardOptions];

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        options={options}
        value={values}
        onChange={setValues}
        valueType="string"
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
