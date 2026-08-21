import {
  ConfigProvider,
  Drawer,
  PopoverSelect,
  ResponsiveButtonGroup,
  Table,
} from 'hi-talent-design';
import React from 'react';

const options = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' },
];

export default () => (
  <ConfigProvider prefixCls="brand" antdPrefixCls="acme">
    <div style={{ display: 'grid', gap: 16 }}>
      <PopoverSelect options={options} placeholder="Custom prefixes" />
      <ResponsiveButtonGroup
        mode="expanded"
        items={options.map((option) => ({
          key: option.value,
          label: option.label,
        }))}
      />
      <Table
        columns={[
          { id: 'label', title: 'Label', dataIndex: 'label', width: 160 },
        ]}
        dataSource={options.map((option) => ({
          key: option.value,
          label: option.label,
        }))}
      />
      <Drawer
        open
        minimized
        minimizable
        title="Custom-prefix dock"
        onClose={() => undefined}
      >
        The minimized portal inherits both configured prefixes.
      </Drawer>
    </div>
  </ConfigProvider>
);
