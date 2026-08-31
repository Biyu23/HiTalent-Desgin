import { DatePicker, Select } from 'antd';
import { SearchForm, type SearchFormFieldItem } from 'hi-talent-design';
import React, { useState } from 'react';

const { RangePicker } = DatePicker;

interface AdvancedFilter {
  role?: string;
  salary?: [number, number];
  interviewDate?: [unknown, unknown];
}

export default () => {
  const [result, setResult] = useState<AdvancedFilter>({});

  const fields: SearchFormFieldItem<AdvancedFilter>[] = [
    {
      name: 'role',
      label: '岗位方向',
      children: (
        <Select
          placeholder="请选择"
          allowClear
          style={{ width: 160 }}
          options={[
            { label: '全栈架构师', value: 'architect' },
            { label: '前端专家', value: 'fe_expert' },
            { label: '算法科学家', value: 'ai_scientist' },
          ]}
        />
      ),
      // 自定义 Tag 文案，格式化为自定义展示
      formatTag: (val) => {
        const map: Record<string, string> = {
          architect: '全栈架构师',
          fe_expert: '前端专家',
          ai_scientist: '算法科学家',
        };
        return `期望岗位: ${map[String(val)] || val}`;
      },
    },
    {
      name: 'interviewDate',
      label: '面试窗口',
      children: <RangePicker style={{ width: 240 }} />,
      // 自定义日期格式化
      formatTag: (val) => {
        if (Array.isArray(val) && val.length === 2) {
          const start = val[0] as
            | { format?: (fmt: string) => string }
            | undefined;
          const end = val[1] as
            | { format?: (fmt: string) => string }
            | undefined;
          return `面试时间: ${start?.format ? start.format('MM/DD') : ''} ~ ${
            end?.format ? end.format('MM/DD') : ''
          }`;
        }
        return false;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SearchForm<AdvancedFilter>
        mode="inline"
        fields={fields}
        onSearch={(values) => setResult(values)}
      />

      <div style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
        <strong>当前查询结果：</strong>
        <pre style={{ margin: '8px 0 0' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};
