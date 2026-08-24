import { Button, Flex, Radio, Space, Tag, Typography } from 'antd';
import type { MinimizePosition } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const positions: MinimizePosition[] = [
  'bottom-right',
  'bottom-left',
  'top-right',
  'top-left',
  'bottom',
  'top',
  'left',
  'right',
];

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    minimize: '直接最小化',
    restore: '恢复展开',
    position: '停靠方位',
    title: '受控最小化与停靠方位',
    openState: '展开状态',
    minState: '最小化状态',
    content: '通过 state 受控管理 minimized 状态与 8 个全局停靠方位。',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize Directly',
    restore: 'Restore',
    position: 'Dock Position',
    title: 'Controlled Minimize & Positions',
    openState: 'Open',
    minState: 'Minimized',
    content:
      'Manage minimized state and 8 global dock positions via controlled props.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={8} wrap="wrap">
        <Button
          type="primary"
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
        >
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
        <Button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
        >
          {t('restore')}
        </Button>
      </Flex>

      <Flex gap={8} align="center" wrap="wrap">
        <Typography.Text type="secondary">{t('position')}:</Typography.Text>
        <Radio.Group
          size="small"
          optionType="button"
          buttonStyle="solid"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          {positions.map((item) => (
            <Radio.Button key={item} value={item}>
              {item}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Flex>

      <Flex gap={8} align="center">
        <Tag color={open ? 'blue' : 'default'}>
          {t('openState')}: {String(open)}
        </Tag>
        <Tag color={minimized ? 'gold' : 'default'}>
          {t('minState')}: {String(minimized)}
        </Tag>
        <Tag color="cyan">{position}</Tag>
      </Flex>

      <Drawer
        title={t('title')}
        open={open}
        minimizable
        minimized={minimized}
        minimizePosition={position}
        onMinimizeChange={setMinimized}
        onClose={() => {
          setMinimized(false);
          setOpen(false);
        }}
      >
        <Typography.Paragraph>{t('content')}</Typography.Paragraph>
      </Drawer>
    </Space>
  );
};
