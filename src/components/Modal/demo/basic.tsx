/**
 * description: 综合演示 Modal 增强能力：**拖拽移动**、**双击标题栏最大化**、**右下角自由缩放**、**最小化至全局 Dock（保留输入状态）**、**命令式 Ref 操作** 与 **静态 destroyAll 销毁**。
 */
import { Button, Form, Input, Select, Space, Tag, Typography } from 'antd';
import type { ModalRef } from 'hi-talent-design';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const { Text } = Typography;

const messages = {
  'zh-CN': {
    'demo.open': '打开高级窗口',
    'demo.btn.minimize': 'Ref 最小化',
    'demo.btn.maximize': 'Ref 最大化',
    'demo.btn.reset': 'Ref 重置位置与尺寸',
    'demo.btn.destroyAll': 'Modal.destroyAll()',
    'demo.title': '多功能任务办理窗口',
    'demo.submit': '确认提交',
    'demo.cancel': '关闭',
    'demo.tipsTitle': '交互特性说明：',
    'demo.tip1':
      '拖拽标题栏或底部空白区域移动窗口，双击标题栏快速最大化/还原。',
    'demo.tip2': '拖动右下角把手自由缩放尺寸。',
    'demo.tip3':
      '点击最小化折叠到全局 Dock 悬浮窗，表单输入内容与滚动位置完全保留。',
    'demo.taskName': '任务标题',
    'demo.taskNamePlaceholder': '输入内容后测试最小化与恢复...',
    'demo.assignee': '指派处理人',
    'demo.assigneePlaceholder': '请选择',
    'demo.user1': '张三 (前端架构)',
    'demo.user2': '李四 (系统设计)',
    'demo.priority': '优先级',
    'demo.urgent': '紧急',
    'demo.normal': '普通',
    'demo.remark': '业务详情',
    'demo.remarkPlaceholder': '输入详细工作流信息...',
  },
  'en-US': {
    'demo.open': 'Open Enhanced Window',
    'demo.btn.minimize': 'Ref Minimize',
    'demo.btn.maximize': 'Ref Maximize',
    'demo.btn.reset': 'Ref Reset Position & Size',
    'demo.btn.destroyAll': 'Modal.destroyAll()',
    'demo.title': 'Multi-function Task Window',
    'demo.submit': 'Submit',
    'demo.cancel': 'Close',
    'demo.tipsTitle': 'Interactive Features:',
    'demo.tip1':
      'Drag title bar/footer to move window, double-click title bar to toggle maximize.',
    'demo.tip2': 'Drag the bottom-right handle to resize freely.',
    'demo.tip3':
      'Minimize to global Dock floating card — all input values and scroll states are preserved.',
    'demo.taskName': 'Task Title',
    'demo.taskNamePlaceholder': 'Type text, then test minimize & restore...',
    'demo.assignee': 'Assignee',
    'demo.assigneePlaceholder': 'Select assignee',
    'demo.user1': 'Zhang San (Frontend)',
    'demo.user2': 'Li Si (System Architect)',
    'demo.priority': 'Priority',
    'demo.urgent': 'Urgent',
    'demo.normal': 'Normal',
    'demo.remark': 'Details',
    'demo.remarkPlaceholder': 'Enter detailed workflow information...',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const modalRef = useRef<ModalRef>(null);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('demo.open')}
        </Button>
        <Button
          disabled={!open}
          onClick={() => {
            modalRef.current?.minimize();
          }}
        >
          {t('demo.btn.minimize')}
        </Button>
        <Button
          disabled={!open}
          onClick={() => {
            modalRef.current?.maximize();
          }}
        >
          {t('demo.btn.maximize')}
        </Button>
        <Button
          disabled={!open}
          onClick={() => {
            modalRef.current?.resetPosition?.();
            modalRef.current?.resetSize?.();
          }}
        >
          {t('demo.btn.reset')}
        </Button>
        <Button danger onClick={() => Modal.destroyAll()}>
          {t('demo.btn.destroyAll')}
        </Button>
      </Space>

      <Modal
        ref={modalRef}
        title={t('demo.title')}
        open={open}
        width={560}
        draggable
        resizable={{ minWidth: 420, minHeight: 280 }}
        maximizable
        minimizable
        minimizePosition="bottom-right"
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        okText={t('demo.submit')}
        cancelText={t('demo.cancel')}
      >
        <div style={{ padding: '8px 0' }}>
          <div
            style={{
              padding: '10px 14px',
              marginBottom: 16,
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 6,
              border: '1px dashed #d9d9d9',
            }}
          >
            <Text strong style={{ display: 'block', marginBottom: 4 }}>
              💡 {t('demo.tipsTitle')}
            </Text>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
              <li>{t('demo.tip1')}</li>
              <li>{t('demo.tip2')}</li>
              <li>{t('demo.tip3')}</li>
            </ul>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{ priority: 'normal' }}
          >
            <Form.Item name="taskName" label={t('demo.taskName')}>
              <Input placeholder={t('demo.taskNamePlaceholder')} />
            </Form.Item>

            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="assignee"
                label={t('demo.assignee')}
                style={{ width: 240 }}
              >
                <Select placeholder={t('demo.assigneePlaceholder')}>
                  <Select.Option value="user1">{t('demo.user1')}</Select.Option>
                  <Select.Option value="user2">{t('demo.user2')}</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="priority"
                label={t('demo.priority')}
                style={{ width: 240 }}
              >
                <Select>
                  <Select.Option value="urgent">
                    <Tag color="error">{t('demo.urgent')}</Tag>
                  </Select.Option>
                  <Select.Option value="normal">
                    <Tag color="blue">{t('demo.normal')}</Tag>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item name="remark" label={t('demo.remark')}>
              <Input.TextArea
                rows={3}
                placeholder={t('demo.remarkPlaceholder')}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </Space>
  );
};
