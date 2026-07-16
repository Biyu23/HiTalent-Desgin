import { message } from 'antd';
import React from 'react';
import type { ColumnConfigItem } from '../hooks/useTableColumns';
import { useTableColumns } from '../hooks/useTableColumns';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 列配置持久化示例
 *
 * 演示 useTableColumns hook 与后端 API 桥接的完整流程：
 * - 模拟从后端获取列配置（getReportColumns）
 * - 模拟保存列配置到后端（editReportColumns）
 * - loading 状态反馈到列设置面板
 * - 受控模式：visibleKeys / orderedKeys 由 hook 管理
 */

// ==================== 模拟后端 ====================

/** 模拟后端存储的列配置 */
const mockBackendConfig: ColumnConfigItem[] = [
  { key: 'name', visible: true, order: 0, width: 160 },
  { key: 'department', visible: true, order: 1, width: 120 },
  { key: 'position', visible: true, order: 2, width: 120 },
  { key: 'salary', visible: false, order: 3, width: 100 },
  { key: 'email', visible: true, order: 4, width: 200 },
  { key: 'status', visible: true, order: 5, width: 100 },
];

/** 模拟 getReportColumns API */
const mockGetReportColumns = async (): Promise<ColumnConfigItem[]> => {
  // 模拟网络延迟
  await new Promise((resolve) => {
    setTimeout(resolve, 600);
  });
  // 深拷贝避免外部修改污染"后端"
  return JSON.parse(JSON.stringify(mockBackendConfig));
};

/** 模拟 editReportColumns API */
const mockEditReportColumns = async (
  configs: ColumnConfigItem[],
): Promise<void> => {
  // 模拟网络延迟
  await new Promise((resolve) => {
    setTimeout(resolve, 400);
  });
  // 更新"后端"
  Object.assign(mockBackendConfig, JSON.parse(JSON.stringify(configs)));
  console.log('列配置已保存到后端:', configs);
};

// ==================== 数据 ====================

const dataSource = [
  {
    key: '1',
    name: '张三',
    department: '技术部',
    position: '前端工程师',
    salary: '¥25,000',
    email: 'zhangsan@example.com',
    status: '在职',
  },
  {
    key: '2',
    name: '李四',
    department: '产品部',
    position: '产品经理',
    salary: '¥30,000',
    email: 'lisi@example.com',
    status: '在职',
  },
  {
    key: '3',
    name: '王五',
    department: '设计部',
    position: 'UI 设计师',
    salary: '¥22,000',
    email: 'wangwu@example.com',
    status: '离职',
  },
  {
    key: '4',
    name: '赵六',
    department: '技术部',
    position: '后端工程师',
    salary: '¥28,000',
    email: 'zhaoliu@example.com',
    status: '在职',
  },
  {
    key: '5',
    name: '钱七',
    department: '市场部',
    position: '市场经理',
    salary: '¥26,000',
    email: 'qianqi@example.com',
    status: '在职',
  },
];

const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    defaultWidth: 160,
    hideable: false, // 姓名列不可隐藏
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    defaultWidth: 120,
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position',
    defaultWidth: 120,
  },
  {
    title: '薪资',
    dataIndex: 'salary',
    key: 'salary',
    defaultWidth: 100,
    hidden: true, // 薪资默认隐藏
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    defaultWidth: 200,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    defaultWidth: 100,
    cellPreset: 'tag',
    cellPresetProps: {
      colorMap: { 在职: 'green', 离职: 'red' },
    },
  },
];

// ==================== Demo 组件 ====================

const ColumnPersistDemo: React.FC = () => {
  const { tableProps, loading } = useTableColumns({
    request: mockGetReportColumns,
    updateRequest: (configs) =>
      mockEditReportColumns(configs).then(() => {
        message.success('列配置已保存');
      }),
  });

  return (
    <div>
      <HiTable
        columns={columns}
        dataSource={dataSource}
        {...tableProps}
        columnSettingLoading={loading}
        showColumnSetting
        enableColumnResize
        zebraStripe
        pagination={false}
      />
    </div>
  );
};

export default ColumnPersistDemo;
