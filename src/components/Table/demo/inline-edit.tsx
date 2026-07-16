import { message } from 'antd';
import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 行内编辑示例
 *
 * 演示 enableInlineEdit 行内编辑：
 * - 在可编辑列上双击 cell 进入编辑模式
 * - 按 Enter 或 blur 保存编辑
 * - 按 Escape 取消编辑
 * - onCellEdit 回调处理异步保存逻辑
 */
const InlineEditDemo: React.FC = () => {
  const [dataSource, setDataSource] = React.useState([
    {
      key: '1',
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800000001',
    },
    { key: '2', name: '李四', email: 'lisi@example.com', phone: '13800000002' },
    {
      key: '3',
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800000003',
    },
  ]);

  const handleCellEdit = async (
    record: (typeof dataSource)[0],
    field: string,
    value: any,
  ) => {
    // 模拟异步保存
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });

    setDataSource((prev) =>
      prev.map((item) =>
        item.key === record.key ? { ...item, [field]: value } : item,
      ),
    );

    message.success(`${record.name} 的 ${field} 已更新为 ${value}`);
  };

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      editable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      editable: true,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
      editable: true,
    },
  ];

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>
        提示：双击单元格即可编辑，按 Enter 保存，按 Escape 取消
      </p>
      <HiTable
        columns={columns}
        dataSource={dataSource}
        enableInlineEdit
        onCellEdit={handleCellEdit}
        showColumnSetting={false}
        zebraStripe
        pagination={false}
      />
    </div>
  );
};

export default InlineEditDemo;
