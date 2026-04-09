/**
 * title: 多开与自动排列测试
 * description: 连续打开多个弹窗并全部最小化。底层基于 Flex 布局的单例容器会自动将悬浮窗整齐排布，绝不重叠。同时也支持把悬浮窗单独拖拽出来。
 */
import { Button, Space } from 'antd';
import { ProModal } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [modals, setModals] = useState<{ id: number; title: string }[]>([]);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const handleOpenNew = () => {
    const newId = Date.now();
    const newTitle = `业务工单 - ${Math.floor(Math.random() * 10000)}`;
    setModals((prev) => [...prev, { id: newId, title: newTitle }]);
    setOpenMap((prev) => ({ ...prev, [newId]: true }));
  };

  const handleClose = (id: number) => {
    setOpenMap((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <Space direction="vertical" size="large">
      <div style={{ color: '#666', fontSize: 13 }}>
        👉 <b>测试玩法：</b>疯狂点击下方按钮打开 3-5
        个弹窗，然后把它们全部最小化，看看角落会不会重叠！
      </div>

      <Button type="primary" onClick={handleOpenNew}>
        新开一个任务弹窗
      </Button>

      {modals.map((modal, index) => (
        <ProModal
          key={modal.id}
          title={`${modal.title} (第${index + 1}个)`}
          open={openMap[modal.id]}
          draggable={true}
          maximizable={true}
          minimizable={true}
          minimizePosition="bottom-right"
          onCancel={() => handleClose(modal.id)}
          onOk={() => handleClose(modal.id)}
        >
          <div style={{ padding: '20px 0', minHeight: 150 }}>
            <h3>这是您开启的第 {index + 1} 个窗口</h3>
            <p style={{ color: '#999' }}>内部 ID: {modal.id}</p>
            <p>
              尝试把它最小化。因为底层使用了统一的 <code>Flex</code>{' '}
              容器，多个最小化卡片会自动从下往上像搭积木一样堆叠。
            </p>
          </div>
        </ProModal>
      ))}
    </Space>
  );
};
