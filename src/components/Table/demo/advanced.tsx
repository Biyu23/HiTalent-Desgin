import { Button, Input, message, Popconfirm, Space } from 'antd';
import React, { useRef } from 'react';
import HiTable from '../index';
import type { EnhancedColumnType, TableRef } from '../type';

/**
 * 综合高级示例
 *
 * 同时启用：
 * - 列显隐设置（showColumnSetting）
 * - 列宽拖拽调整（enableColumnResize）
 * - Cell 预设渲染（tag / progress / text）
 * - 行内编辑（enableInlineEdit）
 * - 列搜索（onColumnSearch）
 * - toolbarRender / toolbarExtra（自定义操作栏）
 * - TableRef 命令式 API（ref）
 */
const AdvancedDemo: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [searchText, setSearchText] = React.useState('');

  const [dataSource, setDataSource] = React.useState([
    {
      key: '1',
      name: '项目 Alpha',
      status: 'active',
      progress: 85,
      owner: '张三',
      priority: 'high',
    },
    {
      key: '2',
      name: '项目 Beta',
      status: 'active',
      progress: 60,
      owner: '李四',
      priority: 'medium',
    },
    {
      key: '3',
      name: '项目 Gamma',
      status: 'paused',
      progress: 30,
      owner: '王五',
      priority: 'low',
    },
    {
      key: '4',
      name: '项目 Delta',
      status: 'completed',
      progress: 100,
      owner: '赵六',
      priority: 'high',
    },
    {
      key: '5',
      name: '项目 Epsilon',
      status: 'active',
      progress: 45,
      owner: '钱七',
      priority: 'medium',
    },
  ]);

  // 行内编辑
  const handleCellEdit = async (
    record: (typeof dataSource)[0],
    field: string,
    value: any,
  ) => {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 200);
    });
    setDataSource((prev) =>
      prev.map((item) =>
        item.key === record.key ? { ...item, [field]: value } : item,
      ),
    );
    message.success(`已更新: ${record.name} -> ${field}`);
  };

  // 列搜索
  const handleColumnSearch = (columnKey: string, searchText: string) => {
    console.log(`搜索列 ${columnKey}: ${searchText}`);
    // 实际项目中在此处触发远程搜索或本地过滤
  };

  // 自定义工具栏渲染
  const toolbarRender = (defaultToolbar: React.ReactNode) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Space>
        <Input.Search
          placeholder="搜索项目"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Button type="primary" onClick={() => message.info('新建项目')}>
          新建
        </Button>
        <Button onClick={() => tableRef.current?.resetAll()}>重置配置</Button>
        <Popconfirm
          title="确定删除所选数据？"
          onConfirm={() => message.success('已删除')}
        >
          <Button danger>批量删除</Button>
        </Popconfirm>
      </Space>
      {defaultToolbar}
    </div>
  );

  const columns: EnhancedColumnType<(typeof dataSource)[0]>[] = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      defaultWidth: 140,
      editable: true,
      searchable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      defaultWidth: 100,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: {
          active: 'green',
          paused: 'orange',
          completed: 'blue',
        },
        defaultColor: 'default',
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      defaultWidth: 180,
      cellPreset: 'progress',
      cellPresetProps: { max: 100, showInfo: true, strokeColor: '#1677ff' },
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      defaultWidth: 100,
      editable: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      defaultWidth: 90,
      cellPreset: 'tag',
      cellPresetProps: {
        colorMap: { high: 'red', medium: 'orange', low: 'default' },
      },
    },
  ];

  // 过滤数据
  const filteredData = searchText
    ? dataSource.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      )
    : dataSource;

  return (
    <div>
      <HiTable
        ref={tableRef}
        columns={columns}
        dataSource={filteredData}
        showColumnSetting
        enableColumnResize
        enableInlineEdit
        onCellEdit={handleCellEdit}
        onColumnSearch={handleColumnSearch}
        toolbarRender={toolbarRender}
        zebraStripe
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

export default AdvancedDemo;
