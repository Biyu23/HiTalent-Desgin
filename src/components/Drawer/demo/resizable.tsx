import { Button, Flex, Radio, Space, Tag, Typography } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    title: '拖拽调整尺寸',
    placement: '展开方向',
    currentSize: '当前尺寸',
    minLimit: '最小尺寸: 100px',
    hint: '拖拽抽屉内侧边缘可自由缩放宽度或高度，支持 4 个展开方向及 minSize / maxSize 约束。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Drawer',
    title: 'Resize Drawer',
    placement: 'Placement',
    currentSize: 'Current Size',
    minLimit: 'Min Size: 100px',
    hint: 'Drag the inner edge to resize width or height, with 4-direction support and minSize / maxSize constraints.',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(400);

  const handlePlacementChange = (nextPlacement: typeof placement) => {
    setPlacement(nextPlacement);
    setSize(nextPlacement === 'top' || nextPlacement === 'bottom' ? 280 : 400);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={placement}
          onChange={(e) => handlePlacementChange(e.target.value)}
          options={[
            { label: 'Right', value: 'right' },
            { label: 'Left', value: 'left' },
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
          ]}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Tag color="blue">
          {t('currentSize')}: {size}px
        </Tag>
        <Tag color="default">{t('minLimit')}</Tag>
      </Flex>

      <Drawer
        title={t('title')}
        placement={placement}
        open={open}
        size={size}
        resizable={{ onResize: setSize }}
        onClose={() => setOpen(false)}
        extra={
          <Button size="small" onClick={() => setOpen(false)}>
            {t('close')}
          </Button>
        }
      >
        <Typography.Paragraph>{t('hint')}</Typography.Paragraph>
      </Drawer>
    </Space>
  );
};
