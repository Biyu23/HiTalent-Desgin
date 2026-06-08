/**
 * title: 基础用法
 * description: 最简单的 Modal 使用方式：通过 `open` 控制显隐，`onCancel` 和 `onOk` 分别处理取消与确认操作。
 */
import { Button } from 'antd';
import { Modal } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        打开基础弹窗
      </Button>

      <Modal
        title="基础弹窗"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
        }}
      >
        <p>这是一个最简单的弹窗示例。</p>
        <p style={{ color: '#999' }}>
          完全兼容 Ant Design Modal 的所有原生属性，包括 footer
          自定义、居中显示、宽度等。
        </p>
      </Modal>
    </>
  );
};
