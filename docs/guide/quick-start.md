---
title: 快速开始
toc: content
---

# 快速开始

## 使用第一个组件

下面的示例组合了增强 Button、PopoverSelect 和 Modal。所有组件都可以单独使用，也可以逐步加入现有 Ant Design 应用。

```tsx | pure
import { useState } from 'react';
import { Button, Modal, PopoverSelect } from 'hi-talent-design';

const roles = [
  { label: '前端工程师', value: 'frontend' },
  { label: '产品经理', value: 'product' },
  { label: '设计师', value: 'design' },
];

export default () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>();

  return (
    <>
      <Button type="primary" onClick={() => setOpen(true)}>
        创建成员
      </Button>
      <Modal
        title="创建成员"
        open={open}
        draggable
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      >
        <PopoverSelect
          options={roles}
          value={role}
          onChange={(value) => setRole(value as string)}
          placeholder="请选择角色"
        />
      </Modal>
    </>
  );
};
```

## 使用增强能力

组件在保留 Ant Design 原生属性的基础上增加业务能力：

```tsx | pure
<Button autoLoading throttle={800} onClick={saveForm}>
  保存
</Button>

<Modal draggable maximizable minimizable resizable>
  可拖拽、缩放和最小化的工作窗口
</Modal>
```

## 配置全局语言

应用入口只需要包裹一次 ConfigProvider：

```tsx | pure
import { ConfigProvider, zh_CN } from 'hi-talent-design';

export default () => (
  <ConfigProvider locale={zh_CN}>
    <App />
  </ConfigProvider>
);
```

语言包、局部文案覆盖和 RTL 的完整说明见[全局配置](/guide/global-config)。
