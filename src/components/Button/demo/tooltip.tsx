import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'tooltip.disabled': '请先完成必填项',
    'tooltip.submit': '提交',
    'tooltip.disabledBtn': '提交（禁用提示）',
    'tooltip.hint': '点击直接保存当前表单',
    'tooltip.customPlacement': '自定义方位提示',
  },
  'en-US': {
    'tooltip.disabled': 'Please fill in required fields first',
    'tooltip.submit': 'Submit',
    'tooltip.disabledBtn': 'Submit (Disabled)',
    'tooltip.hint': 'Click to save current form',
    'tooltip.customPlacement': 'Custom Placement',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space>
      <Button type="primary" tooltip={t('tooltip.hint')}>
        {t('tooltip.submit')}
      </Button>
      <Button disabled tooltip={t('tooltip.disabled')}>
        {t('tooltip.disabledBtn')}
      </Button>
      <Button tooltip={{ title: t('tooltip.hint'), placement: 'top' }}>
        {t('tooltip.customPlacement')}
      </Button>
    </Space>
  );
};
