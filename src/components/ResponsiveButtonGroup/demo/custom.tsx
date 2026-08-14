/**
 * description: 折叠菜单项和“更多”触发器均可自定义；Promise 操作在平铺与折叠状态间共享 loading。
 */
import {
  CloudDownloadOutlined,
  EllipsisOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import { ResponsiveButtonGroup } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    publish: '发布',
    download: '下载报告',
    setting: '设置',
    moreTip: '打开其他操作',
    beta: '测试版',
  },
  'en-US': {
    publish: 'Publish',
    download: 'Download report',
    setting: 'Settings',
    moreTip: 'Open more actions',
    beta: 'Beta',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const wait = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, 1500);
    });

  return (
    <div style={{ width: 270, maxWidth: '100%' }}>
      <ResponsiveButtonGroup
        minVisibleCount={1}
        overflowIcon={<EllipsisOutlined />}
        items={[
          {
            key: 'publish',
            label: t('publish'),
            icon: <SendOutlined />,
            priority: 100,
            buttonProps: { type: 'primary' },
            onClick: wait,
          },
          {
            key: 'download',
            label: t('download'),
            icon: <CloudDownloadOutlined />,
            priority: 10,
            onClick: wait,
            renderCollapsedItem: ({ defaultNode }) => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {defaultNode}
                <small style={{ color: '#8c8c8c' }}>{t('beta')}</small>
              </span>
            ),
          },
          {
            key: 'setting',
            label: t('setting'),
            icon: <SettingOutlined />,
            priority: 0,
            disabled: true,
          },
        ]}
        renderOverflowButton={({ count, defaultNode }) => (
          <Tooltip title={`${t('moreTip')} (${count})`}>{defaultNode}</Tooltip>
        )}
      />
    </div>
  );
};
