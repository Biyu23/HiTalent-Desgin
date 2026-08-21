import { Button, Modal } from 'hi-talent-design';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open semantic modal</Button>
      <Modal
        open={open}
        title="Semantic modal"
        minimizable
        resizable
        rootClassName="demo-modal-boundary"
        classNames={{ title: 'demo-modal-title', resizeHandle: 'demo-resize' }}
        styles={{
          root: { '--demo-modal-accent': '#1677ff' },
          title: { color: '#1677ff' },
          body: { minHeight: 160 },
          resizeHandle: { color: '#1677ff' },
        }}
        onCancel={() => setOpen(false)}
      >
        Every semantic slot has a stable target.
      </Modal>
    </>
  );
};
