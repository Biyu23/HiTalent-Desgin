/**
 * description: 通过选项数据中 `disabled` 字段精确控制每个选项的可选状态。结合 `fieldNames` 可映射任意后端字段名作为禁用标记。
 */
import { Space } from 'antd';
import { PopoverSelect } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React from 'react';

const messages = {
  'zh-CN': {
    'disabled.standard': '标准字段',
    'disabled.standardPlaceholder': '部分选项不可选',
    'disabled.fieldNames': '通过 fieldNames 映射禁用字段',
    'disabled.fieldNamesPlaceholder': '访客角色不可选',
    'disabled.regular': '正式员工',
    'disabled.intern': '实习生',
    'disabled.outsource': '外包人员',
    'disabled.resigned': '已离职',
    'disabled.admin': '管理员',
    'disabled.user': '普通用户',
    'disabled.guest': '访客',
  },
  'en-US': {
    'disabled.standard': 'Standard Fields',
    'disabled.standardPlaceholder': 'Some options are disabled',
    'disabled.fieldNames': 'Disable field via fieldNames mapping',
    'disabled.fieldNamesPlaceholder': 'Guest role disabled',
    'disabled.regular': 'Regular Employee',
    'disabled.intern': 'Intern',
    'disabled.outsource': 'Outsourced',
    'disabled.resigned': 'Resigned',
    'disabled.admin': 'Admin',
    'disabled.user': 'Regular User',
    'disabled.guest': 'Guest',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);

  const optionsWithDisabled = [
    { label: t('disabled.regular'), value: 'regular' },
    { label: t('disabled.intern'), value: 'intern', disabled: true },
    { label: t('disabled.outsource'), value: 'outsource' },
    { label: t('disabled.resigned'), value: 'resigned', disabled: true },
  ];

  const backendData = [
    { roleName: t('disabled.admin'), roleId: 1, isFrozen: false },
    { roleName: t('disabled.user'), roleId: 2, isFrozen: false },
    { roleName: t('disabled.guest'), roleId: 3, isFrozen: true },
  ];

  return (
    <Space size="large">
      <div style={{ width: 240 }}>
        <h4>{t('disabled.standard')}</h4>
        <PopoverSelect
          options={optionsWithDisabled}
          placeholder={t('disabled.standardPlaceholder')}
          allowClear
        />
      </div>
      <div style={{ width: 240 }}>
        <h4>{t('disabled.fieldNames')}</h4>
        <PopoverSelect
          options={backendData}
          fieldNames={{
            label: 'roleName',
            value: 'roleId',
            disabled: 'isFrozen',
          }}
          placeholder={t('disabled.fieldNamesPlaceholder')}
        />
      </div>
    </Space>
  );
};
