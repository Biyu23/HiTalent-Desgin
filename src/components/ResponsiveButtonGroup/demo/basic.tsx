/**
 * description: 拖动滑块改变容器宽度，观察按钮按 priority 从低到高收起；同权重时左侧按钮先收起。
 */
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ResponsiveButtonGroup } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useMemo, useState } from 'react';

const messages = {
  'zh-CN': {
    width: '容器宽度',
    add: '新增',
    edit: '编辑',
    copy: '复制',
    export: '导出',
    delete: '删除',
    refresh: '刷新',
  },
  'en-US': {
    width: 'Container width',
    add: 'Add',
    edit: 'Edit',
    copy: 'Copy',
    export: 'Export',
    delete: 'Delete',
    refresh: 'Refresh',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [width, setWidth] = useState(560);
  const items = useMemo(
    () => [
      { key: 'add', label: t('add'), icon: <PlusOutlined />, priority: 100 },
      { key: 'edit', label: t('edit'), icon: <EditOutlined />, priority: 50 },
      { key: 'copy', label: t('copy'), icon: <CopyOutlined />, priority: 0 },
      {
        key: 'export',
        label: t('export'),
        icon: <ExportOutlined />,
        priority: 0,
      },
      {
        key: 'delete',
        label: t('delete'),
        icon: <DeleteOutlined />,
        priority: 80,
        danger: true,
      },
      {
        key: 'refresh',
        label: t('refresh'),
        icon: <ReloadOutlined />,
        priority: 20,
      },
    ],
    [t],
  );

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span>
          {t('width')}: {width}px
        </span>
        <input
          type="range"
          min={140}
          max={720}
          value={width}
          style={{ width: 260 }}
          onChange={(event) => setWidth(Number(event.target.value))}
        />
      </label>
      <div
        style={{
          width,
          maxWidth: '100%',
          marginTop: 16,
          padding: 12,
          border: '1px dashed #bfbfbf',
          overflow: 'auto',
        }}
      >
        <ResponsiveButtonGroup items={items} minVisibleCount={1} />
      </div>
    </div>
  );
};
