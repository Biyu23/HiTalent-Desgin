/**
 * title: 多开与自动排列测试
 * description: 连续打开多个弹窗并全部最小化。底层基于 Flex 布局的单例容器会自动将悬浮窗整齐排布，绝不重叠。同时也支持把悬浮窗单独拖拽出来。
 */
import { Button, Space } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'multi.hint':
      '疯狂点击下方按钮打开 3-5 个弹窗，然后把它们全部最小化，看看角落会不会重叠！',
    'multi.open': '新开一个任务弹窗',
    'multi.ticket': '业务工单',
    'multi.heading': '这是您开启的第 {index} 个窗口',
    'multi.desc':
      '尝试把它最小化。因为底层使用了统一的 Flex 容器，多个最小化卡片会自动从下往上像搭积木一样堆叠。',
  },
  'en-US': {
    'multi.hint':
      'Click the button below to open 3-5 windows, then minimize them all — see the corner for flawless auto-arrangement!',
    'multi.open': 'Open New Task Modal',
    'multi.ticket': 'Business Ticket',
    'multi.heading': 'This is window #{index}',
    'multi.desc':
      'Try minimizing it. Because all minimized cards share a single Flex container, they auto-stack from bottom to top — no overlaps.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [modals, setModals] = useState<{ id: number; title: string }[]>([]);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const handleOpenNew = () => {
    const newId = Date.now();
    const newTitle = `${t('multi.ticket')} - ${Math.floor(
      Math.random() * 10000,
    )}`;
    setModals((prev) => [...prev, { id: newId, title: newTitle }]);
    setOpenMap((prev) => ({ ...prev, [newId]: true }));
  };

  const handleClose = (id: number) =>
    setOpenMap((prev) => ({ ...prev, [id]: false }));

  return (
    <Space direction="vertical" size="large">
      <div style={{ color: '#666', fontSize: 13 }}>
        👉 <b>{t('multi.hint')}</b>
      </div>
      <Button type="primary" onClick={handleOpenNew}>
        {t('multi.open')}
      </Button>
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          title={`${modal.title} (${t('multi.heading').replace(
            '{index}',
            String(index + 1),
          )})`}
          open={openMap[modal.id]}
          draggable
          maximizable
          minimizable
          minimizePosition="bottom-right"
          onCancel={() => handleClose(modal.id)}
          onOk={() => handleClose(modal.id)}
        >
          <div style={{ padding: '20px 0', minHeight: 150 }}>
            <h3>{t('multi.heading').replace('{index}', String(index + 1))}</h3>
            <p style={{ color: '#999' }}>ID: {modal.id}</p>
            <p>{t('multi.desc')}</p>
          </div>
        </Modal>
      ))}
    </Space>
  );
};
