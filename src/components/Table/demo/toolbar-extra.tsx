import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, message, Select, Space } from 'antd';
import React from 'react';
import HiTable from '../index';
import type { EnhancedColumnType } from '../type';

/**
 * 自定义操作栏示例
 *
 * 演示 toolbarExtra 和 toolbarRender：
 * - toolbarExtra: 在列设置按钮左侧渲染额外内容
 * - toolbarRender: 完全自定义操作栏渲染逻辑
 */
const ToolbarExtraDemo: React.FC = () => {
  const dataSource = Array.from({ length: 12 }, (_, i) => ({
    key: String(i + 1),
    product: `产品 ${String.fromCharCode(65 + i)}`,
    category: ['电子产品', '服装', '食品', '图书'][i % 4],
    price: Math.round(Math.random() * 10000) / 100,
    stock: Math.floor(Math.random() * 500),
  }));

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    { title: '产品', dataIndex: 'product', key: 'product' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      cellPreset: 'number',
      cellPresetProps: { decimals: 2 },
    },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
  ];

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>
        提示：操作栏左侧是 toolbarExtra
        渲染的自定义按钮和筛选器，右侧是默认的列设置齿轮按钮
      </p>
      <HiTable
        columns={columns}
        dataSource={dataSource}
        showColumnSetting
        zebraStripe
        pagination={{ pageSize: 10 }}
        toolbarExtra={
          <Space>
            <Select
              placeholder="选择分类"
              style={{ width: 120 }}
              options={[
                { label: '全部', value: 'all' },
                { label: '电子产品', value: '电子' },
                { label: '服装', value: '服装' },
                { label: '食品', value: '食品' },
                { label: '图书', value: '图书' },
              ]}
              size="small"
            />
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => message.info('新增产品')}
            >
              新增
            </Button>
            <Button
              size="small"
              icon={<ExportOutlined />}
              onClick={() => message.info('导出数据')}
            >
              导出
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default ToolbarExtraDemo;
