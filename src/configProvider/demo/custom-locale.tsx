/**
 * title: 自定义语言包
 * description: `locale` 支持传入内置语言字符串（`zh-CN` / `en-US`）或自定义语言包对象，实现国际化文本的灵活覆盖。
 */
import { Space } from 'antd';
import { ConfigProvider, PopoverSelect } from 'hi-talent-design';
import React from 'react';

// 自定义语言包：仅覆盖 PopoverSelect 的占位文字
const customLocale = {
  PopoverSelect: {
    placeholder: '请挑选一个选项 🎯',
    selectAll: '全部勾选',
    clearAll: '一键清除',
    cancel: '算了',
    confirm: '就这些',
    noMatch: '啥也没找到',
    searchPlaceholder: '搜一下',
  },
};

const demoOptions = [
  { label: '产品需求文档', value: 'prd' },
  { label: '技术方案设计', value: 'tech' },
  { label: '测试用例评审', value: 'test' },
];

export default () => {
  return (
    <ConfigProvider locale={customLocale}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <p style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
            📝 自定义语言包（覆盖了 PopoverSelect 的全部文案）：
          </p>
          <PopoverSelect
            mode="multiple"
            options={demoOptions}
            placeholder="请挑选一个选项 🎯"
            showConfirm
            showCancelBtn
            showClearBtn
            style={{ width: 280 }}
          />
        </div>

        <div>
          <p style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
            🌍 内置英文语言包（传入 <code>locale=&quot;en-US&quot;</code>）：
          </p>
          <ConfigProvider locale="en-US">
            <PopoverSelect
              mode="multiple"
              options={demoOptions}
              showConfirm
              style={{ width: 280 }}
            />
          </ConfigProvider>
        </div>
      </Space>
    </ConfigProvider>
  );
};
