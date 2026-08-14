/**
 * description: 通过 `useRef<ModalRef>` 获取 Modal 实例，在组件外部调用 `minimize()`、`restore()`、`maximize()`、`unmaximize()` 方法，实现灵活的程序化窗口管理。
 */
import { Button, Space } from 'antd';
import type { ModalRef } from 'hi-talent-design';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useRef, useState } from 'react';

const messages = {
  'zh-CN': {
    'ref.hint': '以下按钮通过 ref 直接操控弹窗，无需维护额外状态变量。',
    'ref.open': '打开弹窗',
    'ref.minimize': '最小化',
    'ref.restore': '恢复',
    'ref.maximize': '最大化',
    'ref.unmaximize': '取消最大化',
    'ref.title': '命令式控制示例',
    'ref.desc': '你可以通过页面上方的按钮，或弹窗标题栏的图标来操控这个窗口。',
    'ref.li1': '点击 最小化 → 弹窗缩小至右下角浮窗',
    'ref.li2': '点击 恢复 → 浮窗还原为正常弹窗',
    'ref.li3': '点击 最大化 → 全屏沉浸式展示',
    'ref.li4': '点击 取消最大化 → 还原为普通尺寸',
  },
  'en-US': {
    'ref.hint':
      'The buttons below control the modal directly via ref, no extra state variables needed.',
    'ref.open': 'Open Modal',
    'ref.minimize': 'Minimize',
    'ref.restore': 'Restore',
    'ref.maximize': 'Maximize',
    'ref.unmaximize': 'Unmaximize',
    'ref.title': 'Imperative Control Demo',
    'ref.desc':
      'You can control this window using the buttons above or the icons in the title bar.',
    'ref.li1':
      'Click Minimize → modal shrinks to a floating card in the corner',
    'ref.li2': 'Click Restore → floating card returns to normal modal',
    'ref.li3': 'Click Maximize → fullscreen immersive view',
    'ref.li4': 'Click Unmaximize → return to normal size',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  return (
    <div>
      <p style={{ marginBottom: 12, color: '#666', fontSize: 13 }}>
        💡 {t('ref.hint')}
      </p>
      <Space wrap>
        <Button type="primary" onClick={() => setOpen(true)}>
          {t('ref.open')}
        </Button>
        <Button onClick={() => modalRef.current?.minimize()}>
          {t('ref.minimize')}
        </Button>
        <Button onClick={() => modalRef.current?.restore()}>
          {t('ref.restore')}
        </Button>
        <Button onClick={() => modalRef.current?.maximize()}>
          {t('ref.maximize')}
        </Button>
        <Button onClick={() => modalRef.current?.unmaximize()}>
          {t('ref.unmaximize')}
        </Button>
      </Space>

      <Modal
        ref={modalRef}
        title={t('ref.title')}
        open={open}
        minimizable
        maximizable
        draggable
        onCancel={() => setOpen(false)}
      >
        <div style={{ padding: '12px 0', minHeight: 120 }}>
          <p>{t('ref.desc')}</p>
          <ul style={{ color: '#666', paddingLeft: 20 }}>
            <li>{t('ref.li1')}</li>
            <li>{t('ref.li2')}</li>
            <li>{t('ref.li3')}</li>
            <li>{t('ref.li4')}</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};
