import { Input, message, Select, Space, Typography } from 'antd';
import type { NumberRangeValue } from 'hi-talent-design';
import { EditableField, NumberRangeInput } from 'hi-talent-design';
import React, { useState } from 'react';

export default () => {
  const [contact, setContact] = useState('张三');
  const [name, setName] = useState('产品经理');
  const [range, setRange] = useState<NumberRangeValue>([20, 40]);

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%', maxWidth: 520 }}
    >
      <Typography.Text type="secondary">
        移入字段显示编辑按钮；浮层编辑不会挤动下方内容。
      </Typography.Text>
      <EditableField
        value={contact}
        onChange={setContact}
        style={{ lineHeight: '36px' }}
        renderValue={(value) => (
          <>
            客户联系人　
            <a href="#contact" onClick={(event) => event.preventDefault()}>
              {value}
            </a>
          </>
        )}
        renderEditor={({ value, onChange, saving }) => (
          <Select
            autoFocus
            style={{ width: '100%' }}
            value={value}
            onChange={onChange}
            disabled={saving}
            options={['张三', '李四', '王五'].map((value) => ({
              value,
              label: value,
            }))}
          />
        )}
      />
      <EditableField
        value={name}
        onChange={setName}
        style={{ lineHeight: '36px' }}
        renderValue={(value) => <>职位名称　{value || '未填写'}</>}
        renderEditor={({ value, onChange, saving }) => (
          <Input
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={saving}
          />
        )}
        onSave={async (value) => {
          // 业务自行校验。async 中抛错等同于返回 Promise.reject，保留编辑状态。
          if (!value.trim()) {
            message.error('请输入职位名称');
            throw new Error('请输入职位名称');
          }
          // 等待保存成功后 resolve，组件才更新值并退出编辑。
          await new Promise((resolve) => {
            setTimeout(resolve, 600);
          });
        }}
      />
      <EditableField
        mode="inline"
        value={range}
        onChange={setRange}
        actionVisibility="always"
        style={{ lineHeight: '36px' }}
        renderValue={([min, max]) => (
          <>
            薪资范围　{min ?? '不限'} — {max ?? '不限'} 万
          </>
        )}
        renderEditor={({ value, onChange, saving }) => (
          <NumberRangeInput
            value={value}
            onChange={onChange}
            min={0}
            disabled={saving}
          />
        )}
      />
      <EditableField
        disabled
        value="仅查看"
        onChange={() => {}}
        renderValue={(value) => <>权限示例　{value}</>}
        renderEditor={({ value }) => <Input value={value} />}
      />
    </Space>
  );
};
