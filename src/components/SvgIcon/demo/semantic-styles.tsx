import { SvgIcon } from 'hi-talent-design';
import React from 'react';

export default () => (
  <SvgIcon
    className="demo-icon-boundary"
    style={{ padding: 8, color: '#1677ff' }}
  >
    <svg
      className="demo-icon-svg"
      style={{ strokeWidth: 1.5 }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  </SvgIcon>
);
