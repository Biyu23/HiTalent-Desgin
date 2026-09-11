import { Space, Switch, Typography } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'sort.virtual': '虚拟滚动',
    'sort.placeholder': '选择并拖拽排序',
    'sort.order': '候选项顺序',
    'sort.value': '已确认选中值',
  },
  'en-US': {
    'sort.virtual': 'Virtual scrolling',
    'sort.placeholder': 'Select and reorder',
    'sort.order': 'Option order',
    'sort.value': 'Confirmed selection',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [options, setOptions] = useState(standardOptions);
  const [value, setValue] = useState<string[]>(['FE']);
  const [virtual, setVirtual] = useState(true);

  return (
    <Space direction="vertical" style={{ maxWidth: '100%' }}>
      <Space>
        <Switch checked={virtual} onChange={setVirtual} />
        {t('sort.virtual')}
      </Space>
      <PopoverSelect
        style={{ width: 300 }}
        mode="multiple"
        options={options}
        value={value}
        onChange={setValue}
        sortable
        onSortChange={setOptions}
        virtual={virtual}
        showSearch
        showSelectAll
        showConfirm
        showCancelBtn
        placeholder={t('sort.placeholder')}
      />
      <Typography.Text>
        {t('sort.order')}: {options.map((option) => option.value).join(', ')}
      </Typography.Text>
      <Typography.Text>
        {t('sort.value')}: {value.join(', ')}
      </Typography.Text>
    </Space>
  );
};
