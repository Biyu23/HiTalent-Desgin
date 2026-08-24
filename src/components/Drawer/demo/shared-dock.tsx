import { Button, Flex, Space } from 'antd';
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
    modalContent: '可最小化的 Modal。',
    drawerContent: '可最小化的 Drawer，与 Modal 共享 Dock。',
  },
  'en-US': {
    openBoth: 'Open Both',
    openModal: 'Open Modal',
    openDrawer: 'Open Drawer',
    modalTitle: 'Approval Modal',
    drawerTitle: 'Details Drawer',
    modalContent: 'Minimizable Modal.',
    drawerContent: 'Minimizable Drawer, sharing Dock with Modal.',
  },
};

export default (): React.ReactElement => {
  const { t } = useDemoIntl(messages);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalMinimized, setModalMinimized] = useState(false);
  const [drawerMinimized, setDrawerMinimized] = useState(false);

  const openBoth = (): void => {
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
        <p>{t('modalContent')}</p>
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
        <p>{t('drawerContent')}</p>
      </Drawer>
    </Space>
  );
};
