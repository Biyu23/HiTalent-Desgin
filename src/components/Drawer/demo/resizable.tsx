import { Button, Flex, Radio, Space, Tag } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    title: '拖拽调整尺寸',
    currentSize: '当前尺寸',
    content: '拖拽内侧边缘可调整抽屉尺寸。',
    right: '右侧 (Right)',
    left: '左侧 (Left)',
    top: '顶部 (Top)',
    bottom: '底部 (Bottom)',
  },
  'en-US': {
    open: 'Open Drawer',
    title: 'Resizable Drawer',
    currentSize: 'Current Size',
    content: 'Drag the inner edge to resize the drawer.',
    right: 'Right',
    left: 'Left',
    top: 'Top',
    bottom: 'Bottom',
  },
};

export default (): React.ReactElement => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(400);

  const handlePlacementChange = (nextPlacement: typeof placement): void => {
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
            { label: t('right'), value: 'right' },
            { label: t('left'), value: 'left' },
            { label: t('top'), value: 'top' },
            { label: t('bottom'), value: 'bottom' },
          ]}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Tag color="blue">
          {t('currentSize')}: {size}px
        </Tag>
      </Flex>

      <Drawer
        title={t('title')}
        placement={placement}
        open={open}
        size={size}
        minSize={100}
        maxSize={800}
        resizable={{ onResize: setSize }}
        onClose={() => setOpen(false)}
      >
        <p>{t('content')}</p>
      </Drawer>
    </Space>
  );
};
