/**
 * description: 使用 `fieldNames` 免去手动 map 转换数据的烦恼。内置 `rc-virtual-list`，轻松渲染 10,000 条数据不卡顿。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';
import { customFieldData, hugeOptions } from './mock';

const messages = {
  'zh-CN': {
    'virtual.departments': '1. 奇葩字段映射',
    'virtual.departmentsPlaceholder': '选择部门',
    'virtual.virtualScroll': '2. 10000 条数据虚拟滚动',
    'virtual.virtualScrollPlaceholder': '体验丝滑滚动',
  },
  'en-US': {
    'virtual.departments': '1. Unconventional Field Mapping',
    'virtual.departmentsPlaceholder': 'Select Department',
    'virtual.virtualScroll': '2. Virtual Scroll with 10,000 Items',
    'virtual.virtualScrollPlaceholder': 'Smooth scrolling experience',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  return (
    <Space size="large">
      <div style={{ width: 200 }}>
        <h4>{t('virtual.departments')}</h4>
        <PopoverSelect
          options={customFieldData}
          fieldNames={{
            label: 'deptName',
            value: 'deptId',
            disabled: 'isLock',
          }}
          onChange={(val) => console.log('Selected dept ID:', val)}
          placeholder={t('virtual.departmentsPlaceholder')}
        />
      </div>
      <div style={{ width: 200 }}>
        <h4>{t('virtual.virtualScroll')}</h4>
        <PopoverSelect
          options={hugeOptions}
          listHeight={300}
          placeholder={t('virtual.virtualScrollPlaceholder')}
        />
      </div>
    </Space>
  );
};
