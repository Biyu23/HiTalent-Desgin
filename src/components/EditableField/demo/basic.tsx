import { Button, Form, Input, Select, Space, Typography } from 'antd';
import type {
  EditableFieldEditorContext,
  NumberRangeValue,
} from 'hi-talent-design';
import { EditableField, NumberRangeInput } from 'hi-talent-design';
import React, { useState } from 'react';

/** 草稿和校验属于编辑器；只有确认时才通知外部。 */
function NameEditor({
  value,
  submit,
  cancel,
}: EditableFieldEditorContext<string>) {
  const [draft, setDraft] = useState(value ?? '');
  const [error, setError] = useState('');
  const save = () => {
    if (!draft.trim()) {
      setError('请输入名称');
      return;
    }
    submit(draft.trim());
  };
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        autoFocus
        value={draft}
        status={error ? 'error' : undefined}
        onChange={(event) => {
          setDraft(event.target.value);
          setError('');
        }}
        onPressEnter={save}
      />
      {error && <Typography.Text type="danger">{error}</Typography.Text>}
      <Space>
        <Button onClick={cancel}>取消</Button>
        <Button type="primary" onClick={save}>
          保存
        </Button>
      </Space>
    </Space>
  );
}

function ContactEditor({
  value,
  submit,
  cancel,
}: EditableFieldEditorContext<string>) {
  const [draft, setDraft] = useState(value ?? '张三');
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Select
        autoFocus
        style={{ width: '100%' }}
        value={draft}
        onChange={setDraft}
        options={['张三', '李四', '王五'].map((name) => ({
          label: name,
          value: name,
        }))}
      />
      <Space>
        <Button onClick={cancel}>取消</Button>
        <Button type="primary" onClick={() => submit(draft)}>
          确认联系人
        </Button>
      </Space>
    </Space>
  );
}

function RangeEditor({
  value,
  submit,
  cancel,
}: EditableFieldEditorContext<NumberRangeValue>) {
  const [draft, setDraft] = useState<NumberRangeValue>(value ?? [null, null]);
  return (
    <Space direction="vertical">
      <NumberRangeInput value={draft} onChange={setDraft} min={0} />
      <Space>
        <Button onClick={cancel}>取消</Button>
        <Button type="primary" onClick={() => submit(draft)}>
          确认范围
        </Button>
      </Space>
    </Space>
  );
}

export default () => {
  const [contact, setContact] = useState('张三');
  const [name, setName] = useState('产品经理');
  const [range, setRange] = useState<NumberRangeValue>([20, 40]);
  const [form] = Form.useForm();
  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%', maxWidth: 520 }}
    >
      <Typography.Text type="secondary">
        输入由编辑器管理，只有点击保存才更新展示值；取消会丢弃草稿。
      </Typography.Text>
      <EditableField
        value={contact}
        onChange={setContact}
        style={{ lineHeight: '36px' }}
        renderValue={(value) => <>悬停编辑联系人　{value}</>}
      >
        {(context) => <ContactEditor {...context} />}
      </EditableField>
      <EditableField
        mode="inline"
        value={range}
        onChange={setRange}
        actionVisibility="always"
        style={{ lineHeight: '36px' }}
        renderAction={({ onClick }) => (
          <Button size="small" onClick={onClick}>
            调整
          </Button>
        )}
        renderValue={(value) => (
          <>
            薪资范围　{value?.[0] ?? '不限'} — {value?.[1] ?? '不限'} 万
          </>
        )}
      >
        {(context) => <RangeEditor {...context} />}
      </EditableField>
      <EditableField
        mode="modal"
        trigger="value"
        value={name}
        onChange={setName}
        modalProps={{ title: '修改职位名称', width: 480 }}
        style={{ lineHeight: '36px' }}
        renderValue={(value) => (
          <>
            点击名称打开弹窗　<strong>{value}</strong>
          </>
        )}
      >
        {(context) => <NameEditor {...context} />}
      </EditableField>
      <EditableField
        readOnly
        value="只读内容"
        style={{ lineHeight: '36px' }}
        renderValue={(value) => (
          <Space>
            <a href="#read-only">{value}</a>
            <Button size="small">不可操作</Button>
          </Space>
        )}
      />
      <Form
        form={form}
        initialValues={{ name: '招聘顾问' }}
        layout="vertical"
        style={{ width: '100%' }}
      >
        <Form.Item name="name" label="Form.Item 接入（点击值编辑）">
          <EditableField<string>
            mode="inline"
            trigger="value"
            renderValue={(value) => (
              <Typography.Text>{value ?? '未填写'}</Typography.Text>
            )}
          >
            {(context) => <NameEditor {...context} />}
          </EditableField>
        </Form.Item>
        <Form.Item noStyle shouldUpdate>
          {() => (
            <Typography.Text type="secondary">
              Form 当前值：{form.getFieldValue('name')}
            </Typography.Text>
          )}
        </Form.Item>
      </Form>
    </Space>
  );
};
