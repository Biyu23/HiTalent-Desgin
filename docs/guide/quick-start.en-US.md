---
title: Quick Start
toc: content
---

# Quick Start

## Use the first components

This example combines the enhanced Button, PopoverSelect, and Modal. Each component works independently, so you can introduce them progressively into an existing Ant Design application.

```tsx | pure
import { useState } from 'react';
import { Button, Modal, PopoverSelect } from 'hi-talent-design';

const roles = [
  { label: 'Frontend Engineer', value: 'frontend' },
  { label: 'Product Manager', value: 'product' },
  { label: 'Designer', value: 'design' },
];

export default () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>();

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        Create member
      </Button>
      <Modal
        title="Create member"
        open={open}
        draggable
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <PopoverSelect
          options={roles}
          value={role}
          onChange={(value) => setRole(value as string)}
          placeholder="Select a role"
        />
      </Modal>
    </>
  );
};
```

## Enable enhanced behavior

Business capabilities are added without removing native Ant Design props:

```tsx | pure
<Button autoLoading throttle={800} onClick={saveForm}>
  Save
</Button>

<Modal draggable maximizable minimizable resizable>
  A work window that can move, resize, and minimize
</Modal>
```

## Configure a global locale

Wrap the application once with ConfigProvider:

```tsx | pure
import { ConfigProvider, en_US } from 'hi-talent-design';

export default () => (
  <ConfigProvider locale={en_US}>
    <App />
  </ConfigProvider>
);
```

See [Global Configuration](/en-US/guide/global-config) for locale packages, scoped message overrides, and RTL.
