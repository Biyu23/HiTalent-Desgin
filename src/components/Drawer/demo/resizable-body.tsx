/**
 * description: 挂载在 body 上的 Drawer，可以拖动调整尺寸。
 */
import { Button, Radio, Space } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'resizable.open': '打开全局调整尺寸抽屉',
    'resizable.title': '全局可调整尺寸 Drawer',
    'resizable.size': '当前尺寸',
    'resizable.hint': '拖动朝向页面内容的内侧边缘调整宽度或高度。',
  },
  'en-US': {
    'resizable.open': 'Open Global Resizable Drawer',
    'resizable.title': 'Global Resizable Drawer',
    'resizable.size': 'Current size',
    'resizable.hint':
      'Drag the inner edge facing the page content to resize the drawer.',
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
      <Radio.Group
        value={placement}
        onChange={(event) => handlePlacementChange(event.target.value)}
        options={['top', 'right', 'bottom', 'left'].map((value) => ({
          label: value,
          value,
        }))}
      />
      <div>
        {t('resizable.size')}：{size}px
      </div>
      <Button type="primary" onClick={() => setOpen(true)}>
        {t('resizable.open')}
      </Button>
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
