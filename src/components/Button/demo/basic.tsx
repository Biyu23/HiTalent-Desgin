/**
 * title: 基础用法
 * description: 继承 Ant Design Button 全部原生属性，支持多种类型（primary、dashed、text、link）、状态（danger、disabled）和尺寸（small、middle、large），可搭配图标使用。
 */
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Flex, Space } from 'antd';
import { Button } from 'myui';
import React from 'react';

export default () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 按钮类型 */}
      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>按钮类型</p>
        <Flex gap={8} wrap>
          <Button type="primary">Primary 主按钮</Button>
          <Button>Default 默认</Button>
          <Button type="dashed">Dashed 虚线</Button>
          <Button type="text">Text 文本</Button>
          <Button type="link">Link 链接</Button>
        </Flex>
      </div>

      {/* 危险状态 */}
      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>危险状态</p>
        <Flex gap={8} wrap>
          <Button type="primary" danger>
            删除
          </Button>
          <Button danger>取消发布</Button>
          <Button type="text" danger>
            移除
          </Button>
        </Flex>
      </div>

      {/* 按钮尺寸 */}
      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>按钮尺寸</p>
        <Flex gap={8} align="center" wrap>
          <Button type="primary" size="small">
            小号
          </Button>
          <Button type="primary">中号（默认）</Button>
          <Button type="primary" size="large">
            大号
          </Button>
        </Flex>
      </div>

      {/* 禁用状态 + 图标 */}
      <div>
        <p style={{ marginBottom: 8, color: '#999', fontSize: 13 }}>
          禁用状态与图标
        </p>
        <Flex gap={8} wrap>
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button icon={<DownloadOutlined />}>下载</Button>
          <Button type="primary" disabled>
            禁用态
          </Button>
          <Button disabled icon={<DownloadOutlined />}>
            禁用含图标
          </Button>
        </Flex>
      </div>
    </Space>
  );
};
