import { Input, Select } from 'antd';
import { SearchForm, type SearchFormFieldItem } from 'hi-talent-design';
import React, { useState } from 'react';

interface Filters {
  keyword?: string;
  department?: string;
  owner?: string;
  email?: string;
  location?: string;
}

const fields: SearchFormFieldItem<Filters>[] = [
  {
    name: 'keyword',
    label: '关键词',
    pinned: true,
    children: <Input allowClear placeholder="姓名、职位或技能" />,
  },
  {
    name: 'department',
    label: '部门',
    children: (
      <Select
        allowClear
        placeholder="全部部门"
        options={[
          { label: '研发中心', value: '研发中心' },
          { label: '产品中心', value: '产品中心' },
        ]}
      />
    ),
  },
  {
    name: 'owner',
    label: '负责人',
    children: <Input allowClear placeholder="输入负责人" />,
  },
  {
    name: 'email',
    label: '邮箱',
    formItemProps: { rules: [{ type: 'email', message: '请输入有效邮箱' }] },
    children: <Input allowClear placeholder="name@example.com" />,
  },
  {
    name: 'location',
    label: '所在地',
    children: <Input allowClear placeholder="输入城市" />,
  },
];

export default () => {
  const [result, setResult] = useState<Filters>({});
  return (
    <div>
      <SearchForm<Filters>
        fields={fields}
        inlineLayout="form"
        inlineMinWidth={200}
        defaultVisibleCount={3}
        onSearch={setResult}
      />
      <pre
        style={{
          marginTop: 16,
          padding: 12,
          background: '#fafafa',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
};
