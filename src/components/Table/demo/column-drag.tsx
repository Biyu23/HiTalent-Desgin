import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 列拖拽排序示例
 *
 * 演示 enableColumnDrag 列拖拽排序：
 * - 在表头 hover 时出现拖拽手柄（HolderOutlined 图标）
 * - 拖拽手柄可拖拽整列到其他列位置
 * - 支持通过 orderedKeys/defaultOrderedKeys 受控/非受控列顺序
 */
const ColumnDragDemo: React.FC = () => {
  const dataSource = Array.from({ length: 10 }, (_, i) => ({
    key: String(i + 1),
    name: `用户 ${i + 1}`,
    age: 20 + (i % 30),
    city: ['北京', '上海', '广州', '深圳'][i % 4],
    email: `user${i + 1}@example.com`,
    role: ['管理员', '编辑', '访客'][i % 3],
  }));

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    { title: '姓名', dataIndex: 'name', key: 'name', defaultWidth: 120 },
    { title: '年龄', dataIndex: 'age', key: 'age', defaultWidth: 80 },
    { title: '城市', dataIndex: 'city', key: 'city', defaultWidth: 100 },
    { title: '邮箱', dataIndex: 'email', key: 'email', defaultWidth: 200 },
    { title: '角色', dataIndex: 'role', key: 'role', defaultWidth: 100 },
  ];

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>
        提示：将鼠标悬停在表头上，会出现拖拽手柄图标，拖拽即可排序列
      </p>
      <HiTable
        columns={columns}
        dataSource={dataSource}
        enableColumnDrag
        showColumnSetting={false}
        zebraStripe
        pagination={false}
      />
    </div>
  );
};

export default ColumnDragDemo;
