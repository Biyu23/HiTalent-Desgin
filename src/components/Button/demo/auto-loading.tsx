import { Button } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    'auto.label': '提交表单 (等待1.5秒)',
    'auto.result': '保存成功',
  },
  'en-US': {
    'auto.label': 'Submit Form (Wait 1.5s)',
    'auto.result': 'Saved successfully',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [result, setResult] = useState('');

  const mockApiRequest = () =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setResult(t('auto.result'));
        resolve();
      }, 1500);
    });

  return (
    <div>
      <Button type="primary" onClick={mockApiRequest}>
        {t('auto.label')}
      </Button>
      {result && (
        <span style={{ marginLeft: 12, color: '#52c41a' }}>{result}</span>
      )}
    </div>
  );
};
