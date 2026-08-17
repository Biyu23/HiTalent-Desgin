/**
 * description: Modal 与 Drawer 共用同一套全局 Dock；它们可以停靠在同一方位并独立恢复或关闭。
 */
import { Alert, Button, Flex, Space, Tag, Typography } from 'antd';
import { Drawer, Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    openBoth: '打开全部窗口',
    openModal: '仅打开 Modal',
    openDrawer: '仅打开 Drawer',
    minimizeBoth: '全部最小化到 Dock',
    modalTitle: '审批任务弹窗',
    drawerTitle: '文档协作抽屉',
    modalContent:
      '这是一个 Modal 任务窗口。点击右上角最小化按钮，它会进入全局 Dock。',
    drawerContent:
      '这是一个 Drawer 抽屉窗口。它与 Modal 共享右下角同一个全局 Dock，多卡片会自动堆叠与排列。',
    sharedHint:
      'Modal 与 Drawer 共用同一套全局 Dock 体系，支持各自独立拖动、恢复与关闭。',
  },
  'en-US': {
    openBoth: 'Open Both Windows',
    openModal: 'Open Modal Only',
    openDrawer: 'Open Drawer Only',
    minimizeBoth: 'Minimize Both to Dock',
    modalTitle: 'Approval Task Modal',
    drawerTitle: 'Document Collaboration Drawer',
    modalContent:
      'This is a Modal task window. Click its top-right minimize button to send it to the global Dock.',
    drawerContent:
      'This is a Drawer window. It shares the same global Dock with Modal; cards stack and order automatically.',
    sharedHint:
      'Modals and Drawers share the same global Dock system with independent dragging, restoring, and closing.',
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

  const minimizeBoth = () => {
    setModalOpen(true);
    setDrawerOpen(true);
    setModalMinimized(true);
    setDrawerMinimized(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMinimized(false);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
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
        <Button onClick={minimizeBoth}>{t('minimizeBoth')}</Button>
      </Flex>

      <Modal
        title={t('modalTitle')}
        open={modalOpen}
        minimizable
        minimized={modalMinimized}
        onMinimizeChange={setModalMinimized}
        onCancel={closeModal}
        onOk={closeModal}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('sharedHint')} />
          <Typography.Paragraph>{t('modalContent')}</Typography.Paragraph>
          <Tag color="blue">Modal Task Active</Tag>
        </Space>
      </Modal>

      <Drawer
        title={t('drawerTitle')}
        open={drawerOpen}
        defaultSize={450}
        minimizable
        resizable
        minimized={drawerMinimized}
        onMinimizeChange={setDrawerMinimized}
        onClose={closeDrawer}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="success" showIcon message={t('sharedHint')} />
          <Typography.Paragraph>{t('drawerContent')}</Typography.Paragraph>
          <Tag color="green">Drawer Task Active</Tag>
        </Space>
      </Drawer>
    </Space>
  );
};
