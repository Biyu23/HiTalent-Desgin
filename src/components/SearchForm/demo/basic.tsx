import { DatePicker, Input, Select } from 'antd';
import {
  PopoverSelect,
  SearchForm,
  type SearchFormFieldItem,
} from 'hi-talent-design';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

interface QueryParams {
  name?: string;
  department?: string;
  status?: string;
  createdDate?: [unknown, unknown];
  remark?: string;
  tag?: string;
}

export default () => {
  const [result, setResult] = useState<QueryParams>({});

  const fields: SearchFormFieldItem<QueryParams>[] = [
    {
      name: 'name',
      label: '姓名',
      formItemProps: {
        rules: [{ required: true, message: '姓名不能为空' }],
      },
      children: <Input placeholder="请输入姓名" allowClear />,
    },
    {
      name: 'department',
      label: '所属部门',
      children: (
        <Select
          placeholder="请选择部门"
          allowClear
          style={{ width: 160 }}
          options={[
            { label: '研发中心', value: 'rd' },
            { label: '产品中心', value: 'pd' },
            { label: '市场运营', value: 'mkt' },
            { label: '财务行政', value: 'fa' },
          ]}
        />
      ),
    },
    {
      name: 'status',
      label: '招聘状态',
      children: (
        <PopoverSelect
          placeholder="请选择状态"
          options={[
            { label: '候选简历', value: 'candidate' },
            { label: '初试中', value: 'interview1' },
            { label: '复试中', value: 'interview2' },
            { label: '已发Offer', value: 'offered' },
            { label: '已入职', value: 'onboarded' },
          ]}
        />
      ),
    },
    {
      name: 'createdDate',
      label: '创建时间',
      children: <RangePicker style={{ width: 240 }} />,
    },
    {
      name: 'remark',
      label: '备注说明',
      children: <Input placeholder="模糊检索备注" allowClear />,
    },
    {
      name: 'tag',
      label: '人才标签',
      children: (
        <Select
          mode="multiple"
          placeholder="请选择标签"
          allowClear
          style={{ width: 200 }}
          options={[
            { label: '985/211', value: 'top_edu' },
            { label: '大厂背景', value: 'big_company' },
            { label: '英语流利', value: 'fluent_en' },
            { label: '即时到岗', value: 'immediate' },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SearchForm<QueryParams>
        mode="inline"
        defaultVisibleCount={4}
        fields={fields}
        onSearch={(values) => setResult(values)}
      />

      <div style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
        <strong>当前提交查询参数：</strong>
        <pre style={{ margin: '8px 0 0' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};
