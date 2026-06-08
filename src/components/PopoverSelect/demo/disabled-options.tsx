/**
 * title: 禁用选项
 * description: 通过选项数据中 `disabled` 字段精确控制每个选项的可选状态。结合 `fieldNames` 可映射任意后端字段名作为禁用标记。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'myui';
import React from 'react';

export default () => {
  // 含禁用项的标准数据
  const optionsWithDisabled = [
    { label: '正式员工', value: 'regular' },
    { label: '实习生', value: 'intern', disabled: true }, // 此选项不可选
    { label: '外包人员', value: 'outsource' },
    { label: '已离职', value: 'resigned', disabled: true },
  ];

  // 后端奇葩字段：isFrozen 表示禁用
  const backendData = [
    { roleName: '管理员', roleId: 1, isFrozen: false },
    { roleName: '普通用户', roleId: 2, isFrozen: false },
    { roleName: '访客', roleId: 3, isFrozen: true }, // 禁用
  ];

  return (
    <Space size="large">
      <div style={{ width: 240 }}>
        <h4>标准字段</h4>
        <PopoverSelect
          options={optionsWithDisabled}
          placeholder="部分选项不可选"
          allowClear
        />
      </div>

      <div style={{ width: 240 }}>
        <h4>通过 fieldNames 映射禁用字段</h4>
        <PopoverSelect
          options={backendData}
          fieldNames={{
            label: 'roleName',
            value: 'roleId',
            disabled: 'isFrozen', // 将 isFrozen 映射为 disabled
          }}
          placeholder="访客角色不可选"
        />
      </div>
    </Space>
  );
};
