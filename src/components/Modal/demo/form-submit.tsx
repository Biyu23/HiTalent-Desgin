/**
 * description: 结合 Ant Design 表单验证与 Modal 的 `confirmLoading` 属性，实现带校验的异步表单提交流程。弹窗关闭后自动重置表单状态，避免残留数据。
 */
import { Form, Input, message } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'form.open': '打开基础表单弹窗',
    'form.title': '新建用户',
    'form.username': '用户名',
    'form.usernameRequired': '请输入用户名',
    'form.usernamePlaceholder': '请输入...',
    'form.success': '用户 {username} 创建成功！',
  },
  'en-US': {
    'form.open': 'Open Form Modal',
    'form.title': 'Create User',
    'form.username': 'Username',
    'form.usernameRequired': 'Please enter a username',
    'form.usernamePlaceholder': 'Please enter...',
    'form.success': 'User {username} created successfully!',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        message.success(
          t('form.success').replace('{username}', values.username),
        );
        setLoading(false);
        setOpen(false);
        form.resetFields();
      }, 1500);
    } catch (error) {
      console.log('validation failed:', error);
    }
  };

  return (
    <>
      <a onClick={() => setOpen(true)}>{t('form.open')}</a>
      <Modal
        title={t('form.title')}
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
              label={t('form.username')}
              rules={[{ required: true, message: t('form.usernameRequired') }]}
            >
              <Input placeholder={t('form.usernamePlaceholder')} />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
