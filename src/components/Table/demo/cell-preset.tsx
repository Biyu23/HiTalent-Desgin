import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * Cell 预设渲染示例
 *
 * 演示 Table 内置的 6 种 Cell 预设类型：
 * - tag: 状态标签（配合 colorMap 根据值自动着色）
 * - progress: 进度条
 * - date: 日期格式化
 * - number: 数字格式化（千分位 + 小数位）
 * - boolean: 布尔值 → 是/否
 * - empty: 空值占位符
 */
const CellPresetDemo: React.FC = () => {
  const dataSource = [
    {
      key: '1',
      task: '需求评审',
      status: 'done',
      progress: 100,
      deadline: '2025-03-15',
      budget: 15000,
      isApproved: true,
      remark: null,
    },
    {
      key: '2',
      task: 'UI 设计',
      status: 'in_progress',
      progress: 65,
      deadline: '2025-03-20',
      budget: 8000.5,
      isApproved: true,
      remark: null,
    },
    {
      key: '3',
      task: '后端开发',
      status: 'pending',
      progress: 0,
      deadline: '2025-04-01',
      budget: 23000,
      isApproved: false,
      remark: '等待排期',
    },
    {
      key: '4',
      task: '测试验证',
      status: 'done',
      progress: 90,
      deadline: null,
      budget: 0,
      isApproved: false,
      remark: '',
    },
  ];

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    { title: '任务', dataIndex: 'task', key: 'task', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: { done: 'green', in_progress: 'blue', pending: 'orange' },
        defaultColor: 'default',
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 180,
      cellPreset: 'progress',
      cellPresetProps: { max: 100, showInfo: true, strokeColor: '#1677ff' },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 140,
      cellPreset: 'date',
      cellPresetProps: { format: 'YYYY/MM/DD' },
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      width: 140,
      cellPreset: 'number',
      cellPresetProps: {
        decimals: 2,
        thousandsSeparator: ',',
        decimalSeparator: '.',
      },
    },
    {
      title: '已审批',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 100,
      cellPreset: 'boolean',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      cellPreset: 'empty',
    },
  ];

  return (
    <HiTable
      columns={columns}
      dataSource={dataSource}
      showColumnSetting={false}
      zebraStripe
    />
  );
};

export default CellPresetDemo;
