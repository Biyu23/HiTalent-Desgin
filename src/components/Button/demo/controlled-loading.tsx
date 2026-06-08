/**
 * title: 受控 Loading
 * description: 关闭 `autoLoading` 后，通过外部 `loading` 属性手动控制加载状态。适用于需要外部条件判断（如表单校验失败时不显示 loading）的场景。
 */
import { message, Space } from 'antd';
import { Button } from 'myui';
import { useDemoIntl } from 'myui/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'ctrl.processing': '处理中...',
    'ctrl.manual': '手动控制 Loading',
    'ctrl.disableAuto': '关闭自动 Loading',
    'ctrl.success': '操作完成！',
    'ctrl.info': 'autoLoading 关闭，点击不会自动 loading',
  },
  'en-US': {
    'ctrl.processing': 'Processing...',
    'ctrl.manual': 'Manual Loading Control',
    'ctrl.disableAuto': 'Disable Auto Loading',
    'ctrl.success': 'Operation complete!',
    'ctrl.info': 'autoLoading is off, click will not trigger auto loading',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(t('ctrl.success'));
    }, 3000);
  };

  return (
    <Space>
      <Button type="primary" loading={loading} onClick={handleManualSubmit}>
        {loading ? t('ctrl.processing') : t('ctrl.manual')}
      </Button>

      <Button
        autoLoading={false}
        onClick={() => {
          message.info(t('ctrl.info'));
        }}
      >
        {t('ctrl.disableAuto')}
      </Button>
    </Space>
  );
};
