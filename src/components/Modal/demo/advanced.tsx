/**
 * description: 开启 `minimizable`、`maximizable` 和 `draggable` 后，即可获得桌面级的窗口体验。当点击最小化时，弹窗会被挂起到全局角落，此时你在弹窗内填写的表单数据会完美保留，随时可以点击恢复。
 */
import { Form, Input, Select, Space } from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'advanced.open': '打开高级任务办理窗口',
    'advanced.title': '新建复杂业务工单',
    'advanced.submit': '提交工单',
    'advanced.desc':
      '在下方输入框随便写点内容，然后点击右上角的 "减号" 进行最小化。你会发现你可以继续操作页面其他元素。再次点击悬浮窗的 "放大" 图标恢复弹窗，刚刚填写的数据一点都没丢！',
    'advanced.taskName': '任务名称',
    'advanced.taskNameRequired': '请输入任务名称',
    'advanced.taskNamePlaceholder': '例如：2026年Q2架构升级计划',
    'advanced.assignee': '经办人',
    'advanced.assigneePlaceholder': '请选择处理人',
    'advanced.priority': '优先级',
    'advanced.priorityPlaceholder': '请选择',
    'advanced.remark': '详细描述',
    'advanced.remarkPlaceholder': '任务背景、目标及排期等详细信息...',
    'advanced.zhangsan': '张三 (前端)',
    'advanced.lisi': '李四 (后端)',
    'advanced.urgent': '紧急',
    'advanced.normal': '普通',
  },
  'en-US': {
    'advanced.open': 'Open Advanced Task Window',
    'advanced.title': 'Create Complex Business Ticket',
    'advanced.submit': 'Submit Ticket',
    'advanced.desc':
      'Type anything in the fields below, then click the "minus" icon to minimize. You can continue working on other page elements. Click the "expand" icon on the floating card to restore — all your data is perfectly preserved!',
    'advanced.taskName': 'Task Name',
    'advanced.taskNameRequired': 'Please enter task name',
    'advanced.taskNamePlaceholder': 'e.g. Q2 2026 Architecture Upgrade Plan',
    'advanced.assignee': 'Assignee',
    'advanced.assigneePlaceholder': 'Select assignee',
    'advanced.priority': 'Priority',
    'advanced.priorityPlaceholder': 'Select',
    'advanced.remark': 'Description',
    'advanced.remarkPlaceholder':
      'Task background, objectives, and timeline details...',
    'advanced.zhangsan': 'Zhang San (Frontend)',
    'advanced.lisi': 'Li Si (Backend)',
    'advanced.urgent': 'Urgent',
    'advanced.normal': 'Normal',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <a onClick={() => setOpen(true)}>{t('advanced.open')}</a>
      <Modal
        title={t('advanced.title')}
        width={600}
        open={open}
        draggable
        maximizable
        minimizable
        minimizePosition="bottom-right"
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={() => setOpen(false)}
        okText={t('advanced.submit')}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16, color: '#666' }}>
            💡 <b>{t('advanced.desc')}</b>
          </div>
          <Form form={form} layout="vertical">
            <Form.Item
              name="taskName"
              label={t('advanced.taskName')}
              rules={[
                { required: true, message: t('advanced.taskNameRequired') },
              ]}
            >
              <Input placeholder={t('advanced.taskNamePlaceholder')} />
            </Form.Item>
            <Space style={{ width: '100%' }}>
              <Form.Item
                name="assignee"
                label={t('advanced.assignee')}
                style={{ width: 270 }}
              >
                <Select placeholder={t('advanced.assigneePlaceholder')}>
                  <Select.Option value="zhangsan">
                    {t('advanced.zhangsan')}
                  </Select.Option>
                  <Select.Option value="lisi">
                    {t('advanced.lisi')}
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="priority"
                label={t('advanced.priority')}
                style={{ width: 270 }}
              >
                <Select placeholder={t('advanced.priorityPlaceholder')}>
                  <Select.Option value="high">
                    {t('advanced.urgent')}
                  </Select.Option>
                  <Select.Option value="normal">
                    {t('advanced.normal')}
                  </Select.Option>
                </Select>
              </Form.Item>
            </Space>
            <Form.Item name="remark" label={t('advanced.remark')}>
              <Input.TextArea
                rows={4}
                placeholder={t('advanced.remarkPlaceholder')}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
