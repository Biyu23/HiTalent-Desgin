/**
 * title: 空状态与无匹配
 * description: 当选项列表为空或搜索关键词无匹配项时，组件自动展示 Empty 占位图，为用户提供清晰的视觉反馈。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'empty.noData': '无数据（options=[]）',
    'empty.noDataPlaceholder': '暂无可用选项',
    'empty.noMatch': '搜索无匹配',
    'empty.noMatchPlaceholder': '输入不存在的关键词',
  },
  'en-US': {
    'empty.noData': 'No Data (options = [])',
    'empty.noDataPlaceholder': 'No options available',
    'empty.noMatch': 'Search No Match',
    'empty.noMatchPlaceholder': 'Type a non-existent keyword',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space size="large">
      <div style={{ width: 240 }}>
        <h4>{t('empty.noData')}</h4>
        <PopoverSelect
          options={[]}
          placeholder={t('empty.noDataPlaceholder')}
        />
      </div>
      <div style={{ width: 240 }}>
        <h4>{t('empty.noMatch')}</h4>
        <PopoverSelect
          options={[
            { label: 'Frontend Engineer', value: 'FE' },
            { label: 'Backend Engineer', value: 'BE' },
          ]}
          showSearch
          placeholder={t('empty.noMatchPlaceholder')}
        />
      </div>
    </Space>
  );
};
