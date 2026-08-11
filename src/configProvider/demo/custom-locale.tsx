/**
 * description: 传入完整语言包切换语言，使用 `localeOverrides` 局部覆盖文案；嵌套 Provider 会继承父级配置，并可独立切换 RTL。
 */
import { Space } from 'antd';
import { ConfigProvider, en_US, PopoverSelect } from 'hi-talent-design';
import React from 'react';

const demoOptions = [
  { label: 'Product requirements', value: 'prd' },
  { label: 'Technical design', value: 'tech' },
  { label: 'Test review', value: 'test' },
];

export default () => {
  return (
    <ConfigProvider locale={en_US}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <p style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
            完整英文语言包：
          </p>
          <PopoverSelect
            mode="multiple"
            options={demoOptions}
            showConfirm
            style={{ width: 280 }}
          />
        </div>

        <ConfigProvider
          localeOverrides={{
            PopoverSelect: {
              placeholder: 'Pick the documents you need 🎯',
              confirm: 'Apply selection',
            },
          }}
        >
          <div>
            <p style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
              继承英文语言包，仅覆盖指定文案：
            </p>
            <PopoverSelect
              mode="multiple"
              options={demoOptions}
              showConfirm
              style={{ width: 280 }}
            />
          </div>
        </ConfigProvider>

        <ConfigProvider direction="rtl">
          <div>
            <p style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
              继承英文语言包，并将当前区域切换为 RTL：
            </p>
            <PopoverSelect
              mode="multiple"
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
