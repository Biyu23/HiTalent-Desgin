/**
 * description: 切换四种展开位置并拖动内侧边缘调整尺寸。maxSize 大于局部容器时，实际尺寸仍不会越过容器边界。
 */
import { Button, Radio, Space } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    'resizable.open': '打开可调整尺寸抽屉',
    'resizable.title': '可调整尺寸 Drawer',
    'resizable.size': '当前尺寸',
    'resizable.hint': '拖动朝向页面内容的内侧边缘调整宽度或高度。',
  },
  'en-US': {
    'resizable.open': 'Open Resizable Drawer',
    'resizable.title': 'Resizable Drawer',
    'resizable.size': 'Current size',
    'resizable.hint':
      'Drag the inner edge facing the page content to resize the drawer.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(256);

  const handlePlacementChange = (nextPlacement: typeof placement) => {
    setPlacement(nextPlacement);
    setSize(256);
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
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: 360,
          overflow: 'hidden',
          border: '1px solid #d9d9d9',
          borderRadius: 8,
        }}
      >
        <Button
          type="primary"
          style={{ margin: 24 }}
          onClick={() => setOpen(true)}
        >
          {t('resizable.open')}
        </Button>
        <Drawer
          title={t('resizable.title')}
          placement={placement}
          open={open}
          size={size}
          maxSize={2000}
          getContainer={false}
          rootStyle={{ position: 'absolute' }}
          resizable={{ onResize: setSize }}
          onClose={() => setOpen(false)}
        >
          <p>{t('resizable.hint')}</p>
          <p>
            {t('resizable.size')}：{size}px
          </p>
        </Drawer>
      </div>
    </Space>
  );
};
