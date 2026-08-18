import { Card, Space } from 'antd';
import { createSvgIcon } from 'hi-talent-design';
import React from 'react';

// 使用 createSvgIcon 快速将 SVG 导出为 Antd 标准组件
export const BellIcon = createSvgIcon(
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>,
  { color: '#1677ff' },
);

export const StarIcon = createSvgIcon(
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>,
  { color: '#faad14' },
);

export default () => {
  return (
    <Card size="small" title="组件化复用">
      <Space size="middle">
        <BellIcon size={20} />
        <BellIcon size={28} />
        <StarIcon size={24} />
        <StarIcon size={32} />
      </Space>
    </Card>
  );
};
