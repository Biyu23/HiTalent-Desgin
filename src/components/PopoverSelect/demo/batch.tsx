import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    title: '参与团队',
    beijing: '北京团队',
    design: '上海设计',
    engineering: '上海研发',
    disabled: '上海运营（停用）',
  },
  'en-US': {
    title: 'Teams',
    beijing: 'Beijing',
    design: 'Shanghai design',
    engineering: 'Shanghai engineering',
    disabled: 'Shanghai operations (disabled)',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  return (
    <PopoverSelect
      mode="multiple"
      options={[
        { label: t('beijing'), value: 'BJ' },
        { label: t('design'), value: 'SH-UX' },
        { label: t('engineering'), value: 'SH-RD' },
        { label: t('disabled'), value: 'SH-OP', disabled: true },
      ]}
      placeholder={t('title')}
      labelRender={(label, { values }) =>
        values.length ? (
          <>
            {t('title')}：{label}
          </>
        ) : (
          label
        )
      }
      showSearch
      showSelectAll
      showCancelBtn
      allowClear
      maxTagCount={2}
    />
  );
};
