import type { TableProps as AntdTableProps } from 'antd';
import { Button, message, Space, Tag } from 'antd';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, TableRef } from '../type';

interface EmployeeRecord {
  key: string;
  name: string;
  age: number;
  department: string;
  position: string;
  status: string;
  salary: number;
  joinDate: string;
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
    'department.engineering': '技术部',
    'department.product': '产品部',
    'department.design': '设计部',
    'department.marketing': '市场部',
    'position.frontend': '前端工程师',
    'position.product': '产品经理',
    'position.design': 'UI 设计师',
    'position.backend': '后端工程师',
    'position.director': '技术总监',
    'position.marketing': '市场专员',
    'status.active': '在职',
    'status.probation': '试用期',
    'status.left': '离职',
    'frontend.title': '前端排序 — 自定义 sorter',
    'frontend.description':
      '点击列标题排序。年龄列默认降序；所有排序在浏览器中完成，适合较小数据集。',
    'remote.title': '远程排序 — sorter + onChange',
    'remote.description':
      '排序参数通过 onChange 传给接口，适合由服务端处理的大数据集。',
    'action.load': '加载数据',
    'action.reset': '重置',
    'state.loading': '加载中...',
    'state.current': '当前排序',
    'state.unsorted': '未排序',
    'sort.asc': '升序',
    'sort.desc': '降序',
    'message.loaded': '数据加载成功',
    'message.failed': '数据加载失败',
    'pagination.total': '共',
    'pagination.items': '条',
  },
  'en-US': {
    'column.name': 'Name',
    'column.age': 'Age',
    'column.department': 'Department',
    'column.position': 'Position',
    'column.status': 'Status',
    'column.salary': 'Salary',
    'column.joinDate': 'Join date',
    'department.engineering': 'Engineering',
    'department.product': 'Product',
    'department.design': 'Design',
    'department.marketing': 'Marketing',
    'position.frontend': 'Frontend Engineer',
    'position.product': 'Product Manager',
    'position.design': 'UI Designer',
    'position.backend': 'Backend Engineer',
    'position.director': 'Engineering Director',
    'position.marketing': 'Marketing Specialist',
    'status.active': 'Active',
    'status.probation': 'Probation',
    'status.left': 'Left',
    'frontend.title': 'Client sorting — custom sorter',
    'frontend.description':
      'Select a column sort control. Age starts descending and all ordering runs in the browser for smaller datasets.',
    'remote.title': 'Remote sorting — sorter + onChange',
    'remote.description':
      'onChange sends sort parameters to an API, suitable for large datasets ordered by the server.',
    'action.load': 'Load data',
    'action.reset': 'Reset',
    'state.loading': 'Loading...',
    'state.current': 'Current sort',
    'state.unsorted': 'Unsorted',
    'sort.asc': 'ascending',
    'sort.desc': 'descending',
    'message.loaded': 'Data loaded',
    'message.failed': 'Failed to load data',
    'pagination.total': 'Total',
    'pagination.items': 'items',
  },
};

type MessageKey = keyof (typeof messages)['zh-CN'] &
  keyof (typeof messages)['en-US'];
type Translate = (id: MessageKey) => string;

const createEmployees = (t: Translate): EmployeeRecord[] => [
  {
    key: '1',
    name: 'Alex Chen',
    age: 28,
    department: t('department.engineering'),
    position: t('position.frontend'),
    status: t('status.active'),
    salary: 18000,
    joinDate: '2022-03-15',
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
  },
  {
    key: '5',
    name: 'Casey Qian',
    age: 40,
    department: t('department.engineering'),
    position: t('position.director'),
    status: t('status.active'),
    salary: 35000,
    joinDate: '2018-05-08',
  },
  {
    key: '6',
    name: 'Riley Sun',
    age: 27,
    department: t('department.marketing'),
    position: t('position.marketing'),
    status: t('status.left'),
    salary: 10000,
    joinDate: '2023-02-14',
  },
];

async function mockFetchSortedData(
  source: EmployeeRecord[],
  pagination: { current: number; pageSize: number },
  sorter?: { field?: string; order?: string },
) {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  const sorted = [...source];
  if (sorter?.field && sorter.order) {
    sorted.sort((a, b) => {
      const left = a[sorter.field as keyof EmployeeRecord];
      const right = b[sorter.field as keyof EmployeeRecord];
      const difference =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right));
      return sorter.order === 'descend' ? -difference : difference;
    });
  }

  const start = (pagination.current - 1) * pagination.pageSize;
  return {
    data: sorted.slice(start, start + pagination.pageSize),
    total: sorted.length,
  };
}

