/**
 * description: 通过 `theme` 属性直接定制 Ant Design 5 的 Design Token（如主色、圆角、组件特定 Token），子级组件和底层 Antd 组件统一响应动态主题。
 */
import { Space } from 'antd';
import {
  Button,
  ConfigProvider,
  PopoverSelect,
  ResponsiveButtonGroup,
} from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'theme.default': '默认主题',
    'theme.purple': '紫色品牌主题（Token 定制）',
    'theme.toggle': '切换主题色彩',
    'theme.select': '选择模块',
    'theme.action1': '主要操作',
    'theme.action2': '次要操作',
    'theme.action3': '辅助功能',
  },
  'en-US': {
    'theme.default': 'Default Theme',
    'theme.purple': 'Purple Brand Theme (Token Customization)',
    'theme.toggle': 'Toggle Theme Color',
    'theme.select': 'Select Module',
    'theme.action1': 'Primary Action',
    'theme.action2': 'Secondary Action',
    'theme.action3': 'Auxiliary Feature',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [isPurple, setIsPurple] = useState(false);

  const customTheme = isPurple
    ? {
        token: {
          colorPrimary: '#722ed1',
          borderRadius: 8,
        },
      }
    : undefined;

  const demoOptions = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Settings', value: 'settings' },
  ];

  return (
    <ConfigProvider theme={customTheme}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          <Button type="primary" onClick={() => setIsPurple(!isPurple)}>
            {t('theme.toggle')} (
            {isPurple ? t('theme.purple') : t('theme.default')})
          </Button>
        </Space>

        <div
          style={{
            padding: 20,
            border: '1px dashed var(--htd-doc-border-color, #d9d9d9)',
            borderRadius: 8,
          }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <PopoverSelect
              options={demoOptions}
              placeholder={t('theme.select')}
              style={{ width: 240 }}
            />
            <ResponsiveButtonGroup
              mode="expanded"
              items={[
                {
                  key: '1',
                  label: t('theme.action1'),
                  buttonProps: { type: 'primary' },
                },
                { key: '2', label: t('theme.action2') },
                { key: '3', label: t('theme.action3') },
              ]}
            />
          </Space>
        </div>
      </Space>
    </ConfigProvider>
  );
};
