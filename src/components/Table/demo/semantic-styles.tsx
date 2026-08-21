import { Table } from 'hi-talent-design';
import React from 'react';

const columns = [
  { id: 'name', title: 'Name', dataIndex: 'name', width: 180 },
  { id: 'role', title: 'Role', dataIndex: 'role', width: 180 },
];
const data = [{ key: '1', name: 'Ada', role: 'Engineer' }];

export default () => (
  <Table
    columns={columns}
    dataSource={data}
    rootClassName="demo-table-boundary"
    classNames={{ toolbar: 'demo-table-toolbar', table: 'demo-table' }}
    styles={{
      root: { padding: 12, border: '1px solid #d9d9d9' },
      toolbar: { background: '#f5f5f5' },
      headerCell: { color: '#1677ff' },
      resizeHandle: { '--demo-resize-color': '#1677ff' },
    }}
  />
);
