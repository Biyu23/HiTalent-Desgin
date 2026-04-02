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
