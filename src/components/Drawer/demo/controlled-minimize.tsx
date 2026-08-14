/**
 * description: 使用 minimized 和 onMinimizeChange 受控管理最小化状态，并支持 8 个全局停靠方位。
 */
import { Button, Radio, Space } from 'antd';
import type { MinimizePosition } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const positions: MinimizePosition[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'top',
  'bottom',
  'left',
  'right',
];

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    minimize: '直接最小化',
    restore: '恢复',
    position: '停靠方位',
    title: '受控最小化',
    content: '父组件同时控制 open 和 minimized。',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize Directly',
    restore: 'Restore',
    position: 'Dock Position',
    title: 'Controlled Minimize',
    content: 'The parent controls both open and minimized.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');

  const close = () => {
    setMinimized(false);
    setOpen(false);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Button
          onClick={() => {
            setOpen(true);
            setMinimized(true);
          }}
        >
          {t('minimize')}
        </Button>
        <Button onClick={() => setMinimized(false)}>{t('restore')}</Button>
      </Space>
      <Space align="start" wrap>
        <span>{t('position')}:</span>
        <Radio.Group
          value={position}
          onChange={(event) => setPosition(event.target.value)}
        >
          {positions.map((item) => (
            <Radio.Button key={item} value={item}>
              {item}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Space>
      <Drawer
        title={t('title')}
        open={open}
        minimizable
        minimized={minimized}
        minimizePosition={position}
        onMinimizeChange={setMinimized}
        onClose={close}
      >
        {t('content')}
      </Drawer>
    </Space>
  );
};
