/**
 * description: 继承 Ant Design Button 全部原生属性，支持多种类型（primary、dashed、text、link）、状态（danger、disabled）和尺寸（small、middle、large），可搭配图标使用。
 */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Flex, Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'btn.type': '按钮类型',
    'btn.danger': '危险状态',
    'btn.size': '按钮尺寸',
    'btn.disabledIcon': '禁用状态与图标',
    'btn.primary': 'Primary 主按钮',
    'btn.default': 'Default 默认',
    'btn.dashed': 'Dashed 虚线',
    'btn.text': 'Text 文本',
    'btn.link': 'Link 链接',
    'btn.delete': '删除',
    'btn.unpublish': '取消发布',
    'btn.remove': '移除',
    'btn.small': '小号',
    'btn.medium': '中号（默认）',
    'btn.large': '大号',
    'btn.search': '搜索',
    'btn.download': '下载',
    'btn.disabled': '禁用态',
    'btn.disabledWithIcon': '禁用含图标',
  },
  'en-US': {
    'btn.type': 'Button Types',
    'btn.danger': 'Danger States',
    'btn.size': 'Button Sizes',
    'btn.disabledIcon': 'Disabled States & Icons',
    'btn.primary': 'Primary',
    'btn.default': 'Default',
    'btn.dashed': 'Dashed',
    'btn.text': 'Text',
    'btn.link': 'Link',
    'btn.delete': 'Delete',
    'btn.unpublish': 'Unpublish',
    'btn.remove': 'Remove',
    'btn.small': 'Small',
    'btn.medium': 'Medium (Default)',
    'btn.large': 'Large',
    'btn.search': 'Search',
    'btn.download': 'Download',
    'btn.disabled': 'Disabled',
    'btn.disabledWithIcon': 'Disabled with Icon',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
          {t('btn.type')}
        </p>
        <Flex gap={8} wrap>
          <Button type="primary">{t('btn.primary')}</Button>
          <Button>{t('btn.default')}</Button>
          <Button type="dashed">{t('btn.dashed')}</Button>
          <Button type="text">{t('btn.text')}</Button>
          <Button type="link">{t('btn.link')}</Button>
        </Flex>
      </div>

      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
          {t('btn.danger')}
        </p>
        <Flex gap={8} wrap>
          <Button type="primary" danger>
            {t('btn.delete')}
          </Button>
          <Button danger>{t('btn.unpublish')}</Button>
          <Button type="text" danger>
            {t('btn.remove')}
          </Button>
        </Flex>
      </div>

      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
          {t('btn.size')}
        </p>
        <Flex gap={8} align="center" wrap>
          <Button type="primary" size="small">
            {t('btn.small')}
          </Button>
          <Button type="primary">{t('btn.medium')}</Button>
          <Button type="primary" size="large">
            {t('btn.large')}
          </Button>
        </Flex>
      </div>

      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
          {t('btn.disabledIcon')}
        </p>
        <Flex gap={8} wrap>
          <Button type="primary" icon={<SearchOutlined />}>
            {t('btn.search')}
          </Button>
          <Button icon={<DownloadOutlined />}>{t('btn.download')}</Button>
          <Button type="primary" disabled>
            {t('btn.disabled')}
          </Button>
          <Button disabled icon={<DownloadOutlined />}>
            {t('btn.disabledWithIcon')}
          </Button>
        </Flex>
      </div>
    </Space>
  );
};
