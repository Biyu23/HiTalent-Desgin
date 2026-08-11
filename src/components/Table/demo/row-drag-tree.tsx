import { Button, message, Space, Tag } from 'antd';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, RowDragResult, TableRef } from '../type';

interface TreeNode {
  key: string;
  name: string;
  owner: string;
  priority: string;
  status: string;
  deadline: string;
  children?: TreeNode[];
}

const messages = {
  'zh-CN': {
    'column.task': '任务名称',
    'column.owner': '负责人',
    'column.status': '状态',
    'priority.high': '高',
    'priority.medium': '中',
    'status.progress': '进行中',
    'status.todo': '待开始',
    'status.done': '已完成',
    'task.user': '🏗 用户系统模块',
    'task.login': '登录页重构',
    'task.signup': '注册流程优化',
    'task.dashboard': '📊 数据看板模块',
    'task.stream': '实时数据流接入',
    'task.files': '📁 文件管理模块',
    'action.reset': '重置数据',
    'state.saving': '保存中...',
    'state.synced': '已同步',
    'state.count': '拖拽次数',
    'hint.prefix': '拖拽行左侧的',
    'hint.order':
      '手柄调整顺序。拖到行内部可成为子节点；拖到上方或下方可调整同级顺序。',
    'hint.guard': '组件内置循环引用保护；allowDrop 仅用于业务规则。',
    'position.inside': '内部',
    'position.before': '之前',
    'position.after': '之后',
    'message.moved': '拖拽完成',
    'message.failed': '保存行顺序失败',
  },
  'en-US': {
    'column.task': 'Task',
    'column.owner': 'Owner',
    'column.status': 'Status',
    'priority.high': 'High',
    'priority.medium': 'Medium',
    'status.progress': 'In progress',
    'status.todo': 'To do',
    'status.done': 'Completed',
    'task.user': '🏗 User system',
    'task.login': 'Refactor sign-in page',
    'task.signup': 'Improve registration flow',
    'task.dashboard': '📊 Data dashboard',
    'task.stream': 'Connect realtime data stream',
    'task.files': '📁 File management',
    'action.reset': 'Reset data',
    'state.saving': 'Saving...',
    'state.synced': 'Synced',
    'state.count': 'Drag count',
    'hint.prefix': 'Drag the',
    'hint.order':
      'handle at the left. Drop inside to create a child, or above and below to reorder siblings.',
    'hint.guard':
      'Cycle protection is built in; allowDrop is only for business rules.',
    'position.inside': 'inside',
    'position.before': 'before',
    'position.after': 'after',
    'message.moved': 'Node moved',
    'message.failed': 'Failed to save row order',
  },
};

async function mockSaveTreeRowOrder(dataSource: TreeNode[]) {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  const flattenTree = (
    items: TreeNode[],
    parent?: string,
    depth = 0,
  ): Array<{ key: string; name: string; parent: string; depth: number }> =>
    items.flatMap((item) => [
      { key: item.key, name: item.name, parent: parent || '—', depth },
      ...(item.children ? flattenTree(item.children, item.key, depth + 1) : []),
    ]);

  console.table(flattenTree(dataSource));
}

function removeFromTree(
  items: TreeNode[],
  targetKey: string,
): [TreeNode | null, TreeNode[]] {
  let removed: TreeNode | null = null;
  const result = items
    .map((item) => {
      if (item.key === targetKey) {
        removed = item;
        return null;
      }
      if (item.children) {
        const [child, newChildren] = removeFromTree(item.children, targetKey);
        if (child) {
          removed = child;
          return {
            ...item,
            children: newChildren.length ? newChildren : undefined,
          };
        }
      }
      return item;
    })
    .filter(Boolean) as TreeNode[];
  return [removed, result];
}

function insertIntoTree(
  items: TreeNode[],
  node: TreeNode,
  targetKey: string,
  position: 'before' | 'after' | 'inside',
): TreeNode[] {
  if (position === 'inside') {
    return items.map((item) => {
      if (item.key === targetKey) {
        return {
          ...item,
          children: item.children ? [...item.children, node] : [node],
        };
      }
      return item.children
        ? {
            ...item,
            children: insertIntoTree(item.children, node, targetKey, position),
          }
        : item;
    });
  }

  const index = items.findIndex((item) => item.key === targetKey);
  if (index !== -1) {
    const nextItems = [...items];
    nextItems.splice(position === 'before' ? index : index + 1, 0, node);
    return nextItems;
  }

  return items.map((item) =>
    item.children
      ? {
          ...item,
          children: insertIntoTree(item.children, node, targetKey, position),
        }
      : item,
  );
}

