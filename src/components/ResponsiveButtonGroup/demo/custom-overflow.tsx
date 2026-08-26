import {
  AppstoreOutlined,
  CheckCircleOutlined,
  DownOutlined,
  ExportOutlined,
  HistoryOutlined,
  LockOutlined,
  PrinterOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Badge, Flex, Tag, Typography, message } from 'antd';
import type { ResponsiveButtonGroupItem } from 'hi-talent-design';
import { ResponsiveButtonGroup } from 'hi-talent-design';
import React, { useState } from 'react';

const items: ResponsiveButtonGroupItem[] = [
  {
    key: 'share',
    label: '分享文档',
    icon: <ShareAltOutlined />,
    priority: 50,
    buttonProps: { type: 'primary' },
  },
  {
    key: 'export',
    label: '导出数据',
    icon: <ExportOutlined />,
    priority: 40,
  },
  {
    key: 'print',
    label: '打印页面',
    icon: <PrinterOutlined />,
    priority: 30,
  },
  {
    key: 'history',
    label: '历史版本',
    icon: <HistoryOutlined />,
    priority: 20,
    renderCollapsedItem: ({ defaultNode }) => (
      <Flex justify="space-between" align="center" style={{ width: '100%' }}>
        {defaultNode}
        <Tag color="blue" style={{ marginInlineStart: 8 }}>
          v2.0
        </Tag>
      </Flex>
    ),
  },
  {
    key: 'lock',
    label: '权限锁定',
    icon: <LockOutlined />,
    priority: 10,
    danger: true,
  },
];

export default () => {
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>([]);

  return (
    <Flex vertical gap={16}>
      <div
        style={{
          width: 380,
          maxWidth: '100%',
          padding: 12,
          border: '1px solid #f0f0f0',
          borderRadius: 6,
        }}
      >
        <ResponsiveButtonGroup
          items={items}
          overflowLabel="操作"
          overflowIcon={<AppstoreOutlined />}
          showOverflowCount={true}
          renderOverflowButton={({ count, defaultNode }) => (
            <Badge count={count} size="small" offset={[-2, 2]}>
              {defaultNode}
            </Badge>
          )}
          onItemClick={({ item }) => {
            message.info(`触发操作: ${item.key}`);
          }}
          onVisibleChange={(visible, collapsed) => {
            setVisibleKeys(visible);
            setCollapsedKeys(collapsed);
          }}
        />
      </div>

      <Flex gap={12} align="center" wrap>
        <Typography.Text type="secondary">当前状态：</Typography.Text>
        <Tag color="success" icon={<CheckCircleOutlined />}>
          平铺项 ({visibleKeys.length}): {visibleKeys.join(', ') || '无'}
        </Tag>
        <Tag color="processing" icon={<DownOutlined />}>
          折叠项 ({collapsedKeys.length}): {collapsedKeys.join(', ') || '无'}
        </Tag>
      </Flex>
    </Flex>
  );
};
