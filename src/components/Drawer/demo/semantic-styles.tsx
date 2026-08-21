import { Button, Drawer } from 'hi-talent-design';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open semantic drawer</Button>
      <Drawer
        open={open}
        title="Semantic drawer"
        minimizable
        resizable
        rootClassName="demo-drawer-boundary"
        classNames={{
          header: 'demo-drawer-header',
          body: 'demo-drawer-body',
          dragger: 'demo-drawer-dragger',
          minimizedDock: 'demo-drawer-dock',
        }}
        styles={{
          header: { borderBottomColor: '#91caff' },
          body: { background: '#f5faff' },
          dragger: { color: '#1677ff' },
          minimizedDock: { borderColor: '#1677ff' },
        }}
        onClose={() => setOpen(false)}
      >
        Header, body, resize handle, and minimized dock expose stable slots.
      </Drawer>
    </>
  );
};
