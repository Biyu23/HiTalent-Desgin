/**
 * title: 命令式控制（Ref API）
 * description: 通过 `useRef<ModalRef>` 获取 Modal 实例，在组件外部调用 `minimize()`、`restore()`、`maximize()`、`unmaximize()` 方法，实现灵活的程序化窗口管理。
 */
import { Button, Space } from 'antd';
import { Modal, ModalRef } from 'myui';
import React, { useRef, useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  return (
    <div>
      <p style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
        💡 以下按钮通过 <code>ref</code> 直接操控弹窗，无需维护额外状态变量。
      </p>

      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          打开弹窗
        </Button>
        <Button onClick={() => modalRef.current?.minimize()}>最小化</Button>
        <Button onClick={() => modalRef.current?.restore()}>恢复</Button>
        <Button onClick={() => modalRef.current?.maximize()}>最大化</Button>
        <Button onClick={() => modalRef.current?.unmaximize()}>
          取消最大化
        </Button>
      </Space>

      <Modal
        ref={modalRef}
        title="命令式控制示例"
        open={open}
        minimizable
        maximizable
        draggable
        onCancel={() => setOpen(false)}
      >
        <div style={{ padding: '12px 0', minHeight: 120 }}>
          <p>你可以通过页面上方的按钮，或弹窗标题栏的图标来操控这个窗口。</p>
          <ul style={{ color: '#666', paddingLeft: 20 }}>
            <li>
              点击 <strong>最小化</strong> → 弹窗缩小至右下角浮窗
            </li>
            <li>
              点击 <strong>恢复</strong> → 浮窗还原为正常弹窗
            </li>
            <li>
              点击 <strong>最大化</strong> → 全屏沉浸式展示
            </li>
            <li>
              点击 <strong>取消最大化</strong> → 还原为普通尺寸
            </li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};
