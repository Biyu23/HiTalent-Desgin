import { Button, message, Space, Tag } from 'antd';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
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

const messages = {
  'zh-CN': {
    'column.name': '姓名',
    'column.age': '年龄',
    'column.department': '部门',
    'column.position': '职位',
    'column.status': '状态',
    'column.salary': '薪资',
    'column.joinDate': '入职日期',
    'column.email': '邮箱',
    'department.engineering': '技术部',
    'department.product': '产品部',
    'department.design': '设计部',
    'position.frontend': '前端工程师',
    'position.product': '产品经理',
    'position.design': 'UI 设计师',
    'position.backend': '后端工程师',
    'status.active': '在职',
    'status.probation': '试用期',
    'status.left': '离职',
    'action.reset': '重置列配置',
    'state.saving': '保存中...',
    'state.synced': '已同步',
    'state.hidden': '已隐藏',
    'state.columns': '列',
    'message.saved': '列配置已保存',
    'message.failed': '保存失败，请重试',
  },
  'en-US': {
    'column.name': 'Name',
    'column.age': 'Age',
    'column.department': 'Department',
    'column.position': 'Position',
    'column.status': 'Status',
    'column.salary': 'Salary',
    'column.joinDate': 'Join date',
    'column.email': 'Email',
    'department.engineering': 'Engineering',
    'department.product': 'Product',
    'department.design': 'Design',
    'position.frontend': 'Frontend Engineer',
    'position.product': 'Product Manager',
    'position.design': 'UI Designer',
    'position.backend': 'Backend Engineer',
    'status.active': 'Active',
    'status.probation': 'Probation',
    'status.left': 'Left',
    'action.reset': 'Reset columns',
    'state.saving': 'Saving...',
    'state.synced': 'Synced',
    'state.hidden': 'Hidden',
    'state.columns': 'columns',
    'message.saved': 'Column settings saved',
    'message.failed': 'Save failed. Try again.',
  },
};

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

async function mockSaveColumnState(state: ColumnState) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 300);
  });
  console.table(state);
}

const ColumnDragDemo: React.FC = () => {
  const { t } = useDemoIntl(messages);
  const tableRef = useRef<TableRef>(null);
  const [saving, setSaving] = useState(false);
  const [columnState, setColumnState] = useState<ColumnState>(initialState);

  const dataSource = useMemo<Employee[]>(
    () => [
      {
        key: '1',
        name: 'Alex Chen',
        age: 28,
        department: t('department.engineering'),
        position: t('position.frontend'),
        status: t('status.active'),
        salary: 18000,
        joinDate: '2022-03-15',
        email: 'alex@example.com',
      },
      {
        key: '2',
        name: 'Morgan Li',
        age: 32,
        department: t('department.product'),
        position: t('position.product'),
        status: t('status.active'),
        salary: 22000,
        joinDate: '2021-07-01',
        email: 'morgan@example.com',
      },
      {
        key: '3',
        name: 'Jamie Wang',
        age: 25,
        department: t('department.design'),
        position: t('position.design'),
        status: t('status.probation'),
        salary: 12000,
        joinDate: '2023-11-20',
        email: 'jamie@example.com',
      },
      {
        key: '4',
        name: 'Taylor Zhao',
        age: 35,
        department: t('department.engineering'),
        position: t('position.backend'),
        status: t('status.active'),
        salary: 25000,
        joinDate: '2020-01-10',
        email: 'taylor@example.com',
      },
    ],
    [t],
  );

  const columns = useMemo<readonly EnhancedColumnType<Employee>[]>(
    () => [
      { id: 'name', title: t('column.name'), dataIndex: 'name', key: 'name' },
      { id: 'age', title: t('column.age'), dataIndex: 'age', key: 'age' },
      {
        id: 'department',
        title: t('column.department'),
        dataIndex: 'department',
        key: 'department',
      },
      {
        id: 'position',
        title: t('column.position'),
        dataIndex: 'position',
        key: 'position',
      },
      {
        id: 'status',
        title: t('column.status'),
        dataIndex: 'status',
        key: 'status',
        cellPreset: 'tag',
        cellPresetProps: {
          colorMap: {
            [t('status.active')]: 'green',
            [t('status.probation')]: 'blue',
            [t('status.left')]: 'red',
          },
        },
      },
      {
        id: 'salary',
        title: t('column.salary'),
        dataIndex: 'salary',
        key: 'salary',
        cellPreset: 'number',
        cellPresetProps: { decimals: 0, thousandsSeparator: ',' },
      },
      {
        id: 'joinDate',
        title: t('column.joinDate'),
        dataIndex: 'joinDate',
        key: 'joinDate',
        cellPreset: 'date',
        cellPresetProps: { format: 'YYYY-MM-DD' },
      },
      {
        id: 'email',
        title: t('column.email'),
        dataIndex: 'email',
        key: 'email',
      },
    ],
    [t],
  );

  const handleColumnStateChange = useCallback(
    async (next: ColumnState, info: ColumnStateChangeInfo) => {
      setColumnState(next);
      setSaving(true);
      try {
        await mockSaveColumnState(next);
        message.success(`${t('message.saved')} (${info.reason})`);
      } catch {
        message.error(t('message.failed'));
      } finally {
        setSaving(false);
      }
    },
    [t],
  );

  const hiddenCount = columnState.filter((item) => item.hidden).length;

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button onClick={() => tableRef.current?.resetColumnState()}>
          {t('action.reset')}
        </Button>
        <Tag color="processing">
          {saving ? t('state.saving') : t('state.synced')}
        </Tag>
        {hiddenCount > 0 && (
          <Tag color="warning">
            {t('state.hidden')} {hiddenCount} {t('state.columns')}
          </Tag>
        )}
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
