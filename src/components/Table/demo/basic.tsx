import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 基础用法示例：列显隐设置 + 斑马纹
 *
 * 演示 Table 核心能力：
 * - 列显示/隐藏设置（右上角齿轮按钮）
 * - 斑马纹（zebraStripe）
 * - hideable: false 的列不可隐藏
 * - hidden: true 的列默认隐藏
 * - 可通过列设置面板重新勾选显示
 */
const BasicDemo: React.FC = () => {
  const dataSource = [
    {
      key: '1',
      name: '张三',
      age: 32,
      address: '西湖区湖底公园1号',
      email: 'zhangsan@example.com',
      status: 'active',
    },
    {
      key: '2',
      name: '李四',
      age: 42,
      address: '拱墅区运河上街2号',
      email: 'lisi@example.com',
      status: 'inactive',
    },
    {
      key: '3',
      name: '王五',
      age: 28,
      address: '余杭区未来科技城3号',
      email: 'wangwu@example.com',
      status: 'active',
    },
  ];

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age', hideable: false },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '邮箱', dataIndex: 'email', key: 'email', hidden: true },
    { title: '状态', dataIndex: 'status', key: 'status' },
  ];

  return (
    <HiTable
      columns={columns}
      dataSource={dataSource}
      showColumnSetting
      zebraStripe
      pagination={false}
    />
  );
};

export default BasicDemo;
