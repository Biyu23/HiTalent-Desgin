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
  const [values, setValues] = useState<string[]>(['FE', 'BE', 'PM']);

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        valueType="array"
        options={standardOptions}
        value={values}
        onChange={setValues}
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