const TableSortDemo: React.FC = () => {
  const { t } = useDemoIntl(messages);
  const tableRef = useRef<TableRef>(null);
  const allData = useMemo(() => createEmployees(t), [t]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<EmployeeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [remoteInitialized, setRemoteInitialized] = useState(false);
  const [sortInfo, setSortInfo] = useState<{
    columnKey?: string;
    order?: string;
  }>({});

  const statusColors = useMemo(
    () => ({
      [t('status.active')]: 'green',
      [t('status.probation')]: 'blue',
      [t('status.left')]: 'red',
    }),
    [t],
  );

  const frontendColumns = useMemo<EnhancedColumnType<EmployeeRecord>[]>(
    () => [
      {
        title: t('column.name'),
        dataIndex: 'name',
        key: 'name',
        width: 130,
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: t('column.age'),
        dataIndex: 'age',
        key: 'age',
        width: 80,
        sorter: (a, b) => a.age - b.age,
        defaultSortOrder: 'descend',
      },
      {
        title: t('column.department'),
        dataIndex: 'department',
        key: 'department',
        width: 120,
        sorter: (a, b) => a.department.localeCompare(b.department),
      },
      {
        title: t('column.position'),
        dataIndex: 'position',
        key: 'position',
        width: 150,
        sorter: (a, b) => a.position.localeCompare(b.position),
      },
      {
        title: t('column.status'),
        dataIndex: 'status',
        key: 'status',
        width: 110,
        cellPreset: 'tag',
        cellPresetProps: { colorMap: statusColors },
        sorter: (a, b) => a.status.localeCompare(b.status),
      },
      {
        title: t('column.joinDate'),
        dataIndex: 'joinDate',
        key: 'joinDate',
        width: 130,
        cellPreset: 'date',
        cellPresetProps: { format: 'YYYY-MM-DD' },
        sorter: (a, b) => a.joinDate.localeCompare(b.joinDate),
      },
      {
        title: t('column.salary'),
        dataIndex: 'salary',
        key: 'salary',
        width: 120,
        cellPreset: 'number',
        cellPresetProps: { decimals: 0, thousandsSeparator: ',' },
        sorter: (a, b) => a.salary - b.salary,
      },
    ],
    [statusColors, t],
  );

  const remoteColumns = useMemo<EnhancedColumnType<EmployeeRecord>[]>(
    () =>
      frontendColumns.map((column) => ({
        ...column,
        defaultSortOrder: undefined,
        sorter: true,
      })),
    [frontendColumns],
  );

  const handleRemoteTableChange: NonNullable<
    AntdTableProps<EmployeeRecord>['onChange']
  > = useCallback(
    async (pagination, _filters, sorter) => {
      const currentSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      setSortInfo({
        columnKey: currentSorter?.columnKey?.toString(),
        order: currentSorter?.order?.toString(),
      });
      setLoading(true);

      try {
        const result = await mockFetchSortedData(
          allData,
          {
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
          },
          {
            field: currentSorter?.field as string | undefined,
            order: currentSorter?.order as string | undefined,
          },
        );
        setDataSource(result.data);
        setTotal(result.total);
        message.success(t('message.loaded'));
      } catch {
        message.error(t('message.failed'));
      } finally {
        setLoading(false);
      }
    },
    [allData, t],
  );

  const loadRemoteData = useCallback(async () => {
    if (remoteInitialized) return;
    setRemoteInitialized(true);
    setLoading(true);
    try {
      const result = await mockFetchSortedData(allData, {
        current: 1,
        pageSize: 10,
      });
      setDataSource(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [allData, remoteInitialized]);

  const showTotal = (count: number) =>
    `${t('pagination.total')} ${count} ${t('pagination.items')}`;
  const captionStyle = {
    marginBottom: 12,
    color: 'var(--htd-doc-text-secondary, #888)',
    fontSize: 13,
  } as const;

  return (
    <div>
      <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
        {t('frontend.title')}
      </h3>
      <div style={captionStyle}>{t('frontend.description')}</div>
      <HiTable<EmployeeRecord>
        ref={tableRef}
        columns={frontendColumns}
        dataSource={allData}
        showColumnSetting
        enableColumnResize
        zebraStripe
        bordered
        pagination={{ pageSize: 10, showTotal }}
        rowKey="key"
      />

      <h3 style={{ margin: '28px 0 16px', fontSize: 16, fontWeight: 600 }}>
        {t('remote.title')}
      </h3>
      <div style={captionStyle}>{t('remote.description')}</div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          onClick={loadRemoteData}
          type="primary"
          size="small"
          disabled={remoteInitialized}
        >
          {t('action.load')}
        </Button>
        <Button
          onClick={() => {
            setDataSource([]);
            setTotal(0);
            setSortInfo({});
            setRemoteInitialized(false);
          }}
          size="small"
        >
          {t('action.reset')}
        </Button>
        {loading && <Tag color="processing">{t('state.loading')}</Tag>}
        {sortInfo.order ? (
          <Tag color="blue">
            {t('state.current')}: {sortInfo.columnKey}{' '}
            {sortInfo.order === 'descend'
              ? `↓ ${t('sort.desc')}`
              : `↑ ${t('sort.asc')}`}
          </Tag>
        ) : dataSource.length > 0 ? (
          <Tag>{t('state.unsorted')}</Tag>
        ) : null}
      </Space>

      <HiTable<EmployeeRecord>
        columns={remoteColumns}
        dataSource={dataSource}
        loading={loading}
        onChange={handleRemoteTableChange}
        showColumnSetting
        enableColumnResize
        zebraStripe
        bordered
        pagination={{ total, showTotal, pageSize: 10 }}
        rowKey="key"
      />
    </div>
  );
};

export default TableSortDemo;
