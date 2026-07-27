import { Button, message, Space, Tag } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, RowDragResult, TableRef } from '../type';

async function mockSaveRowOrder(dataSource: any[]) {
  console.log(
    '%c[Mock API] 保存行顺序到后端...',
    'color: #1677ff; font-weight: bold',
  );
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
  console.table(dataSource);
  console.log('%c[Mock API] 保存成功 ✓', 'color: #52c41a; font-weight: bold');
  return { code: 0 };
}

const initialFlatData = [
  {
    key: '1',
    name: '用户登录页重构',
    owner: '张三',
    priority: '高',
    status: '进行中',
    deadline: '2026-08-15',
  },
  {
    key: '2',
    name: '数据看板性能优化',
    owner: '李四',
    priority: '高',
    status: '进行中',
    deadline: '2026-08-10',
  },
  {
    key: '3',
    name: '表单校验规则补充',
    owner: '王五',
    priority: '中',
    status: '待开始',
    deadline: '2026-08-20',
  },
  {
    key: '4',
    name: '全局主题切换功能',
    owner: '赵六',
    priority: '低',
    status: '已完成',
    deadline: '2026-07-30',
  },
  {
    key: '5',
    name: '消息通知模块开发',
    owner: '钱七',
    priority: '中',
    status: '已延期',
    deadline: '2026-07-15',
  },
  {
    key: '6',
    name: '文件上传组件封装',
    owner: '孙八',
    priority: '低',
    status: '待开始',
    deadline: '2026-09-01',
  },
];

const RowDragFlatDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [saving, setSaving] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [flatData, setFlatData] = useState(initialFlatData);

  const columns: EnhancedColumnType<(typeof initialFlatData)[0]>[] = [
    { title: '任务名称', dataIndex: 'name', key: 'name', defaultWidth: 220 },
    { title: '负责人', dataIndex: 'owner', key: 'owner', defaultWidth: 100 },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      defaultWidth: 90,
      cellPreset: 'tag',
      cellPresetProps: { colorMap: { 高: 'red', 中: 'orange', 低: 'default' } },
    },
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
          已延期: 'error',
        },
      },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      defaultWidth: 130,
      cellPreset: 'date',
      cellPresetProps: { format: 'YYYY-MM-DD' },
    },
  ];

  const handleFlatRowDragEnd = useCallback(
    async (result: RowDragResult) => {
      const { dragKey, targetKey, position } = result;
      setFlatData((prev) => {
        const dragIndex = prev.findIndex((item) => item.key === dragKey);
        const targetIndex = prev.findIndex((item) => item.key === targetKey);
        if (dragIndex === -1 || targetIndex === -1) return prev;

        const newData = [...prev];
        const [draggedItem] = newData.splice(dragIndex, 1);
        let insertIndex = targetIndex;
        if (position === 'after') insertIndex = targetIndex + 1;
        if (dragIndex < insertIndex) insertIndex -= 1;

        newData.splice(insertIndex, 0, draggedItem);
        return newData;
      });

      setDragCount((c) => c + 1);
      setSaving(true);
      try {
        await mockSaveRowOrder(flatData);
        message.success(
          `拖拽完成: 将 "${dragKey}" 移至 "${targetKey}" ${
            position === 'after' ? '之后' : '之前'
          }`,
        );
      } catch {
        message.error('保存行顺序失败');
      } finally {
        setSaving(false);
      }
    },
    [flatData],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            setFlatData(initialFlatData);
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
        手柄来调整顺序。 扁平列表仅支持 position: before / after。
      </div>

      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={flatData}
        enableRowDrag
        showColumnSetting
        enableColumnResize
        onRowDragEnd={handleFlatRowDragEnd}
        zebraStripe
        bordered
        pagination={false}
      />
    </div>
  );
};

export default RowDragFlatDemo;
