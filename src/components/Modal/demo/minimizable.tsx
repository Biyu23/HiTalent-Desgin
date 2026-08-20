import { Button, Flex, Radio, Space } from 'antd';
import type { MinimizePosition } from 'hi-talent-design';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开支持最小化弹窗',
    title: '支持最小化弹窗',
    content:
      '点击右上角最小化图标，窗口将折叠到页面停靠栏中，不销毁 DOM 状态。',
    positionLabel: '停靠位置',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Minimizable Modal',
    title: 'Minimizable Modal',
    content:
      'Click the minimize icon in the top-right corner to fold the window into the Dock without destroying DOM state.',
    positionLabel: 'Dock Position',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');

  return (
    <Space direction="vertical" size="middle">
      <Flex gap={12} align="center">
        <span>{t('positionLabel')}:</span>
        <Radio.Group
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          options={[
            { label: 'Bottom Right (右下)', value: 'bottom-right' },
            { label: 'Bottom Left (左下)', value: 'bottom-left' },
            { label: 'Top Right (右上)', value: 'top-right' },
            { label: 'Top Left (左上)', value: 'top-left' },
          ]}
        />
      </Flex>

      <Button type="primary" onClick={() => setOpen(true)}>
        {t('open')}
      </Button>

      <Modal
        title={t('title')}
        open={open}
        minimizable
        minimizePosition={position}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
      >
        <p>{t('content')}</p>
      </Modal>
    </Space>
  );
};
