import { message } from 'antd';
import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, RowDragResult } from '../type';

/**
 * 行拖拽排序示例
 *
 * 演示 enableRowDrag 行拖拽排序：
 * - 行首 hover 时出现拖拽手柄
 * - 上下拖拽行可改变行顺序
 * - onRowDragEnd 回调返回 { dragKey, targetKey, position }
 */
const RowDragDemo: React.FC = () => {
  const [dataSource, setDataSource] = React.useState(
    Array.from({ length: 8 }, (_, i) => ({
      key: String(i + 1),
      sort: i + 1,
      title: `任务 ${i + 1}`,
      priority: ['高', '中', '低'][i % 3],
      assignee: `负责人 ${(i % 5) + 1}`,
    })),
  );

  const handleRowDragEnd = (result: RowDragResult) => {
    const { dragKey, targetKey, position } = result;

    setDataSource((prev) => {
      const newData = [...prev];
      const dragIndex = newData.findIndex(
        (item) => item.key === String(dragKey),
      );
      const targetIndex = newData.findIndex(
        (item) => item.key === String(targetKey),
      );

      if (dragIndex === -1 || targetIndex === -1) return prev;

      const [removed] = newData.splice(dragIndex, 1);
      const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
      newData.splice(insertIndex, 0, removed);

      // 更新序号
      return newData.map((item, i) => ({ ...item, sort: i + 1 }));
    });

    message.success(
      `行 ${dragKey} 移动到 ${targetKey} ${
        position === 'after' ? '之后' : '之前'
      }`,
    );
  };

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    { title: '序号', dataIndex: 'sort', key: 'sort', width: 80 },
    { title: '任务', dataIndex: 'title', key: 'title', width: 150 },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 100 },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee', width: 120 },
  ];

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>
        提示：将鼠标悬停在行首，会出现拖拽手柄图标，拖拽即可排序行
      </p>
      <HiTable
        columns={columns}
        dataSource={dataSource}
        enableRowDrag
        onRowDragEnd={handleRowDragEnd}
        showColumnSetting={false}
        zebraStripe
        pagination={false}
      />
    </div>
  );
};

export default RowDragDemo;
