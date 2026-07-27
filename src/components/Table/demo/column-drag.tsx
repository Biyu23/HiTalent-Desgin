import { Button, message, Space, Tag } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, TableRef } from '../type';

/**
 * 模拟接口：保存列配置到后端
 *
 * 实际项目中替换为真实的 API 调用
 */
async function mockSaveColumnConfig(columns: EnhancedColumnType<any>[]) {
  console.log(
    '%c[Mock API] 保存列配置到后端...',
    'color: #1677ff; font-weight: bold',
  );
  // 模拟网络延迟
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });

  // 只序列化关键字段，方便查看
  const payload = columns.map((col, i) => ({
    dataIndex: col.dataIndex || col.key,
    title: col.title,
    hidden: col.hidden || false,
    width: col.width,
    order: i,
  }));
  console.table(payload);
  console.log('%c[Mock API] 保存成功 ✓', 'color: #52c41a; font-weight: bold');
  return { code: 0, data: payload };
}

/**
 * 表头拖拽 & 列配置 Demo
 *
 * 演示功能：
 * - 列显隐设置（showColumnSetting）—— 右上角齿轮按钮
 * - 列宽拖拽调整（enableColumnResize）—— 拖拽列右侧边缘
 * - 列拖拽排序（enableColumnDrag）—— 拖拽列标题重新排序
 * - onColumnsChange —— 列配置变更时自动触发，调用模拟接口保存
 * - resetAll —— 一键重置所有列配置
 */
const ColumnDragDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [saving, setSaving] = useState(false);

  const [columns, setColumns] = useState<
    EnhancedColumnType<(typeof dataSource)[0]>[]
  >([
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      defaultWidth: 120,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      defaultWidth: 80,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      defaultWidth: 130,
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      defaultWidth: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      defaultWidth: 100,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: {
          在职: 'green',
          试用期: 'blue',
          离职: 'red',
        },
      },
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
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      defaultWidth: 130,
      cellPreset: 'date',
      cellPresetProps: { format: 'YYYY-MM-DD' },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      defaultWidth: 200,
      hideable: true,
    },
  ]);

  const [dataSource] = useState([
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
  ]);

  /**
   * 列配置变更回调
   *
   * 在以下时机触发：
   * - 拖拽列宽松开鼠标（mouseup）
   * - 列显隐切换
   * - 列拖拽排序结束（dragEnd）
   *
   * 返回的 columns 已按当前顺序排列，并注入 hidden / width 字段
   */
  const handleColumnsChange = useCallback(
    async (updatedColumns: EnhancedColumnType<(typeof dataSource)[0]>[]) => {
      // 更新本地状态
      setColumns(updatedColumns);
      // 调用模拟接口保存到后端
      setSaving(true);
      try {
        await mockSaveColumnConfig(updatedColumns);
        message.success('列配置已保存');
      } catch {
        message.error('保存失败，请重试');
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  // 当前隐藏的列
  const hiddenColumns = columns
    .filter((col) => col.hidden)
    .map((col) => (col.title as string) || col.dataIndex);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => tableRef.current?.resetAll()}>重置列配置</Button>
        <Tag color="processing">{saving ? '保存中...' : '已同步'}</Tag>
        {hiddenColumns.length > 0 && (
          <Tag color="warning">已隐藏: {hiddenColumns.join('、')}</Tag>
        )}
      </Space>

      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={dataSource}
        showColumnSetting
        enableColumnResize
        enableColumnDrag
        onColumnsChange={handleColumnsChange}
        zebraStripe
        bordered
        pagination={{ pageSize: 10 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ColumnDragDemo;
