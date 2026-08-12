/**
 * description: 使用 open 控制 Drawer 显示，并组合标题、正文与底部操作区。
 */
import { Button, Space } from 'antd';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'basic.open': '打开抽屉',
    'basic.title': '基础抽屉',
    'basic.content': 'Drawer 保留 Ant Design 的遮罩、动画与焦点管理能力。',
    'basic.cancel': '取消',
    'basic.confirm': '确定',
  },
  'en-US': {
    'basic.open': 'Open Drawer',
    'basic.title': 'Basic Drawer',
    'basic.content':
      'Drawer preserves Ant Design mask, motion, and focus management.',
    'basic.cancel': 'Cancel',
    'basic.confirm': 'Confirm',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('basic.open')}
      </Button>
      <Drawer
        title={t('basic.title')}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>{t('basic.cancel')}</Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              {t('basic.confirm')}
            </Button>
          </Space>
        }
      >
        <p>{t('basic.content')}</p>
      </Drawer>
    </>
  );
};
