import { Checkbox, DatePicker, Input, Select } from 'antd';
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
  followed?: boolean;
  radius?: string;
  name?: string;
  phone?: string;
  stage?: string[];
  skills?: string[];
  createdTime?: [unknown, unknown];
}

export default () => {
  const formRef = useRef<SearchFormRef<CandidateFilter>>(null);
  const [result, setResult] = useState<CandidateFilter>({
    stage: ['简历初筛', '用人部门评估', '现场面试', '背景调查'],
  });

  const groups: SearchFieldGroup[] = [
    { key: 'basic', title: '基本信息', defaultExpanded: true },
    { key: 'status', title: '流程与能力', defaultExpanded: true },
    { key: 'time', title: '时间维度', defaultExpanded: false },
  ];

  const fields: SearchFormFieldItem<CandidateFilter>[] = [
    {
      name: 'followed',
      label: '我关注的候选人',
      quick: true,
      formItemProps: { valuePropName: 'checked' },
      formatTag: (value) => (value ? '我关注的候选人' : null),
      children: <Checkbox />,
    },
    {
      name: 'radius',
      label: '半径（选择所在地后可用）',
      group: 'basic',
      disabled: true,
      children: <Input placeholder="请先选择所在地" />,
    },
    // 基础信息分组
    {
      name: 'keyword',
      label: '综合关键词',
      group: 'basic',
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
      maxTagCount: 2, // 最多展示 2 个 Tag，其余折叠为 +2... 并在 Popover 提示
      children: (
        <Select
          mode="multiple"
          placeholder="请选择阶段"
          allowClear
          options={[
            { label: '简历初筛', value: '简历初筛' },
            { label: '用人部门评估', value: '用人部门评估' },
            { label: '现场面试', value: '现场面试' },
            { label: '背景调查', value: '背景调查' },
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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 24,
        alignItems: 'flex-start',
      }}
    >
      {/* 模拟左侧/侧边菜单栏 */}
      <div
        style={{
          width: 300,
          maxWidth: '100%',
          minWidth: 0,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: '16px 0 0',
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, padding: '0 16px 16px' }}>
          筛选菜单
        </div>
        <SearchForm<CandidateFilter>
          ref={formRef}
          mode="menu"
          searchMode="submit"
          showActiveFilters={false}
          fields={fields}
          groups={groups}
          style={{ maxHeight: 520 }}
          styles={{ menu: { overflowY: 'auto', minHeight: 0, flex: 1 } }}
          initialValues={{
            stage: ['简历初筛', '用人部门评估', '现场面试', '背景调查'],
          }}
          onSearch={(values) => setResult(values)}
        />
      </div>

      {/* 右侧数据展示区 */}
      <div
        style={{
          flex: '1 1 240px',
          minWidth: 0,
          padding: 16,
          background: '#fafafa',
          borderRadius: 8,
          minHeight: 300,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          查询结果数据演示：
        </div>
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
