/**
 * title: 空状态与无匹配
 * description: 当选项列表为空或搜索关键词无匹配项时，组件自动展示 Empty 占位图，为用户提供清晰的视觉反馈。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'myui';
import React from 'react';

export default () => {
  return (
    <Space size="large">
      {/* 空数据场景 */}
      <div style={{ width: 240 }}>
        <h4>无数据（options=[]）</h4>
        <PopoverSelect options={[]} placeholder="暂无可用选项" />
      </div>

      {/* 搜索无匹配场景 */}
      <div style={{ width: 240 }}>
        <h4>搜索无匹配</h4>
        <PopoverSelect
          options={[
            { label: '前端工程师', value: 'FE' },
            { label: '后端工程师', value: 'BE' },
          ]}
          showSearch
          placeholder="输入不存在的关键词"
        />
      </div>
    </Space>
  );
};
