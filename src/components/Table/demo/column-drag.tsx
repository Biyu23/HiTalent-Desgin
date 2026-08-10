import { Button, message, Space, Tag } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import HiTable from '../index';
import type {
  ColumnState,
  ColumnStateChangeInfo,
  EnhancedColumnType,
  TableRef,
} from '../type';

interface Employee {
  key: string;
  name: string;
  age: number;
  department: string;
  position: string;
  status: string;
  salary: number;
  joinDate: string;
  email: string;
}

async function mockSaveColumnState(state: ColumnState) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 300);
  });
  console.table(state);
  return { code: 0 };
}

const dataSource: Employee[] = [
  {
    key: '1',
    name: '张三',
    age: 28,
    department: '技术部',
    position: '前端工程师',
    status: '在职',
    salary: 18000,
    joinDate: '2022-03-15',
    email: 'zhangsan@example.com',
  },
  {
    key: '2',
    name: '李四',
    age: 32,
    department: '产品部',
    position: '产品经理',
    status: '在职',
    salary: 22000,
    joinDate: '2021-07-01',
    email: 'lisi@example.com',
  },
  {
    key: '3',
    name: '王五',
    age: 25,
    department: '设计部',
    position: 'UI 设计师',
    status: '试用期',
    salary: 12000,
    joinDate: '2023-11-20',
    email: 'wangwu@example.com',
  },
  {
    key: '4',
    name: '赵六',
    age: 35,
    department: '技术部',
    position: '后端工程师',
    status: '在职',
    salary: 25000,
    joinDate: '2020-01-10',
    email: 'zhaoliu@example.com',
  },
];

const initialState: ColumnState = [
  { id: 'name', width: 120 },
  { id: 'age', width: 80 },
  { id: 'department', width: 130 },
  { id: 'position', width: 150 },
  { id: 'status', width: 100 },
  { id: 'salary', width: 120 },
  { id: 'joinDate', width: 130 },
  { id: 'email', width: 200 },
];

const ColumnDragDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [saving, setSaving] = useState(false);
  const [columnState, setColumnState] = useState<ColumnState>(initialState);

  const columns = useMemo<readonly EnhancedColumnType<Employee>[]>(
    () => [
      { id: 'name', title: '姓名', dataIndex: 'name', key: 'name' },
      { id: 'age', title: '年龄', dataIndex: 'age', key: 'age' },
      {
        id: 'department',
        title: '部门',
        dataIndex: 'department',
        key: 'department',
      },
      { id: 'position', title: '职位', dataIndex: 'position', key: 'position' },
      {
        id: 'status',
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        cellPreset: 'tag',
        cellPresetProps: {
          colorMap: { 在职: 'green', 试用期: 'blue', 离职: 'red' },
        },
      },
      {
        id: 'salary',
        title: '薪资',
        dataIndex: 'salary',
        key: 'salary',
        cellPreset: 'number',
        cellPresetProps: { decimals: 0, thousandsSeparator: ',' },
      },
      {
        id: 'joinDate',
        title: '入职日期',
        dataIndex: 'joinDate',
        key: 'joinDate',
        cellPreset: 'date',
        cellPresetProps: { format: 'YYYY-MM-DD' },
      },
      { id: 'email', title: '邮箱', dataIndex: 'email', key: 'email' },
    ],
    [],
  );

  const handleColumnStateChange = useCallback(
    async (next: ColumnState, info: ColumnStateChangeInfo) => {
      setColumnState(next);
      setSaving(true);
      try {
        await mockSaveColumnState(next);
        message.success(`列配置已保存（${info.reason}）`);
      } catch {
        message.error('保存失败，请重试');
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const hiddenCount = columnState.filter((item) => item.hidden).length;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => tableRef.current?.resetColumnState()}>
          重置列配置
        </Button>
        <Tag color="processing">{saving ? '保存中...' : '已同步'}</Tag>
        {hiddenCount > 0 && <Tag color="warning">已隐藏 {hiddenCount} 列</Tag>}
      </Space>
      <HiTable<Employee>
        ref={tableRef}
        columns={columns}
        columnState={columnState}
        onColumnStateChange={handleColumnStateChange}
        dataSource={dataSource}
        showColumnSetting
        enableColumnResize
        enableColumnDrag
        zebraStripe
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ColumnDragDemo;
