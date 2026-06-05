/**
 * title: 多选带确认机制
 * description: 开启 `mode="multiple"` 即可切换多选，默认显示确认按钮。可额外开启取消、清空按钮以及自定义分隔符和最大标签数。
 */
import { PopoverSelect } from 'myui';
import React, { useState } from 'react';
import { standardOptions } from './mock';

export default () => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div style={{ width: 300 }}>
      <PopoverSelect
        mode="multiple"
        options={standardOptions}
        value={values}
        onChange={(val) => setValues(val as string[])}
        placeholder="请选择多个职位"
        showConfirm={true} // 默认多选开启，显示确认按钮
        showCancelBtn={true} // 额外开启取消按钮
        showClearBtn={true} // 额外开启面板内的清空按钮
        maxTagCount={2} // 选超过2个时，显示为 "前端、后端...(+3)"
        separator=" | " // 将默认的顿号分隔符改为竖线
      />
    </div>
  );
};
