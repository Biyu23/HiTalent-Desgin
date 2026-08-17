/**
 * description: 在局部容器内渲染抽屉，尺寸受限于容器范围。
 */
import { Alert, Button, Card, Flex, Radio, Space, Tag, Typography } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开局部抽屉',
    title: '工作区详情抽屉',
    size: '当前尺寸',
    hint: '此抽屉通过 getContainer={false} 挂载在局部容器中，拖拽调整尺寸时最大尺寸受限于该容器。',
    cardTitle: '局部工作台容器 (380px 高度)',
    cardDesc: '抽屉将在本容器内展开，不会遮盖页面其他区域。',
    close: '关闭',
  },
  'en-US': {
    open: 'Open Local Drawer',
    title: 'Workspace Details',
    size: 'Current Size',
    hint: 'Mounted locally via getContainer={false}. Resize dimensions are automatically constrained by this container.',
    cardTitle: 'Local Container (380px Height)',
    cardDesc:
      'The drawer expands strictly within this container without covering the rest of the page.',
    close: 'Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(280);

  const handlePlacementChange = (nextPlacement: typeof placement) => {
    setPlacement(nextPlacement);
    setSize(nextPlacement === 'top' || nextPlacement === 'bottom' ? 200 : 280);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={placement}
          onChange={(event) => handlePlacementChange(event.target.value)}
          options={[
            { label: 'Right (右)', value: 'right' },
            { label: 'Left (左)', value: 'left' },
            { label: 'Top (上)', value: 'top' },
            { label: 'Bottom (下)', value: 'bottom' },
          ]}
        />
        <Tag color="blue">
          {t('size')}: {size}px
        </Tag>
      </Flex>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: 380,
          overflow: 'hidden',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          background: '#fafafa',
          padding: 24,
        }}
      >
        <Card size="small" title={t('cardTitle')} style={{ maxWidth: 400 }}>
          <Typography.Paragraph type="secondary">
            {t('cardDesc')}
          </Typography.Paragraph>
          <Button type="primary" onClick={() => setOpen(true)}>
            {t('open')}
          </Button>
        </Card>

        <Drawer
          title={t('title')}
          placement={placement}
          open={open}
          size={size}
          getContainer={false}
          rootStyle={{ position: 'absolute' }}
          resizable={{ onResize: setSize }}
          onClose={() => setOpen(false)}
          extra={
            <Button size="small" onClick={() => setOpen(false)}>
              {t('close')}
            </Button>
          }
        >
          <Alert
            type="info"
            showIcon
            message={t('hint')}
            style={{ marginBottom: 16 }}
          />
          <Typography.Paragraph>
            {t('size')}: <strong>{size}px</strong>
          </Typography.Paragraph>
        </Drawer>
      </div>
    </Space>
  );
};
