import { Alert, Button, Flex, Space, Typography } from 'antd';
import { Drawer, Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    openBoth: '打开全部窗口',
    openModal: '打开 Modal',
    openDrawer: '打开 Drawer',
    modalTitle: '审批弹窗',
    drawerTitle: '详情抽屉',
    modalContent: '这是一个可最小化的 Modal。',
    drawerContent: '这是一个可最小化的 Drawer，与 Modal 共享全局 Dock。',
    sharedHint: 'Modal 与 Drawer 共用同一全局 Dock，支持独立停靠、恢复与关闭。',
  },
  'en-US': {
    openBoth: 'Open Both',
    openModal: 'Open Modal',
    openDrawer: 'Open Drawer',
    modalTitle: 'Approval Modal',
    drawerTitle: 'Details Drawer',
    modalContent: 'This is a minimizable Modal.',
    drawerContent:
      'This is a minimizable Drawer, sharing the same global Dock.',
    sharedHint:
      'Modal and Drawer share the unified global Dock with independent restore and close.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalMinimized, setModalMinimized] = useState(false);
  const [drawerMinimized, setDrawerMinimized] = useState(false);

  const openBoth = () => {
    setModalOpen(true);
    setDrawerOpen(true);
    setModalMinimized(false);
    setDrawerMinimized(false);
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={8} wrap="wrap">
        <Button type="primary" onClick={openBoth}>
          {t('openBoth')}
        </Button>
        <Button
          onClick={() => {
            setModalOpen(true);
            setModalMinimized(false);
          }}
        >
          {t('openModal')}
        </Button>
        <Button
          onClick={() => {
            setDrawerOpen(true);
            setDrawerMinimized(false);
          }}
        >
          {t('openDrawer')}
        </Button>
      </Flex>

      <Modal
        title={t('modalTitle')}
        open={modalOpen}
        minimizable
        minimized={modalMinimized}
        onMinimizeChange={setModalMinimized}
        onCancel={() => {
          setModalOpen(false);
          setModalMinimized(false);
        }}
        onOk={() => {
          setModalOpen(false);
          setModalMinimized(false);
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('sharedHint')} />
          <Typography.Paragraph>{t('modalContent')}</Typography.Paragraph>
        </Space>
      </Modal>

      <Drawer
        title={t('drawerTitle')}
        open={drawerOpen}
        defaultSize={420}
        minimizable
        resizable
        minimized={drawerMinimized}
        onMinimizeChange={setDrawerMinimized}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerMinimized(false);
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="success" showIcon message={t('sharedHint')} />
          <Typography.Paragraph>{t('drawerContent')}</Typography.Paragraph>
        </Space>
      </Drawer>
    </Space>
  );
};