const RowDragTreeDemo: React.FC = () => {
  const { t } = useDemoIntl(messages);
  const tableRef = useRef<TableRef>(null);
  const initialData = useMemo<TreeNode[]>(
    () => [
      {
        key: '1',
        name: t('task.user'),
        owner: 'Alex',
        priority: t('priority.high'),
        status: t('status.progress'),
        deadline: '2026-08-15',
        children: [
          {
            key: '1-1',
            name: t('task.login'),
            owner: 'Morgan',
            priority: t('priority.high'),
            status: t('status.progress'),
            deadline: '2026-08-10',
          },
          {
            key: '1-2',
            name: t('task.signup'),
            owner: 'Jamie',
            priority: t('priority.medium'),
            status: t('status.todo'),
            deadline: '2026-08-20',
          },
        ],
      },
      {
        key: '2',
        name: t('task.dashboard'),
        owner: 'Casey',
        priority: t('priority.medium'),
        status: t('status.progress'),
        deadline: '2026-09-01',
        children: [
          {
            key: '2-1',
            name: t('task.stream'),
            owner: 'Riley',
            priority: t('priority.high'),
            status: t('status.progress'),
            deadline: '2026-08-15',
          },
        ],
      },
      {
        key: '3',
        name: t('task.files'),
        owner: 'Jordan',
        priority: t('priority.medium'),
        status: t('status.done'),
        deadline: '2026-07-20',
      },
    ],
    [t],
  );
  const [saving, setSaving] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [treeData, setTreeData] = useState<TreeNode[]>(initialData);

  const columns = useMemo<EnhancedColumnType<TreeNode>[]>(
    () => [
      { title: t('column.task'), dataIndex: 'name', key: 'name', width: 220 },
      {
        title: t('column.owner'),
        dataIndex: 'owner',
        key: 'owner',
        width: 100,
      },
      {
        title: t('column.status'),
        dataIndex: 'status',
        key: 'status',
        width: 110,
        cellPreset: 'tag',
        cellPresetProps: {
          colorMap: {
            [t('status.progress')]: 'processing',
            [t('status.todo')]: 'default',
            [t('status.done')]: 'success',
          },
        },
      },
    ],
    [t],
  );

  const handleTreeRowDragEnd = useCallback(
    async ({ dragKey, targetKey, position }: RowDragResult<TreeNode>) => {
      const [draggedNode, withoutNode] = removeFromTree(
        treeData,
        String(dragKey),
      );
      if (!draggedNode) return;

      const nextTreeData = insertIntoTree(
        withoutNode,
        draggedNode,
        String(targetKey),
        position,
      );
      setTreeData(nextTreeData);
      setDragCount((count) => count + 1);
      setSaving(true);

      try {
        await mockSaveTreeRowOrder(nextTreeData);
        const positionText =
          position === 'inside'
            ? t('position.inside')
            : position === 'before'
            ? t('position.before')
            : t('position.after');
        message.success(
          `${t(
            'message.moved',
          )}: "${dragKey}" → "${targetKey}" ${positionText}`,
        );
      } catch {
        message.error(t('message.failed'));
      } finally {
        setSaving(false);
      }
    },
    [t, treeData],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          onClick={() => {
            setTreeData(initialData);
            tableRef.current?.resetColumnState();
            setDragCount(0);
          }}
        >
          {t('action.reset')}
        </Button>
        <Tag color={saving ? 'processing' : 'success'}>
          {saving ? t('state.saving') : t('state.synced')}
        </Tag>
        <Tag color="blue">
          {t('state.count')}: {dragCount}
        </Tag>
      </Space>

      <div
        style={{
          marginBottom: 12,
          color: 'var(--htd-doc-text-secondary, #888)',
          fontSize: 13,
        }}
      >
        {t('hint.prefix')} <Tag style={{ margin: '0 4px' }}>⠿</Tag>{' '}
        {t('hint.order')}
        <br />
        <strong style={{ color: 'var(--htd-doc-brand, #1677ff)' }}>
          {t('hint.guard')}
        </strong>
      </div>

      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={treeData}
        enableRowDrag={{
          treeMode: true,
          childrenColumnName: 'children',
          allowDrop: ({ dragRecord, targetRecord }) =>
            !(
              dragRecord.status === t('status.done') &&
              targetRecord.status === t('status.done')
            ),
        }}
        showColumnSetting
        enableColumnResize
        onRowDragEnd={handleTreeRowDragEnd}
        zebraStripe
        bordered
        pagination={false}
      />
    </div>
  );
};

export default RowDragTreeDemo;
