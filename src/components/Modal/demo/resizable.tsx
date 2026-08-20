import { Button, Space, Tag } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开可缩放弹窗',
    title: '可缩放弹窗',
    content: '拖动弹窗右下角的把手图标，可自由调整弹窗的宽度和高度。',
    sizeLabel: '当前尺寸',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Resizable Modal',
    title: 'Resizable Modal',
    content:
      'Drag the handle in the bottom-right corner to resize width and height.',
    sizeLabel: 'Current Size',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  return (
    <Space>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('open')}
      </Button>

      <Modal
        title={t('title')}
        open={open}
        resizable={{
          minWidth: 380,
          minHeight: 220,
          onResize: setSize,
        }}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>{t('content')}</p>
        {size && (
          <Tag color="blue">
            {t('sizeLabel')}: {size.width}px × {size.height}px
          </Tag>
        )}
      </Modal>
    </Space>
  );
};
