/**
 * title: 基础用法与异步提交
 * description: 结合 Ant Design 的表单和按钮，实现带 Loading 状态的异步提交。弹窗关闭后会自动重置状态。
 */
import { Form, Input, message } from 'antd';
import { Modal } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // 模拟网络请求
      setTimeout(() => {
        message.success(`用户 ${values.username} 创建成功！`);
        setLoading(false);
        setOpen(false);
        form.resetFields();
      }, 1500);
    } catch (error) {
      console.log('校验失败:', error);
    }
  };

  return (
    <>
      <a onClick={() => setOpen(true)}>打开基础表单弹窗</a>
      <Modal
        title="新建用户"
        open={open}
        confirmLoading={loading}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={handleOk}
      >
        <div style={{ paddingTop: 16 }}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入..." />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
