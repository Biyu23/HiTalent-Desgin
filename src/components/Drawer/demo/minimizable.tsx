import { Alert, Button, Flex, Form, Input, Space } from 'antd';
import type { DrawerRef } from 'hi-talent-design';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    open: '打开抽屉',
    minimize: '通过 Ref 最小化',
    restore: '通过 Ref 恢复',
    title: '任务详情（支持暂存）',
    hint: '点击标题栏 ➖ 按钮或外部按钮最小化到右下角 Dock。恢复后表单输入和调整后的尺寸保持不变。',
    name: '任务名称',
    desc: '任务描述',
    close: '取消',
    submit: '确定',
  },
  'en-US': {
    open: 'Open Drawer',
    minimize: 'Minimize via Ref',
    restore: 'Restore via Ref',
    title: 'Task Details (Stowable)',
    hint: 'Click the header ➖ button or external button to minimize to Dock. Form inputs and resized dimensions are preserved upon restore.',
    name: 'Task Name',
    desc: 'Description',
    close: 'Cancel',
    submit: 'Submit',
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
        open={open}
        defaultSize={420}
        minimizable
        resizable
        onClose={() => setOpen(false)}
        footer={
          <Flex justify="flex-end" gap={8}>
            <Button onClick={() => setOpen(false)}>{t('close')}</Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              {t('submit')}
            </Button>
          </Flex>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert type="info" showIcon message={t('hint')} />
          <Form layout="vertical" initialValues={{ name: 'HiTalent Design' }}>
            <Form.Item label={t('name')} name="name">
              <Input />
            </Form.Item>
            <Form.Item label={t('desc')} name="desc">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Space>
      </Drawer>
    </Space>
  );
};
