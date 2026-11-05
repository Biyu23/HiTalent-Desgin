import { Button, Space } from 'antd';
import type { NumberRangeInputRef, NumberRangeValue } from 'hi-talent-design';
import { NumberRangeInput } from 'hi-talent-design';
import React, { useRef, useState } from 'react';

export default () => {
  const ref = useRef<NumberRangeInputRef>(null);
  const [value, setValue] = useState<NumberRangeValue>([10, 20]);
  const [focused, setFocused] = useState(false);

  return (
    <Space direction="vertical" style={{ width: 400, maxWidth: '100%' }}>
      <div>小数、单位与焦点控制（{focused ? '编辑中' : '未聚焦'}）</div>
      <NumberRangeInput
        ref={ref}
        value={value}
        onChange={setValue}
        min={0}
        max={9999}
        precision={2}
        step={0.01}
        startInputProps={{ suffix: '元', precision: 1, step: 0.1 }}
        endInputProps={{ suffix: '元' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <Space wrap>
        <Button onClick={() => ref.current?.focus()}>聚焦最小值</Button>
        <Button onClick={() => ref.current?.focus('end')}>聚焦最大值</Button>
        <Button onClick={() => setValue([null, null])}>清空区间</Button>
      </Space>
      <pre>{JSON.stringify(value)}</pre>
      <div>最小值端禁用</div>
      <NumberRangeInput defaultValue={[10, 20]} disabled={[true, false]} />
      <div>最大值端只读</div>
      <NumberRangeInput defaultValue={[10, 20]} readOnly={[false, true]} />
      <div>百分比格式化</div>
      <NumberRangeInput
        defaultValue={[10, 80]}
        min={0}
        max={100}
        formatter={(number) =>
          String(number ?? '') === '' ? '' : `${number}%`
        }
        parser={(text) => Number(text?.replace('%', ''))}
      />
    </Space>
  );
};
