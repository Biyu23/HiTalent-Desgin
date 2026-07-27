import { Button, message, Space, Tag } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import React, { useCallback, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, TableRef } from '../type';

interface EmployeeRecord extends Record<string, unknown> {
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

/**
 * 模拟异步接口：获取排序后的数据
 *
 * 实际项目中将排序参数传给后端，由后端返回排序好的数据
 */
async function mockFetchSortedData(
  pagination: { current: number; pageSize: number },
  sorter?: { field?: string; order?: string },
): Promise<{ data: EmployeeRecord[]; total: number }> {
  console.log(
    '%c[Mock API] 请求排序数据...',
    'color: #1677ff; font-weight: bold',
  );
  console.log('分页参数:', pagination, '排序参数:', sorter);

  // 模拟网络延迟
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  const allData: EmployeeRecord[] = [
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
    {
      key: '5',
      name: '钱七',
      age: 40,
      department: '管理部',
      position: '技术总监',
      status: '在职',
      salary: 35000,
      joinDate: '2018-05-08',
      email: 'qianqi@example.com',
    },
    {
      key: '6',
      name: '孙八',
      age: 27,
      department: '市场部',
      position: '市场专员',
      status: '离职',
      salary: 10000,
      joinDate: '2023-02-14',
      email: 'sunba@example.com',
    },
    {
      key: '7',
      name: '周九',
      age: 31,
      department: '技术部',
      position: '架构师',
      status: '在职',
      salary: 28000,
      joinDate: '2019-06-20',
      email: 'zhoujiu@example.com',
    },
    {
      key: '8',
      name: '吴十',
      age: 26,
      department: '市场部',
      position: '运营专员',
      status: '试用期',
      salary: 11000,
      joinDate: '2024-01-15',
      email: 'wushi@example.com',
    },
    {
      key: '9',
      name: '郑十一',
      age: 38,
      department: '管理部',
      position: 'CEO',
      status: '在职',
      salary: 50000,
      joinDate: '2015-03-01',
      email: 'zhengshiyi@example.com',
    },
    {
      key: '10',
      name: '冯十二',
      age: 29,
      department: '设计部',
      position: '交互设计师',
      status: '在职',
      salary: 16000,
      joinDate: '2022-09-12',
      email: 'fengshier@example.com',
    },
  ];

  // 前端排序逻辑（实际项目中后端完成排序）
  let sorted = [...allData];
  if (sorter?.field && sorter?.order) {
    sorted.sort((a, b) => {
      const valA = a[sorter.field as keyof EmployeeRecord];
      const valB = b[sorter.field as keyof EmployeeRecord];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB, 'zh-CN');
        return sorter.order === 'descend' ? -cmp : cmp;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sorter.order === 'descend' ? valB - valA : valA - valB;
      }
      return 0;
    });
  }

  const start = (pagination.current - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return { data: sorted.slice(start, end), total: sorted.length };
}

/**
 * 表头排序 Demo
 *
 * 演示功能：
 * - 前端排序（点击列标题排序箭头）
 * - 默认排序
 * - 自定义排序函数（如中文排序、数字排序）
 * - 多列排序
 * - 远程排序（通过 onChange 回调获取排序参数并调用接口）
 * - 排序与 cellPreset 结合使用
 *
 * 注意：排序能力由 antd Table 内置提供，HiTable 通过继承 antd TableProps
 * 原生支持。列定义中配置 sorter 属性即可启用排序。
 */
const TableSortDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<EmployeeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [sortInfo, setSortInfo] = useState<{
    columnKey?: string;
    order?: string;
  }>({});

  // 前端排序模式：使用 antd 内置排序
  const columns_frontend: EnhancedColumnType<EmployeeRecord>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      defaultWidth: 120,
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh-CN'),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      defaultWidth: 80,
      sorter: (a, b) => a.age - b.age,
      defaultSortOrder: 'descend',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      defaultWidth: 110,
      sorter: (a, b) => a.department.localeCompare(b.department, 'zh-CN'),
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      defaultWidth: 130,
      sorter: (a, b) => a.position.localeCompare(b.position, 'zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      defaultWidth: 90,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: {
          在职: 'green',
          试用期: 'blue',
          离职: 'red',
        },
      },
      sorter: (a, b) => a.status.localeCompare(b.status, 'zh-CN'),
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      defaultWidth: 130,
      cellPreset: 'date',
      cellPresetProps: { format: 'YYYY-MM-DD' },
      sorter: (a, b) =>
        new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      defaultWidth: 120,
      cellPreset: 'number',
      cellPresetProps: {
        decimals: 0,
        thousandsSeparator: ',',
      },
      sorter: (a, b) => a.salary - b.salary,
    },
  ];

  // 远程排序模式：通过 onChange 获取排序状态并调用接口
  const columns_remote: EnhancedColumnType<EmployeeRecord>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      defaultWidth: 120,
      sorter: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      defaultWidth: 80,
      sorter: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      defaultWidth: 110,
      sorter: true,
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      defaultWidth: 130,
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      defaultWidth: 90,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: {
          在职: 'green',
          试用期: 'blue',
          离职: 'red',
        },
      },
      sorter: true,
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      defaultWidth: 120,
      cellPreset: 'number',
      cellPresetProps: {
        decimals: 0,
        thousandsSeparator: ',',
      },
      sorter: true,
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      defaultWidth: 130,
      cellPreset: 'date',
      cellPresetProps: { format: 'YYYY-MM-DD' },
      sorter: true,
    },
  ];

  // 所有数据（前端排序用）
  const [allData] = useState<EmployeeRecord[]>([
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
    {
      key: '5',
      name: '钱七',
      age: 40,
      department: '管理部',
      position: '技术总监',
      status: '在职',
      salary: 35000,
      joinDate: '2018-05-08',
      email: 'qianqi@example.com',
    },
    {
      key: '6',
      name: '孙八',
      age: 27,
      department: '市场部',
      position: '市场专员',
      status: '离职',
      salary: 10000,
      joinDate: '2023-02-14',
      email: 'sunba@example.com',
    },
    {
      key: '7',
      name: '周九',
      age: 31,
      department: '技术部',
      position: '架构师',
      status: '在职',
      salary: 28000,
      joinDate: '2019-06-20',
      email: 'zhoujiu@example.com',
    },
    {
      key: '8',
      name: '吴十',
      age: 26,
      department: '市场部',
      position: '运营专员',
      status: '试用期',
      salary: 11000,
      joinDate: '2024-01-15',
      email: 'wushi@example.com',
    },
    {
      key: '9',
      name: '郑十一',
      age: 38,
      department: '管理部',
      position: 'CEO',
      status: '在职',
      salary: 50000,
      joinDate: '2015-03-01',
      email: 'zhengshiyi@example.com',
    },
    {
      key: '10',
      name: '冯十二',
      age: 29,
      department: '设计部',
      position: '交互设计师',
      status: '在职',
      salary: 16000,
      joinDate: '2022-09-12',
      email: 'fengshier@example.com',
    },
  ]);

  /**
   * 远程排序 onChange 回调
   *
   * antd Table 的 onChange 会在分页、排序、筛选变化时触发。
   * 通过 sorter 参数可以获取当前的排序字段和方向。
   */
  const handleRemoteTableChange = useCallback(
    async (
      pagination: any,
      _filters: any,
      sorter: SorterResult<EmployeeRecord> | SorterResult<EmployeeRecord>[],
    ) => {
      // 多列排序时 sorter 是数组，单列排序是对象
      const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;

      setSortInfo({
        columnKey: singleSorter?.columnKey?.toString(),
        order: singleSorter?.order?.toString(),
      });

      setLoading(true);
      try {
        const result = await mockFetchSortedData(
          {
            current: pagination.current || 1,
            pageSize: pagination.pageSize || 10,
          },
          {
            field: singleSorter?.field as string | undefined,
            order: singleSorter?.order as string | undefined,
          },
        );
        setDataSource(result.data);
        setTotal(result.total);
        message.success(
          `数据加载成功${
            singleSorter?.order
              ? `（排序: ${singleSorter.columnKey} ${
                  singleSorter.order === 'descend' ? '降序' : '升序'
                }）`
              : ''
          }`,
        );
      } catch {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 初始加载远程数据
  const [remoteInitialized, setRemoteInitialized] = useState(false);
  const initRemoteData = useCallback(async () => {
    if (remoteInitialized) return;
    setRemoteInitialized(true);
    setLoading(true);
    try {
      const result = await mockFetchSortedData({ current: 1, pageSize: 10 });
      setDataSource(result.data);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [remoteInitialized]);

  return (
    <div>
      <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>
        1. 前端排序 — 使用自定义 sorter 函数
      </h3>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
        点击列标题的排序箭头触发排序。年龄列默认按降序排列。排序完全由前端完成，
        适合数据量较小的场景。支持中文拼音排序（姓名、部门列）。
      </div>

      <HiTable<EmployeeRecord>
        ref={tableRef}
        columns={columns_frontend}
        dataSource={allData}
        showColumnSetting
        enableColumnResize
        zebraStripe
        bordered
        pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        rowKey="key"
      />

      <h3 style={{ margin: '24px 0 16px', fontSize: 16, fontWeight: 600 }}>
        2. 远程排序 — 后端排序（sorter: true + onChange）
      </h3>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 13 }}>
        点击列标题排序箭头，排序参数通过 <Tag>onChange</Tag>{' '}
        回调传递，由后端完成排序。 适合大数据量场景。下方显示当前排序状态。
      </div>

      <Space style={{ marginBottom: 16 }}>
        <Button
          onClick={() => {
            initRemoteData();
          }}
          type="primary"
          size="small"
          disabled={remoteInitialized}
        >
          加载数据
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
          重置
        </Button>
        {loading && <Tag color="processing">加载中...</Tag>}
        {sortInfo.order ? (
          <Tag color="blue">
            当前排序: {sortInfo.columnKey}{' '}
            {sortInfo.order === 'descend' ? '↓ 降序' : '↑ 升序'}
          </Tag>
        ) : dataSource.length > 0 ? (
          <Tag>未排序</Tag>
        ) : null}
      </Space>

      <HiTable<EmployeeRecord>
        columns={columns_remote}
        dataSource={dataSource}
        loading={loading}
        onChange={handleRemoteTableChange}
        showColumnSetting
        enableColumnResize
        zebraStripe
        bordered
        pagination={{
          total,
          showTotal: (total) => `共 ${total} 条`,
          pageSize: 10,
        }}
        rowKey="key"
      />
    </div>
  );
};

export default TableSortDemo;
