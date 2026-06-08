/**
 * title: 基础用法
 * description: 通过 `prefixCls` 为组件指定自定义 CSS 类名前缀，避免与项目中其他 UI 库的样式冲突。
 */
import { Button, ConfigProvider } from 'myui';
import React from 'react';

export default () => {
  return (
    <ConfigProvider prefixCls="my-app">
      <div
        style={{
          padding: 24,
          background: '#fafafa',
          borderRadius: 8,
        }}
      >
        <p style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
          💡 打开浏览器 DevTools 检查按钮的 class，会看到前缀变成了{' '}
          <code>.my-app-btn</code> 而非默认的 <code>.my-ui-btn</code>。
        </p>
        <Button type="primary">自定义前缀按钮</Button>
      </div>
    </ConfigProvider>
  );
};
