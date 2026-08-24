import { Space } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import { customFieldOptions, standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'basic.placeholder': '请选择职位',
    'custom.placeholder': '选择工作地点（字段映射）',
  },
  'en-US': {
    'basic.placeholder': 'Select position',
    'custom.placeholder': 'Select location (fieldNames)',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [value, setValue] = useState<string | undefined>('FE');
  const [location, setLocation] = useState<string>();

  return (
    <Space direction="vertical" size="middle" style={{ width: 280 }}>
      {/* 基础单选与搜索、清空 */}
      <PopoverSelect
        options={standardOptions}
        value={value}
        onChange={setValue}
        placeholder={t('basic.placeholder')}
        showSearch
        allowClear
      />

      {/* 自定义字段名映射 */}
      <PopoverSelect
        options={customFieldOptions}
        fieldNames={{ label: 'title', value: 'code', disabled: 'isInactive' }}
        value={location}
        onChange={setLocation}
        placeholder={t('custom.placeholder')}
        allowClear
      />
    </Space>
  );
};
