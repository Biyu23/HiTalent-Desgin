/**
 * title: icon展示位置
 * description: 默认 `iconPosition`为`left`, 可以设置四个方向`left`|`right`|`top`|`bottom`的图标位置。
 */
import { CloudDownloadOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { ProButton } from 'myui';
import React from 'react';

export default () => {
  return (
    <Space align="center" size="large">
      <ProButton icon={<CloudDownloadOutlined />} iconPosition="left">
        下载
      </ProButton>
      <ProButton icon={<CloudDownloadOutlined />} iconPosition="right">
        下载
      </ProButton>
      <ProButton icon={<CloudDownloadOutlined />} iconPosition="top">
        下载
      </ProButton>
      <ProButton icon={<CloudDownloadOutlined />} iconPosition="bottom">
        下载
      </ProButton>
    </Space>
  );
};
