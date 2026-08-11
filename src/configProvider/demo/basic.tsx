/**
 * description: 通过 `prefixCls` 为组件指定自定义 CSS 类名前缀，避免与项目中其他 UI 库的样式冲突。
 */
import { Button, ConfigProvider } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'basic.hint': '打开浏览器 DevTools 检查按钮 class，前缀会变为',
    'basic.instead': '而不是默认的',
    'basic.button': '自定义前缀按钮',
  },
  'en-US': {
    'basic.hint': 'Inspect the button class in DevTools. Its prefix is',
    'basic.instead': 'instead of the default',
    'basic.button': 'Custom prefix button',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <ConfigProvider prefixCls="my-app">
      <div
        style={{
          padding: 24,
          background: 'var(--htd-doc-surface-muted, #fafafa)',
          borderRadius: 8,
        }}
      >
        <p
          style={{
            marginBottom: 12,
            color: 'var(--htd-doc-text-secondary, #666)',
            fontSize: 13,
          }}
        >
          {t('basic.hint')} <code>.my-app-btn</code> {t('basic.instead')}{' '}
          <code>.htd-btn</code>.
        </p>
        <Button type="primary">{t('basic.button')}</Button>
      </div>
    </ConfigProvider>
  );
};
