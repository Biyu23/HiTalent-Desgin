import { Checkbox, DatePicker, Input, Select } from 'antd';
import {
  PopoverSelect,
  SearchForm,
  type SearchFieldGroup,
  type SearchFormFieldItem,
} from 'hi-talent-design';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

interface ProjectFilter {
  keyword?: string;
  hasContract?: boolean;
  priority?: string;
  department?: string;
  owner?: string;
  dateRange?: [unknown, unknown];
  budget?: string;
}

export default () => {
  const [result, setResult] = useState<ProjectFilter>({});

  const groups: SearchFieldGroup[] = [
    { key: 'base', title: '基础信息', defaultExpanded: true },
    { key: 'detail', title: '商务与时间', defaultExpanded: true },
  ];

  const fields: SearchFormFieldItem<ProjectFilter>[] = [
    // 顶部平铺的高频核心项（设置 pinned: true 或排在最前）
    {
      name: 'keyword',
      label: '项目关键词',
      pinned: true,
      children: <Input placeholder="输入项目名称/编号" allowClear />,
    },
    {
      name: 'priority',
      label: '项目等级',
      pinned: true,
      children: (
        <PopoverSelect
          placeholder="请选择等级"
          options={[
            { label: 'S 级（重点战略）', value: 'S' },
            { label: 'A 级（核心业务）', value: 'A' },
            { label: 'B 级（日常推进）', value: 'B' },
          ]}
        />
      ),
    },
    {
      name: 'department',
      label: '所属事业部',
      children: (
        <Select
          placeholder="请选择事业部"
          allowClear
          style={{ width: 160 }}
          options={[
            { label: '电商业务部', value: 'e_commerce' },
            { label: '海外业务部', value: 'oversea' },
            { label: '企业服务部', value: 'saas' },
          ]}
        />
      ),
    },
    {
      name: 'dateRange',
      label: '签约周期',
      children: <RangePicker style={{ width: 240 }} />,
    },

    // 抽屉专属快捷项
    {
      name: 'hasContract',
      label: '已归档合同',
      quick: true,
      formItemProps: { valuePropName: 'checked' },
      children: <Checkbox>已归档合同</Checkbox>,
    },

    // 抽屉分组进阶项
    {
      name: 'owner',
      label: '负责人',
      group: 'base',
      children: <Input placeholder="负责人姓名" allowClear />,
    },
    {
      name: 'budget',
      label: '预算规模',
      group: 'detail',
      children: (
        <Select
          placeholder="选择预算区间"
          allowClear
          options={[
            { label: '10万以内', value: 'lt_10' },
            { label: '10万 ~ 50万', value: '10_50' },
            { label: '50万以上', value: 'gt_50' },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SearchForm<ProjectFilter>
        mode="combined"
        defaultVisibleCount={3}
        menuTitle="高级项目检索"
        menuTrigger="更多高级筛选"
        fields={fields}
        groups={groups}
        onSearch={(values) => setResult(values)}
      />

      <div style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
        <strong>当前生效查询条件：</strong>
        <pre style={{ margin: '8px 0 0' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};
