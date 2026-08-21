import { PopoverSelect } from 'hi-talent-design';
import React from 'react';
import { standardOptions } from './mock';

export default () => (
  <PopoverSelect
    options={standardOptions}
    placeholder="Semantic select"
    rootClassName="demo-select-boundary"
    classNames={{ trigger: 'demo-select-trigger', popup: 'demo-select-popup' }}
    styles={{
      root: { width: 280 },
      trigger: { borderColor: '#91caff' },
      popup: { '--demo-popup-accent': '#1677ff' },
      item: { borderRadius: 4 },
    }}
  />
);
