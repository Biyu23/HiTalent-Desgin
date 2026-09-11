import { Button, Space } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'custom.count': '当前选择',
    'custom.clear': '清空',
    'custom.cancel': '取消',
    'custom.confirm': '应用',
    'custom.selector': '自定义面板',
    'custom.content': '这里可以放置任意业务内容',
    'custom.close': '关闭',
  },
  'en-US': {
    'custom.count': 'Selected',
    'custom.clear': 'Clear',
    'custom.cancel': 'Cancel',
    'custom.confirm': 'Apply',
    'custom.selector': 'Custom panel',
    'custom.content': 'Place your own content here',
    'custom.close': 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [value, setValue] = useState<string[]>(['FE']);
  return (
    <Space direction="vertical">
      <PopoverSelect
        mode="multiple"
        value={value}
        onChange={setValue}
        options={standardOptions}
        style={{ width: 300 }}
        optionRender={(option, info) => (
          <span style={{ fontWeight: info.selected ? 600 : 400 }}>
            {option.label}
          </span>
        )}
        dropdownRender={(menu, context) => (
          <>
            <div style={{ padding: '8px 12px' }}>
              {t('custom.count')}: {context.selectedValues.length}
            </div>
            {menu}
          </>
        )}
        footerRender={(_, context) => (
          <Space>
            <Button size="small" onClick={context.clear}>
              {t('custom.clear')}
            </Button>
            <Button size="small" onClick={context.cancel}>
              {t('custom.cancel')}
            </Button>
            <Button size="small" type="primary" onClick={context.confirm}>
              {t('custom.confirm')}
            </Button>
          </Space>
        )}
        labelRender={(label, info) => (
          <>
            {label} ({info.values.length})
          </>
        )}
      />
      <PopoverSelect.Selector
        content={({ close }) => (
          <div style={{ padding: 12 }}>
            <p>{t('custom.content')}</p>
            <Button onClick={close}>{t('custom.close')}</Button>
          </div>
        )}
      >
        {t('custom.selector')}
      </PopoverSelect.Selector>
    </Space>
  );
};
