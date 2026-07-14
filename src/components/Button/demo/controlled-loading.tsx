/**
 * description: 关闭 `autoLoading` 后，通过外部 `loading` 属性手动控制加载状态。适用于需要外部条件判断（如表单校验失败时不显示 loading）的场景。
 */
import { Space } from 'antd';
import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'ctrl.processing': '处理中...',
    'ctrl.manual': '手动控制 Loading',
    'ctrl.disableAuto': '关闭自动 Loading',
    'ctrl.result': '操作完成',
  },
  'en-US': {
    'ctrl.processing': 'Processing...',
    'ctrl.manual': 'Manual Loading Control',
    'ctrl.disableAuto': 'Disable Auto Loading',
    'ctrl.result': 'Operation complete',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleManualSubmit = () => {
    setLoading(true);
    setResult('');
    setTimeout(() => {
      setLoading(false);
      setResult(t('ctrl.result'));
    }, 3000);
  };

  return (
    <Space direction="vertical">
      <Space>
        <Button type="primary" loading={loading} onClick={handleManualSubmit}>
          {loading ? t('ctrl.processing') : t('ctrl.manual')}
        </Button>
        {result && <span style={{ color: '#52c41a' }}>{result}</span>}
      </Space>

      <Button autoLoading={false} onClick={() => {}}>
        {t('ctrl.disableAuto')}
      </Button>
    </Space>
  );
};
