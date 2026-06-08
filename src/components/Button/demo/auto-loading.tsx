/**
 * title: 自动loading
 * description: 默认开启 `autoLoading`。当 `onClick` 返回一个 `Promise` 时，按钮会自动进入 `loading` 状态，并拦截点击操作，直到 Promise 决议后恢复。解决手动维护 `loading` 的烦恼。
 */
import { message } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'auto.success': '数据保存成功！',
    'auto.label': '提交表单 (等待1.5秒)',
  },
  'en-US': {
    'auto.success': 'Data saved successfully!',
    'auto.label': 'Submit Form (Wait 1.5s)',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  const mockApiRequest = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        message.success(t('auto.success'));
        resolve(true);
      }, 1500);
    });

  return (
    <Button type="primary" onClick={mockApiRequest}>
      {t('auto.label')}
    </Button>
  );
};
