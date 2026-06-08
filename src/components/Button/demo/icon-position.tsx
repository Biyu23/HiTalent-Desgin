/**
 * title: icon展示位置
 * description: 默认 `iconPosition`为`left`, 可以设置四个方向`left`|`right`|`top`|`bottom`的图标位置。
 */
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { Button } from 'myui';
import { useDemoIntl } from 'myui/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': { 'icon.download': '下载' },
  'en-US': { 'icon.download': 'Download' },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space align="center" size="large">
      <Button icon={<CloudDownloadOutlined />} iconPosition="left">
        {t('icon.download')}
      </Button>
      <Button icon={<CloudDownloadOutlined />} iconPosition="right">
        {t('icon.download')}
      </Button>
      <Button icon={<CloudDownloadOutlined />} iconPosition="top">
        {t('icon.download')}
      </Button>
      <Button icon={<CloudDownloadOutlined />} iconPosition="bottom">
        {t('icon.download')}
      </Button>
    </Space>
  );
};
