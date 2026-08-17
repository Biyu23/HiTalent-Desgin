/**
 * description: 使用 minimized 和 onMinimizeChange 受控管理最小化状态，并支持 8 个全局停靠方位。
 */
import { Alert, Button, Flex, Radio, Space, Tag, Typography } from 'antd';
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
    title: '受控最小化抽屉',
    content: '通过父组件 state 统一控制 open、minimized 与停靠方位。',
    openState: '展开状态',
    minState: '最小化状态',
    posState: '停靠位置',
    hint: '支持自由切换 8 个停靠方位，切换后点击「最小化」观察 Dock 卡片的停靠效果。',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize Directly',
    restore: 'Restore',
    position: 'Dock Position',
    title: 'Controlled Minimize Drawer',
    content:
      'Parent component uniformly controls open, minimized, and dock position states.',
    openState: 'Open State',
    minState: 'Minimized State',
    posState: 'Dock Position',
    hint: 'Switch between 8 dock positions and click "Minimize Directly" to observe where the card docks.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<MinimizePosition>('bottom-right');

  const handleClose = () => {
    setMinimized(false);
    setOpen(false);
  };

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
          onChange={(event) => setPosition(event.target.value)}
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
        <Tag color="cyan">
          {t('posState')}: {position}
        </Tag>
      </Flex>

      <Drawer
        title={t('title')}
        open={open}
        minimizable
        minimized={minimized}
        minimizePosition={position}
        onMinimizeChange={setMinimized}
        onClose={handleClose}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('hint')} />
          <Typography.Paragraph>{t('content')}</Typography.Paragraph>
        </Space>
      </Drawer>
    </Space>
  );
};
