import { ResponsiveButtonGroup } from 'hi-talent-design';
import React from 'react';

const items = Array.from({ length: 8 }, (_, index) => ({
  key: `action-${index + 1}`,
  label: `Action ${index + 1}`,
  priority: index,
}));

export default () => (
  <div style={{ width: 420 }}>
    <ResponsiveButtonGroup
      items={items}
      rootClassName="demo-actions-boundary"
      classNames={{ popup: 'demo-actions-popup' }}
      styles={{
        root: { padding: 8, border: '1px solid #d9d9d9' },
        visible: { justifyContent: 'flex-end' },
        overflowTrigger: { color: '#1677ff' },
      }}
    />
  </div>
);
