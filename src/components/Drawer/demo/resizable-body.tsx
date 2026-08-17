/**
 * description: 拖拽边缘调整抽屉宽度或高度。
 */
import { Alert, Button, Descriptions, Flex, Radio, Space, Tag } from 'antd';
import type { DrawerProps } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'resizable.open': '打开抽屉',
    'resizable.title': '调整抽屉尺寸',
    'resizable.placement': '展开方向',
    'resizable.currentSize': '实时尺寸',
    'resizable.minLimit': '最小限制',
    'resizable.hint':
      '拖拽抽屉内侧边缘调整大小（默认最小限制 100px 防止塌陷）。',
    'resizable.name': '负责人',
    'resizable.department': '部门',
    'resizable.role': '角色',
    'resizable.status': '状态',
    'resizable.close': '关闭',
    'resizable.confirm': '确定',
  },
  'en-US': {
    'resizable.open': 'Open Drawer',
    'resizable.title': 'Resize Drawer',
    'resizable.placement': 'Placement',
    'resizable.currentSize': 'Current Size',
    'resizable.minLimit': 'Min Size',
    'resizable.hint': 'Drag the inner edge to resize (default minSize: 100px).',
    'resizable.name': 'Owner',
    'resizable.department': 'Department',
    'resizable.role': 'Role',
    'resizable.status': 'Status',
    'resizable.close': 'Close',
    'resizable.confirm': 'Confirm',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] =
    useState<NonNullable<DrawerProps['placement']>>('right');
  const [size, setSize] = useState(420);

  const handlePlacementChange = (nextPlacement: typeof placement) => {
    setPlacement(nextPlacement);
    setSize(nextPlacement === 'top' || nextPlacement === 'bottom' ? 300 : 420);
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
            { label: 'Right (右)', value: 'right' },
            { label: 'Left (左)', value: 'left' },
            { label: 'Top (上)', value: 'top' },
            { label: 'Bottom (下)', value: 'bottom' },
          ]}
        />
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('resizable.open')}
        </Button>
      </Flex>

      <Flex gap={8} align="center">
        <Tag color="blue">
          {t('resizable.currentSize')}: {size}px
        </Tag>
        <Tag color="default">{t('resizable.minLimit')}: 100px</Tag>
      </Flex>

      <Drawer
        title={t('resizable.title')}
        placement={placement}
        open={open}
        size={size}
        resizable={{ onResize: setSize }}
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button size="small" onClick={() => setOpen(false)}>
              {t('resizable.close')}
            </Button>
            <Button size="small" type="primary" onClick={() => setOpen(false)}>
              {t('resizable.confirm')}
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('resizable.hint')} />
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t('resizable.name')}>
              Alex Morgan
            </Descriptions.Item>
            <Descriptions.Item label={t('resizable.department')}>
              Product Design
            </Descriptions.Item>
            <Descriptions.Item label={t('resizable.role')}>
              Senior Designer
            </Descriptions.Item>
            <Descriptions.Item label={t('resizable.status')}>
              <Tag color="success">Active</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Drawer>
    </Space>
  );
};
