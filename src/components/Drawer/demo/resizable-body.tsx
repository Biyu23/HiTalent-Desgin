/**
 * description: 拖拽边缘调整抽屉宽度或高度。
 */
import { Button, Radio, Space } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'resizable.open': '打开抽屉',
    'resizable.title': '可调整尺寸抽屉',
    'resizable.size': '当前尺寸',
    'resizable.hint': '拖拽边缘调整大小。',
  },
  'en-US': {
    'resizable.open': 'Open Drawer',
    'resizable.title': 'Resizable Drawer',
    'resizable.size': 'Current size',
    'resizable.hint': 'Drag the edge to resize.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(378);

  const handlePlacementChange = (nextPlacement: typeof placement) => {
    setPlacement(nextPlacement);
    setSize(378);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Radio.Group
          value={placement}
          onChange={(event) => handlePlacementChange(event.target.value)}
          options={['top', 'right', 'bottom', 'left'].map((value) => ({
            label: value,
            value,
          }))}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('resizable.open')}
        </Button>
      </Space>
      <div>
        {t('resizable.size')}：{size}px
      </div>
      <Drawer
        title={t('resizable.title')}
        placement={placement}
        open={open}
        size={size}
        resizable={{ onResize: setSize }}
        onClose={() => setOpen(false)}
      >
        <p>{t('resizable.hint')}</p>
        <p>
          {t('resizable.size')}：{size}px
        </p>
      </Drawer>
    </Space>
  );
};
