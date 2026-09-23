import { NumberRangeInput, type NumberRangeValue } from 'hi-talent-design';
import React, { useState } from 'react';

export default () => {
  const [value, setValue] = useState<NumberRangeValue>([10, 20]);

  return (
    <div style={{ maxWidth: 400 }}>
      <NumberRangeInput value={value} onChange={setValue} min={0} max={99} />
      <pre>{JSON.stringify(value)}</pre>
    </div>
  );
};
