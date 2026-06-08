/**
 * title: 基础用法
 * description: 最简单的 Modal 使用方式：通过 `open` 控制显隐，`onCancel` 和 `onOk` 分别处理取消与确认操作。
 */
import { Button } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'basic.open': '打开基础弹窗',
    'basic.title': '基础弹窗',
    'basic.p1': '这是一个最简单的弹窗示例。',
    'basic.p2':
      '完全兼容 Ant Design Modal 的所有原生属性，包括 footer 自定义、居中显示、宽度等。',
  },
  'en-US': {
    'basic.open': 'Open Basic Modal',
    'basic.title': 'Basic Modal',
    'basic.p1': 'This is a minimal modal example.',
    'basic.p2':
      'Fully compatible with all Ant Design Modal native props, including custom footer, centered display, width, etc.',
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
      <Modal
        title={t('basic.title')}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>{t('basic.p1')}</p>
        <p style={{ color: '#999' }}>{t('basic.p2')}</p>
      </Modal>
    </>
  );
};
