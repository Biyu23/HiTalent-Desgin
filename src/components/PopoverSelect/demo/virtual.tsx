/**
 * title: 字段映射与虚拟滚动
 * description: 使用 `fieldNames` 免去手动 map 转换数据的烦恼。内置 `rc-virtual-list`，轻松渲染 10,000 条数据不卡顿。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'myui';
import React from 'react';
import { customFieldData, hugeOptions } from './mock';

export default () => {
  return (
    <Space size="large">
      <div style={{ width: 200 }}>
        <h4>1. 奇葩字段映射</h4>
        <PopoverSelect
          options={customFieldData}
          fieldNames={{
            label: 'deptName', // 告诉组件去读 deptName
            value: 'deptId', // 告诉组件去读 deptId
            disabled: 'isLock', // 告诉组件禁用状态读 isLock
          }}
          onChange={(val) => console.log('选中的部门ID:', val)}
          placeholder="选择部门"
        />
      </div>

      <div style={{ width: 200 }}>
        <h4>2. 10000 条数据虚拟滚动</h4>
        <PopoverSelect
          options={hugeOptions}
          virtual={true} // 默认已开启虚拟滚动
          listHeight={300} // 可自定义下拉面板的最大高度
          placeholder="体验丝滑滚动"
        />
      </div>
    </Space>
  );
};
