/**
 * description: 开启 `mode="multiple"` 即可切换多选，默认显示确认按钮。可额外开启取消、清空按钮以及自定义分隔符和最大标签数。
 */
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import { standardOptions } from './mock';

const messages = {
  'zh-CN': { 'multiple.placeholder': '请选择多个职位' },
  'en-US': { 'multiple.placeholder': 'Select multiple positions' },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [values, setValues] = useState<string[]>([]);

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        options={standardOptions}
        value={values}
        onChange={(val) => setValues(val as string[])}
        placeholder={t('multiple.placeholder')}
        showConfirm
        showCancelBtn
        showClearBtn
        maxTagCount={2}
        separator=" | "
      />
    </div>
  );
};
