/**
 * title: 高级窗口管理 (最小化不销毁)
 * description: 开启 `minimizable`、`maximizable` 和 `draggable` 后，即可获得桌面级的窗口体验。当点击最小化时，弹窗会被挂起到全局角落，此时你在弹窗内填写的表单数据会完美保留，随时可以点击恢复。
 */
import { Form, Input, Select, Space } from 'antd';
import { ProModal } from 'myui';
import React, { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  return (
    <>
      <a onClick={() => setOpen(true)}>打开高级任务办理窗口</a>

      <ProModal
        title="新建复杂业务工单"
        width={600}
        open={open}
        draggable={true} // 允许拖拽
        maximizable={true} // 允许最大化
        minimizable={true} // 允许最小化
        minimizePosition="bottom-right" // 悬浮窗位置
        onCancel={() => {
          setOpen(false);
          form.resetFields(); // 彻底关闭时重置表单
        }}
        onOk={() => setOpen(false)}
        okText="提交工单"
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16, color: '#666' }}>
            💡 <b>测试玩法：</b> 在下方输入框随便写点内容，然后点击右上角的
            <b>“减号”</b>
            进行最小化。你会发现你可以继续操作页面其他元素。再次点击悬浮窗的
            <b>“放大”</b>图标恢复弹窗，刚刚填写的数据一点都没丢！
          </div>

          <Form form={form} layout="vertical">
            <Form.Item
              name="taskName"
              label="任务名称"
              rules={[{ required: true, message: '请输入任务名称' }]}
            >
              <Input placeholder="例如：2026年Q2架构升级计划" />
            </Form.Item>

            <Space style={{ width: '100%' }}>
              <Form.Item name="assignee" label="经办人" style={{ width: 270 }}>
                <Select placeholder="请选择处理人">
                  <Select.Option value="zhangsan">张三 (前端)</Select.Option>
                  <Select.Option value="lisi">李四 (后端)</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="priority" label="优先级" style={{ width: 270 }}>
                <Select placeholder="请选择">
                  <Select.Option value="high">紧急</Select.Option>
                  <Select.Option value="normal">普通</Select.Option>
                </Select>
              </Form.Item>
            </Space>

            <Form.Item name="remark" label="详细描述">
              <Input.TextArea
                rows={4}
                placeholder="任务背景、目标及排期等详细信息..."
              />
            </Form.Item>
          </Form>
        </div>
      </ProModal>
    </>
  );
};
