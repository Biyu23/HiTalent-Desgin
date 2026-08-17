/**
 * description: 通过 `prefixCls` 为组件指定自定义 CSS 类名前缀，避免与项目中其他 UI 库的样式冲突；通过 `antdPrefixCls` 可同步控制底层 Ant Design 组件类名前缀。
 */
import {
  Button,
  ConfigProvider,
  useNamespace,
  usePrefixCls,
} from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'basic.hint': '打开浏览器 DevTools 检查按钮 class，前缀会变为',
    'basic.instead': '而不是默认的',
    'basic.button': '自定义前缀按钮',
    'basic.info': '内部解析前缀：',
  },
  'en-US': {
    'basic.hint': 'Inspect the button class in DevTools. Its prefix is',
    'basic.instead': 'instead of the default',
    'basic.button': 'Custom prefix button',
    'basic.info': 'Resolved Prefix: ',
  },
};

const PrefixDisplay = () => {
  const { t } = useDemoIntl(messages);
  const modalPrefix = usePrefixCls('modal');
  const ns = useNamespace('card');

  return (
    <div
      style={{
        marginTop: 12,
        fontSize: 12,
        color: 'var(--htd-doc-text-secondary, #666)',
      }}
    >
      <div>
        {t('basic.info')} <code>{modalPrefix}</code>，{t('basic.button')}:{' '}
        <code>{ns.e('header')}</code>
      </div>
    </div>
  );
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <ConfigProvider prefixCls="my-app" antdPrefixCls="my-antd">
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
          {t('basic.hint')} <code>.my-antd-btn</code> / <code>.my-app-*</code>{' '}
          {t('basic.instead')} <code>.ant-btn</code> / <code>.htd-*</code>.
        </p>
        <Button type="primary">{t('basic.button')}</Button>
        <PrefixDisplay />
      </div>
    </ConfigProvider>
  );
};
