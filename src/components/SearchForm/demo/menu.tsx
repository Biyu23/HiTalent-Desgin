import { DatePicker, Input, Select } from 'antd';
import {
  SearchForm,
  type SearchFieldGroup,
  type SearchFormFieldItem,
  type SearchFormRef,
} from 'hi-talent-design';
import React, { useRef, useState } from 'react';

const { RangePicker } = DatePicker;

interface CandidateFilter {
  keyword?: string;
  name?: string;
  phone?: string;
  stage?: string[];
  skills?: string[];
  createdTime?: [unknown, unknown];
}

export default () => {
  const formRef = useRef<SearchFormRef<CandidateFilter>>(null);
  const [result, setResult] = useState<CandidateFilter>({
    stage: ['s1', 's2', 's3', 's4'],
  });

  const groups: SearchFieldGroup[] = [
    { key: 'basic', title: '基本信息', defaultExpanded: true },
    { key: 'status', title: '流程与能力', defaultExpanded: true },
    { key: 'time', title: '时间维度', defaultExpanded: false },
  ];

  const fields: SearchFormFieldItem<CandidateFilter>[] = [
    // 基础信息分组
    {
      name: 'keyword',
      label: '综合关键词',
      group: 'basic',
      defaultExpanded: true,
      children: <Input placeholder="搜索姓名 / 手机 / 邮箱" allowClear />,
    },
    {
      name: 'name',
      label: '候选人姓名',
      group: 'basic',
      children: <Input placeholder="输入候选人姓名" allowClear />,
    },
    {
      name: 'phone',
      label: '手机号码',
      group: 'basic',
      children: <Input placeholder="输入手机号" allowClear />,
    },

    // 流程与能力分组
    {
      name: 'stage',
      label: '候选阶段',
      group: 'status',
      defaultExpanded: true,
      maxTagCount: 2, // 最多展示 2 个 Tag，其余折叠为 +2... 并在 Popover 提示
      children: (
        <Select
          mode="multiple"
          placeholder="请选择阶段"
          allowClear
          options={[
            { label: '简历初筛', value: 's1' },
            { label: '用人部门评估', value: 's2' },
            { label: '现场面试', value: 's3' },
            { label: '背景调查', value: 's4' },
          ]}
        />
      ),
    },
    {
      name: 'skills',
      label: '技能标签',
      group: 'status',
      children: (
        <Select
          mode="tags"
          placeholder="输入或选择技能标签"
          allowClear
          options={[
            { label: 'React', value: 'React' },
            { label: 'TypeScript', value: 'TypeScript' },
            { label: 'Node.js', value: 'Node.js' },
            { label: 'Ant Design', value: 'Ant Design' },
          ]}
        />
      ),
    },

    // 时间维度分组
    {
      name: 'createdTime',
      label: '投递时间',
      group: 'time',
      children: <RangePicker style={{ width: '100%' }} />,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* 模拟左侧/侧边菜单栏 */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 16,
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>
          筛选菜单
        </div>
        <SearchForm<CandidateFilter>
          ref={formRef}
          mode="menu"
          searchMode="change"
          fields={fields}
          groups={groups}
          initialValues={{ stage: ['s1', 's2', 's3', 's4'] }}
          onSearch={(values) => setResult(values)}
        />
      </div>

      {/* 右侧数据展示区 */}
      <div
        style={{
          flex: 1,
          padding: 16,
          background: '#fafafa',
          borderRadius: 8,
          minHeight: 300,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          查询结果数据演示：
        </div>
        <pre style={{ margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
};
