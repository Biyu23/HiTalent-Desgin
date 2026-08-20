import { Button, Space, Switch } from 'antd';
import type { ModalRef } from 'hi-talent-design';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开受控弹窗',
    title: '受控状态与 Ref 控制',
    content: '可通过外部开关或 Ref 实例方法控制弹窗的最小化与最大化状态。',
    minimizedLabel: '受控最小化 (minimized)',
    maximizedLabel: '受控最大化 (maximized)',
    refMinimize: 'Ref 最小化',
    refMaximize: 'Ref 最大化',
    refRestore: 'Ref 还原',
  },
  'en-US': {
    open: 'Open Controlled Modal',
    title: 'Controlled State & Ref Control',
    content:
      'Control minimize and maximize states via external switches or Ref imperative methods.',
    minimizedLabel: 'Controlled Minimized',
    maximizedLabel: 'Controlled Maximized',
    refMinimize: 'Ref Minimize',
    refMaximize: 'Ref Maximize',
    refRestore: 'Ref Restore',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  return (
    <Space direction="vertical" size="middle">
      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Space align="center">
          <span>{t('minimizedLabel')}:</span>
          <Switch
            disabled={!open}
            checked={minimized}
            onChange={(checked) => {
              setMinimized(checked);
              if (checked) setMaximized(false);
            }}
          />
        </Space>
        <Space align="center">
          <span>{t('maximizedLabel')}:</span>
          <Switch
            disabled={!open}
            checked={maximized}
            onChange={(checked) => {
              setMaximized(checked);
              if (checked) setMinimized(false);
            }}
          />
        </Space>
      </Space>

      <Space wrap>
        <Button disabled={!open} onClick={() => modalRef.current?.minimize()}>
          {t('refMinimize')}
        </Button>
        <Button disabled={!open} onClick={() => modalRef.current?.maximize()}>
          {t('refMaximize')}
        </Button>
        <Button disabled={!open} onClick={() => modalRef.current?.restore()}>
          {t('refRestore')}
        </Button>
      </Space>

      <Modal
        ref={modalRef}
        title={t('title')}
        open={open}
        draggable
        resizable
        minimizable
        maximizable
        minimized={minimized}
        maximized={maximized}
        onMinimizeChange={setMinimized}
        onMaximizedChange={setMaximized}
        onCancel={() => {
          setOpen(false);
          setMinimized(false);
          setMaximized(false);
        }}
        onOk={() => setOpen(false)}
      >
        <p>{t('content')}</p>
      </Modal>
    </Space>
  );
};
