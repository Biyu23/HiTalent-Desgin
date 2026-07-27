import { Button, message, Space, Tag } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, RowDragResult, TableRef } from '../type';

async function mockSaveTreeRowOrder(dataSource: any[]) {
  console.log(
    '%c[Mock API] 保存树形行顺序到后端...',
    'color: #1677ff; font-weight: bold',
  );
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
  const flattenTree = (items: any[], parent?: string, depth = 0): any[] =>
    items.flatMap((item) => [
      { key: item.key, name: item.name, parent: parent || '—', depth },
      ...(item.children ? flattenTree(item.children, item.key, depth + 1) : []),
    ]);
  console.table(flattenTree(dataSource));
  console.log('%c[Mock API] 保存成功 ✓', 'color: #52c41a; font-weight: bold');
  return { code: 0 };
}

interface TreeNode {
  key: string;
  name: string;
  owner: string;
  priority: string;
  status: string;
  deadline: string;
  children?: TreeNode[];
  [x: string]: unknown;
}

const initialTreeData: TreeNode[] = [
  {
    key: '1',
    name: '🏗 用户系统模块',
    owner: '张三',
    priority: '高',
    status: '进行中',
    deadline: '2026-08-15',
    children: [
      {
        key: '1-1',
        name: '登录页重构',
        owner: '李四',
        priority: '高',
        status: '进行中',
        deadline: '2026-08-10',
      },
      {
        key: '1-2',
        name: '注册流程优化',
        owner: '王五',
        priority: '中',
        status: '待开始',
        deadline: '2026-08-20',
      },
    ],
  },
  {
    key: '2',
    name: '📊 数据看板模块',
    owner: '钱七',
    priority: '中',
    status: '进行中',
    deadline: '2026-09-01',
    children: [
      {
        key: '2-1',
        name: '实时数据流接入',
        owner: '孙八',
        priority: '高',
        status: '进行中',
        deadline: '2026-08-15',
      },
    ],
  },
  {
    key: '3',
    name: '📁 文件管理模块',
    owner: '冯十二',
    priority: '中',
    status: '已完成',
    deadline: '2026-07-20',
  },
];

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
      if (item.key === targetKey)
        return {
          ...item,
          children: item.children ? [...item.children, node] : [node],
        };
      if (item.children)
        return {
          ...item,
          children: insertIntoTree(item.children, node, targetKey, position),
        };
      return item;
    });
  }

  const idx = items.findIndex((item) => item.key === targetKey);
  if (idx !== -1) {
    const newItems = [...items];
    const insertIdx = position === 'before' ? idx : idx + 1;
    newItems.splice(insertIdx, 0, node);
    return newItems;
  }

  return items.map((item) => {
    if (item.children)
      return {
        ...item,
        children: insertIntoTree(item.children, node, targetKey, position),
      };
    return item;
  });
}

function isDescendantOf(
  items: TreeNode[],
  targetKey: string,
  ancestorKey: string,
): boolean {
  for (const item of items) {
    if (item.key === ancestorKey) {
      const find = (children: TreeNode[]): boolean => {
        for (const child of children) {
          if (child.key === targetKey) return true;
          if (child.children && find(child.children)) return true;
        }
        return false;
      };
      return item.children ? find(item.children) : false;
    }
    if (item.children && isDescendantOf(item.children, targetKey, ancestorKey))
      return true;
  }
  return false;
}

const RowDragTreeDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [saving, setSaving] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData);

  const columns: EnhancedColumnType<TreeNode>[] = [
    { title: '任务名称', dataIndex: 'name', key: 'name', defaultWidth: 220 },
    { title: '负责人', dataIndex: 'owner', key: 'owner', defaultWidth: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      defaultWidth: 100,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: {
          进行中: 'processing',
          待开始: 'default',
          已完成: 'success',
        },
      },
    },
  ];

  const handleTreeRowDragEnd = useCallback(
    async (result: RowDragResult<TreeNode>) => {
      const { dragKey, targetKey, position } = result;
      setTreeData((prev) => {
        const [draggedNode, withoutNode] = removeFromTree(
          prev,
          dragKey as string,
        );
        if (!draggedNode) return prev;
        const cleanedNode = { ...draggedNode, children: undefined };
        return insertIntoTree(
          withoutNode,
          cleanedNode,
          targetKey as string,
          position,
        );
      });

      setDragCount((c) => c + 1);
      setSaving(true);
      try {
        await mockSaveTreeRowOrder(treeData);
        const posText =
          position === 'inside'
            ? '内部'
            : position === 'before'
            ? '之前'
            : '之后';
        message.success(
          `拖拽完成: 将 "${dragKey}" 移至 "${targetKey}" ${posText}`,
        );
      } catch {
        message.error('保存行顺序失败');
      } finally {
        setSaving(false);
      }
    },
    [treeData],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            setTreeData(initialTreeData);
            tableRef.current?.resetAll();
            setDragCount(0);
          }}
        >
          重置数据
        </Button>
        {saving ? (
          <Tag color="processing">保存中...</Tag>
        ) : (
          <Tag color="success">已同步</Tag>
        )}
        <Tag color="blue">拖拽次数: {dragCount}</Tag>
      </Space>

      <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
        提示：拖拽行左侧的 <Tag style={{ margin: '0 4px' }}>⠿</Tag>{' '}
        手柄来调整顺序。 拖到另一行<strong>内部</strong>
        可将其变为子节点（position: inside）， 拖到另一行
        <strong>上方/下方</strong>可调整同级顺序（position: before/after）。
        <br />
        <strong style={{ color: '#1677ff' }}>
          已启用 allowDrop 循环引用保护：父节点无法拖入自己的子节点内。
        </strong>
      </div>

      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={treeData}
        enableRowDrag={{
          treeMode: true,
          childrenColumnName: 'children',
          allowDrop: ({ dragRecord, targetRecord, dropPosition }) => {
            const dragKey = dragRecord.key as string;
            const targetKey = targetRecord.key as string;
            if (
              dropPosition === 0 &&
              isDescendantOf(treeData, targetKey, dragKey)
            ) {
              return false;
            }
            if (
              dragRecord.status === '已完成' &&
              targetRecord.status === '已完成'
            )
              return false;
            return true;
          },
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
