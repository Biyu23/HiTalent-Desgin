import { SvgIcon } from 'hi-talent-design';
import { Space } from 'antd';
import React from 'react';

export default () => {
  return (
    <Space size="large">
      {/* 即使 SVG 自带 width="36px" height="18px" 也会被自动抹平为 1em */}
      <SvgIcon size={24} color="#1890ff">
        <svg
          width="36px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </SvgIcon>

      {/* 缺少 viewBox 的 SVG 会被自动推导补全 */}
      <SvgIcon size={28} color="#52c41a">
        <svg width="24" height="24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </SvgIcon>

      {/* 尺寸 36px */}
      <SvgIcon size={36} color="#722ed1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </SvgIcon>
    </Space>
  );
};
