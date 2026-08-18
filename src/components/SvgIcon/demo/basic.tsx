import { Space } from 'antd';
import { SvgIcon } from 'hi-talent-design';
import React from 'react';

export default () => {
  return (
    <Space size="large">
      {/* 即使 SVG 自带 width="36px" height="18px" 也会被自动抹平为 1em */}
      <SvgIcon size={24} color="#1890ff">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 0 24 24"
          width="16px"
          fill="rgba(0, 0, 0, 0.65)"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </SvgIcon>

      {/* 缺少 viewBox 的 SVG 会被自动推导补全 */}
      <SvgIcon size={28} color="#52c41a">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 0 24 24"
          width="16px"
          fill="rgba(0, 0, 0, 0.65)"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </SvgIcon>

      {/* 尺寸 36px */}
      <SvgIcon size={36} color="#722ed1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 0 24 24"
          width="16px"
          fill="rgba(0, 0, 0, 0.65)"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      </SvgIcon>
    </Space>
  );
};
