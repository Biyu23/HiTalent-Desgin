/**
 * description: 开启 `draggable` 与 `resizable` 后，可通过标题栏或底部空白区域移动弹窗，并从右下角调整尺寸。底部按钮仍保持正常点击；最大化还原或关闭重开后，手动尺寸与位置都会保留。
 */
import { Button, Input, Space } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'resize.open': '打开可缩放弹窗',
    'resize.title': '拖动与调整尺寸',
    'resize.hint':
      '拖动标题栏或底部按钮周围的空白区域可以移动弹窗；拖动右下角可以调整尺寸。',
    'resize.input': '输入框等交互控件不会触发窗口拖动',
    'resize.cancel': '关闭',
    'resize.confirm': '确认',
  },
  'en-US': {
    'resize.open': 'Open Resizable Modal',
    'resize.title': 'Drag and Resize',
    'resize.hint':
      'Drag the title bar or empty footer area to move the dialog. Drag the bottom-right corner to resize it.',
    'resize.input': 'Interactive controls do not start window dragging',
    'resize.cancel': 'Close',
    'resize.confirm': 'Confirm',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('resize.open')}
      </Button>
      <Modal
        title={t('resize.title')}
        open={open}
        width={600}
        draggable
        maximizable
        resizable={{
          minWidth: 360,
          minHeight: 240,
          maxWidth: 900,
          maxHeight: 700,
        }}
        onCancel={() => setOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setOpen(false)}>{t('resize.cancel')}</Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              {t('resize.confirm')}
            </Button>
          </Space>
        }
      >
        <p>{t('resize.hint')}</p>
        <Input placeholder={t('resize.input')} />
        <div style={{ minHeight: 160 }} />
      </Modal>
    </>
  );
};
