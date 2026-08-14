/**
 * description: responsive 根据宽度自动布局；expanded 始终平铺；collapsed 收起到 minVisibleCount。
 */
import { Radio } from 'antd';
import {
  ResponsiveButtonGroup,
  ResponsiveButtonGroupMode,
} from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';

const messages = {
  'zh-CN': {
    save: '保存',
    preview: '预览',
    duplicate: '创建副本',
    archive: '归档',
    share: '分享',
  },
  'en-US': {
    save: 'Save',
    preview: 'Preview',
    duplicate: 'Duplicate',
    archive: 'Archive',
    share: 'Share',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [mode, setMode] = useState<ResponsiveButtonGroupMode>('responsive');

  return (
    <div>
      <Radio.Group
        value={mode}
        optionType="button"
        options={['responsive', 'expanded', 'collapsed']}
        onChange={(event) => setMode(event.target.value)}
      />
      <div
        style={{
          width: 360,
          maxWidth: '100%',
          marginTop: 16,
          padding: 12,
          overflow: 'auto',
          border: '1px dashed #bfbfbf',
        }}
      >
        <ResponsiveButtonGroup
          mode={mode}
          minVisibleCount={1}
          items={[
            {
              key: 'save',
              label: t('save'),
              priority: 100,
              buttonProps: { type: 'primary' },
            },
            { key: 'preview', label: t('preview'), priority: 50 },
            { key: 'duplicate', label: t('duplicate'), priority: 0 },
            { key: 'archive', label: t('archive'), priority: 10 },
            { key: 'share', label: t('share'), priority: 20 },
          ]}
          buttonProps={{ size: 'middle' }}
        />
      </div>
    </div>
  );
};
