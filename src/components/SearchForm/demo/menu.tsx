import { DatePicker, Input, InputNumber, Select } from 'antd';
import { SearchForm, type SearchFormFieldItem } from 'hi-talent-design';
import React, { useState } from 'react';

interface JobFilter {
  keyword?: string;
  position?: string;
  company?: string;
  participant?: string;
  priority?: string;
  createdTime?: [unknown, unknown];
  contact?: string;
  startDate?: unknown;
  workMode?: string;
  location?: string;
  salary?: number;
}

// 未配置 groups 时按声明顺序展示一级条件项，点击右侧加号展开控件。
const fields: SearchFormFieldItem<JobFilter>[] = [
  {
    name: 'keyword',
    label: '关键词',
    children: <Input placeholder="输入关键词" allowClear />,
  },
  {
    name: 'position',
    label: '职位名称 & 职位ID & 职位编码',
    children: <Input placeholder="输入职位名称、ID 或编码" allowClear />,
  },
  {
    name: 'company',
    label: '公司',
    children: <Input placeholder="输入公司名称" allowClear />,
  },
  {
    name: 'participant',
    label: '负责人或创建人或参与者',
    children: <Input placeholder="输入成员姓名" allowClear />,
  },
  {
    name: 'priority',
    label: '优先级',
    children: (
      <Select
        placeholder="选择优先级"
        allowClear
        options={['高', '中', '低'].map((value) => ({ label: value, value }))}
      />
    ),
  },
  {
    name: 'createdTime',
    label: '创建时间',
    children: <DatePicker.RangePicker />,
  },
  {
    name: 'contact',
    label: '客户联系人',
    children: <Input placeholder="输入客户联系人" allowClear />,
  },
  { name: 'startDate', label: '开始日期', children: <DatePicker /> },
  {
    name: 'workMode',
    label: '工作模式',
    children: (
      <Select
        placeholder="选择工作模式"
        allowClear
        options={['现场办公', '混合办公', '远程办公'].map((value) => ({
          label: value,
          value,
        }))}
      />
    ),
  },
  {
    name: 'location',
    label: '地点',
    children: <Input placeholder="输入工作地点" allowClear />,
  },
  {
    name: 'salary',
    label: '薪资',
    children: <InputNumber min={0} placeholder="最低年薪（万元）" />,
  },
];

export default () => {
  const [result, setResult] = useState<JobFilter>({});
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'flex-start',
      }}
    >
      {/* 宽高交给业务布局，标题、内部滚动、底部操作和侧栏收起由组件负责。 */}
      <SearchForm<JobFilter>
        mode="menu"
        menuTitle="搜索条件"
        fields={fields}
        showActiveFilters={false}
        resetText="清空"
        style={{ width: 360, maxWidth: '100%', height: 640 }}
        onSearch={setResult}
      />
      <div style={{ flex: '1 1 240px', minWidth: 0, padding: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>查询结果</div>
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};
