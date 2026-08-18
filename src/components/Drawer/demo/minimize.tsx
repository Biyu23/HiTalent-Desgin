/**
 * description: Drawer 支持从标题栏最小化到全局 Dock，并通过 DrawerRef 在组件外部恢复。最小化期间输入内容和 resize 后的尺寸都会保留。
 */
import { Alert, Button, Flex, Form, Input, Select, Space, Tag } from 'antd';
import type { DrawerRef } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    minimize: '通过 Ref 最小化',
    restore: '通过 Ref 恢复',
    title: '客户跟进详情（可暂存）',
    extra: '编辑中',
    hint: '在下方输入内容或拖拽调整宽度，然后点击标题栏 ➖ 按钮或外部「最小化」按钮。最小化到右下角 Dock 恢复后，表单输入与尺寸均完整保留。',
    name: '客户名称',
    priority: '优先级',
    notes: '跟进纪要',
    placeholderNotes: '输入跟进沟通细节...',
    close: '取消',
    save: '暂存并关闭',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize via Ref',
    restore: 'Restore via Ref',
    title: 'Customer Follow-up (Stowable)',
    extra: 'Editing',
    hint: 'Enter data below or resize the drawer, then click the header ➖ button or the external "Minimize" button. Data and resized dimensions are preserved upon restore from the Dock.',
    name: 'Customer Name',
    priority: 'Priority',
    notes: 'Follow-up Notes',
    placeholderNotes: 'Enter discussion notes...',
    close: 'Cancel',
    save: 'Stow & Close',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<DrawerRef>(null);

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={8} wrap="wrap">
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('open')}
        </Button>
        <Button
          onClick={() => {
            setOpen(true);
            drawerRef.current?.minimize();
          }}
        >
          {t('minimize')}
        </Button>
        <Button
          onClick={() => {
            setOpen(true);
            drawerRef.current?.restore();
          }}
        >
          {t('restore')}
        </Button>
      </Flex>

      <Drawer
        ref={drawerRef}
        title={t('title')}
        extra={<Tag color="processing">{t('extra')}</Tag>}
        open={open}
        defaultSize={450}
        minimizable
        resizable
        onClose={() => setOpen(false)}
        destroyOnHidden
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => setOpen(false)}>{t('close')}</Button>
            <Button
              type="primary"
              onClick={() => {
                drawerRef.current?.minimize();
              }}
            >
              {t('save')}
            </Button>
          </Flex>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('hint')} />
          <Form
            layout="vertical"
            initialValues={{ customer: 'Acme Corp', priority: 'high' }}
          >
            <Form.Item label={t('name')} name="customer">
              <Input />
            </Form.Item>
            <Form.Item label={t('priority')} name="priority">
              <Select
                options={[
                  { label: 'High (高)', value: 'high' },
                  { label: 'Medium (中)', value: 'medium' },
                  { label: 'Low (低)', value: 'low' },
                ]}
              />
            </Form.Item>
            <Form.Item label={t('notes')} name="notes">
              <Input.TextArea rows={3} placeholder={t('placeholderNotes')} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </Space>
  );
};
