import {
  CloudDownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Flex, Radio, Slider, Typography, message } from 'antd';
import type {
  ResponsiveButtonGroupItem,
  ResponsiveButtonGroupMode,
} from 'hi-talent-design';
import { ResponsiveButtonGroup } from 'hi-talent-design';
import React, { useMemo, useState } from 'react';

const wait = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default () => {
  const [width, setWidth] = useState(480);
  const [mode, setMode] = useState<ResponsiveButtonGroupMode>('responsive');

  const items: ResponsiveButtonGroupItem[] = useMemo(
    () => [
      {
        key: 'add',
        label: '新建项目',
        icon: <PlusOutlined />,
        priority: 100,
        buttonProps: { type: 'primary' },
        onClick: () => {
          message.success('点击新建');
        },
      },
      {
        key: 'edit',
        label: '编辑信息',
        icon: <EditOutlined />,
        priority: 80,
        tooltip: '编辑当前项目详细配置',
        onClick: () => {
          message.info('点击编辑');
        },
      },
      {
        key: 'delete',
        label: '批量删除',
        icon: <DeleteOutlined />,
        priority: 60,
        danger: true,
        onClick: () => {
          message.warning('触发删除');
        },
      },
      {
        key: 'copy',
        label: '复制副本',
        icon: <CopyOutlined />,
        priority: 30,
        onClick: () => {
          message.info('复制成功');
        },
      },
      {
        key: 'download',
        label: '导出报表',
        icon: <CloudDownloadOutlined />,
        priority: 15,
        onClick: async () => {
          await wait(1000);
          message.success('导出完成');
        },
      },
      {
        key: 'refresh',
        label: '刷新同步',
        icon: <ReloadOutlined />,
        priority: 10,
        disabled: true,
      },
    ],
    [],
  );

  return (
    <Flex vertical gap={16}>
      <Flex align="center" gap={24} wrap>
        <Flex align="center" gap={8} style={{ width: 320 }}>
          <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
            容器宽度 ({width}px):
          </Typography.Text>
          <Slider
            min={250}
            max={650}
            value={width}
            onChange={setWidth}
            style={{ flex: 1 }}
          />
        </Flex>
        <Flex align="center" gap={8}>
          <Typography.Text type="secondary">模式:</Typography.Text>
          <Radio.Group
            size="small"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { label: '自适应 (responsive)', value: 'responsive' },
              { label: '全部展开 (expanded)', value: 'expanded' },
              { label: '全部收起 (collapsed)', value: 'collapsed' },
            ]}
          />
        </Flex>
      </Flex>

      <div
        style={{
          width,
          maxWidth: '100%',
          padding: 12,
          border: '1px dashed #d9d9d9',
          borderRadius: 6,
          background: '#fafafa',
        }}
      >
        <ResponsiveButtonGroup
          mode={mode}
          items={items}
          minVisibleCount={1}
          gap={8}
        />
      </div>
    </Flex>
  );
};
