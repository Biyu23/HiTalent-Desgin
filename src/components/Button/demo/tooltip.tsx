/**
 * description: 支持通过 `tooltip` 属性为按钮配置气泡提示（支持文本或 TooltipProps 对象），常用于禁用按钮原因解释或操作补充说明。
 */
import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'tooltip.disabled': '请先完成必填项',
    'tooltip.submit': '提交',
    'tooltip.hint': '点击直接保存当前表单',
    'tooltip.customPlacement': '自定义方位提示',
  },
  'en-US': {
    'tooltip.disabled': 'Please fill in required fields first',
    'tooltip.submit': 'Submit',
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
        {t('tooltip.submit')}（禁用提示）
      </Button>
      <Button tooltip={{ title: t('tooltip.hint'), placement: 'top' }}>
        {t('tooltip.customPlacement')}
      </Button>
    </Space>
  );
};
