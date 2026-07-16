import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 列宽调整示例
 *
 * 演示通过 enableColumnResize 启用列宽拖拽调整：
 * - 鼠标悬停在表头右侧边缘会出现调整手柄
 * - 拖拽手柄可调整列宽
 * - 通过 defaultColumnWidths 设置初始列宽
 * - 双击手柄可自适应列宽
 */
const ColumnResizeDemo: React.FC = () => {
  const dataSource = Array.from({ length: 20 }, (_, i) => ({
    key: String(i + 1),
    name: `员工 ${i + 1}`,
    department: ['技术部', '产品部', '设计部', '市场部'][i % 4],
    position: ['前端工程师', '后端工程师', '产品经理', 'UI 设计师'][i % 4],
    email: `user${i + 1}@company.com`,
    phone: `1380000${String(i).padStart(4, '0')}`,
  }));

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      defaultWidth: 120,
      minWidth: 80,
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
      defaultWidth: 150,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      defaultWidth: 220,
      minWidth: 150,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      defaultWidth: 160,
      // resizable: false 则该列不可调整宽度
      resizable: false,
    },
  ];

  return (
    <HiTable
      columns={columns}
      dataSource={dataSource}
      enableColumnResize
      showColumnSetting={false}
      zebraStripe
      scroll={{ y: 400 }}
      pagination={false}
    />
  );
};

export default ColumnResizeDemo;
