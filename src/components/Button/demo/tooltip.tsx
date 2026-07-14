/**
 * description: 设置 `tooltip` 后，按钮在任意状态下都可展示 Tooltip。支持直接传文案，也可传 TooltipProps 对象来控制 placement 等行为。
 */
import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'tooltip.formInvalid': '请先填写必填项',
    'tooltip.noPermission': '您没有此操作的权限',
    'tooltip.submit': '提交',
    'tooltip.delete': '删除',
    'tooltip.search': '搜索',
    'tooltip.searchHint': '按名称或编号搜索',
  },
  'en-US': {
    'tooltip.formInvalid': 'Please fill in required fields first',
    'tooltip.noPermission': 'You do not have permission for this action',
    'tooltip.submit': 'Submit',
    'tooltip.delete': 'Delete',
    'tooltip.search': 'Search',
    'tooltip.searchHint': 'Search by name or ID',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space direction="vertical">
      {/* 正常状态下展示 Tooltip */}
      <Space>
        <Button type="primary" tooltip={t('tooltip.searchHint')}>
          {t('tooltip.search')}
        </Button>
        <Button tooltip={{ title: t('tooltip.searchHint'), placement: 'top' }}>
          {t('tooltip.search')}（上方提示）
        </Button>
      </Space>

      {/* 禁用状态下展示 Tooltip */}
      <Space>
        <Button type="primary" disabled tooltip={t('tooltip.formInvalid')}>
          {t('tooltip.submit')}
        </Button>
        <Button danger disabled tooltip={t('tooltip.noPermission')}>
          {t('tooltip.delete')}
        </Button>
      </Space>

      {/* 对象模式：额外控制 placement 等 Tooltip 属性 */}
      <Space>
        <Button
          type="primary"
          disabled
          tooltip={{ title: t('tooltip.formInvalid'), placement: 'right' }}
        >
          {t('tooltip.submit')}（右侧提示）
        </Button>
        <Button
          danger
          disabled
          tooltip={{ title: t('tooltip.noPermission'), placement: 'bottom' }}
        >
          {t('tooltip.delete')}（下方提示）
        </Button>
      </Space>
    </Space>
  );
};
