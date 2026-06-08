/**
 * title: 高度定制渲染
 * description: 使用 `optionRender` 自定义每一项的长相，使用 `dropdownRender` 在列表外部追加自定义 DOM（如：新增按钮）。
 */
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Divider, Flex, Tag, Typography } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': {
    'custom.placeholder': '自定义列表与选项',
    'custom.hot': '热门',
    'custom.create': '新建职位',
  },
  'en-US': {
    'custom.placeholder': 'Custom List & Options',
    'custom.hot': 'Popular',
    'custom.create': 'Create Position',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        options={standardOptions}
        placeholder={t('custom.placeholder')}
        optionRender={(item) => (
          <Flex align="center" gap={6} style={{ width: '100%' }}>
            <UserOutlined style={{ color: '#1677ff' }} />
            <Typography.Text
              ellipsis={{ tooltip: item.label }}
              style={{ flex: 1 }}
            >
              {item.label}
            </Typography.Text>
            {item.value === 'FE' && (
              <Tag color="blue" style={{ flexShrink: 0 }}>
                {t('custom.hot')}
              </Tag>
            )}
          </Flex>
        )}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: '8px' }}>
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => alert('Navigate to create page!')}
              >
                {t('custom.create')}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};
