/**
 * description: Modal 与 Drawer 共用同一套全局 Dock；它们可以停靠在同一方位并独立恢复或关闭。
 */
import { Button, Space } from 'antd';
import { Drawer, Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开两个窗口',
    minimize: '同时最小化',
    modalTitle: '弹窗任务',
    drawerTitle: '抽屉任务',
    modalContent: '这是 Modal 中的任务。',
    drawerContent: '这是 Drawer 中的任务。',
  },
  'en-US': {
    open: 'Open Both',
    minimize: 'Minimize Both',
    modalTitle: 'Modal Task',
    drawerTitle: 'Drawer Task',
    modalContent: 'This task is in a Modal.',
    drawerContent: 'This task is in a Drawer.',
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
  };
  const minimizeBoth = () => {
    openBoth();
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
    <>
      <Space wrap>
        <Button type="primary" onClick={openBoth}>
          {t('open')}
        </Button>
        <Button onClick={minimizeBoth}>{t('minimize')}</Button>
      </Space>
      <Modal
        title={t('modalTitle')}
        open={modalOpen}
        minimizable
        minimized={modalMinimized}
        onMinimizeChange={setModalMinimized}
        onCancel={closeModal}
        onOk={closeModal}
      >
        {t('modalContent')}
      </Modal>
      <Drawer
        title={t('drawerTitle')}
        open={drawerOpen}
        minimizable
        minimized={drawerMinimized}
        onMinimizeChange={setDrawerMinimized}
        onClose={closeDrawer}
      >
        {t('drawerContent')}
      </Drawer>
    </>
  );
};
