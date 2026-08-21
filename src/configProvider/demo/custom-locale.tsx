/**
 * description: 传入完整语言包切换语言，使用 `localeOverrides` 局部覆盖文案；嵌套 Provider 会继承父级配置，并可独立切换 RTL。
 */
import { Space } from 'antd';
import { ConfigProvider, en_US, PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'locale.full': '完整英文语言包：',
    'locale.override': '继承英文语言包，仅覆盖指定文案：',
    'locale.rtl': '继承英文语言包，并将当前区域切换为 RTL：',
    'locale.placeholder': '选择需要的文档 🎯',
    'locale.confirm': '应用选择',
    'option.prd': '产品需求',
    'option.tech': '技术设计',
    'option.test': '测试评审',
  },
  'en-US': {
    'locale.full': 'Complete English locale:',
    'locale.override': 'Inherit the locale and override selected messages:',
    'locale.rtl': 'Inherit the locale and switch this region to RTL:',
    'locale.placeholder': 'Pick the documents you need 🎯',
    'locale.confirm': 'Apply selection',
    'option.prd': 'Product requirements',
    'option.tech': 'Technical design',
    'option.test': 'Test review',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const demoOptions = [
    { label: t('option.prd'), value: 'prd' },
    { label: t('option.tech'), value: 'tech' },
    { label: t('option.test'), value: 'test' },
  ];
  const captionStyle = {
    marginBottom: 8,
    color: 'var(--htd-doc-text-secondary, #666)',
    fontSize: 13,
  } as const;

  return (
    <ConfigProvider locale={en_US}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <p style={captionStyle}>{t('locale.full')}</p>
          <PopoverSelect
            mode="multiple"
            valueType="array"
            options={demoOptions}
            showConfirm
            style={{ width: 280 }}
          />
        </div>

        <ConfigProvider
          localeOverrides={{
            PopoverSelect: {
              placeholder: t('locale.placeholder'),
              confirm: t('locale.confirm'),
            },
          }}
        >
          <div>
            <p style={captionStyle}>{t('locale.override')}</p>
            <PopoverSelect
              mode="multiple"
              valueType="array"
              options={demoOptions}
              showConfirm
              style={{ width: 280 }}
            />
          </div>
        </ConfigProvider>

        <ConfigProvider direction="rtl">
          <div>
            <p style={captionStyle}>{t('locale.rtl')}</p>
            <PopoverSelect
              mode="multiple"
              valueType="array"
              options={demoOptions}
              showConfirm
              style={{ width: 280 }}
            />
          </div>
        </ConfigProvider>
      </Space>
    </ConfigProvider>
  );
};
