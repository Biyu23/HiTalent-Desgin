import { LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Popover, Spin } from 'antd';
import React, { memo, useContext, useMemo, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import type { ColumnMeta } from '../internal';
import { useStyles } from '../style';
import TableContext from '../TableContext';
import type { TableColumnKey } from '../type';

interface ColumnSettingProps<RecordType> {
  columns: readonly ColumnMeta<RecordType>[];
  visibleKeys: readonly TableColumnKey[];
  onChange: (keys: readonly TableColumnKey[]) => void;
  loading?: boolean;
  title?: React.ReactNode;
}

function ColumnSetting<RecordType>({
  columns,
  visibleKeys,
  onChange,
  loading = false,
  title,
}: ColumnSettingProps<RecordType>) {
  const context = useContext(TableContext);
  const { styles, cx } = useStyles();
  const locale = useLocale('Table');
  const [open, setOpen] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<TableColumnKey[]>([]);

  const changeOpen = (next: boolean) => {
    if (next) setCheckedKeys([...visibleKeys]);
    setOpen(next);
  };

  const requiredKeys = useMemo(
    () => columns.filter((item) => !item.hideable).map((item) => item.key),
    [columns],
  );

  const confirm = () => {
    onChange([...new Set([...checkedKeys, ...requiredKeys])]);
    setOpen(false);
  };

  const cancel = () => {
    setCheckedKeys([...visibleKeys]);
    setOpen(false);
  };

  const content = columns.length ? (
    <Spin spinning={loading} indicator={<LoadingOutlined spin />}>
      <div className={styles.columnSettingList}>
        {columns.map((item) => {
          const checked = !item.hideable || checkedKeys.includes(item.key);
          return (
            <div key={item.key} className={styles.columnSettingItem}>
              <Checkbox
                checked={checked}
                disabled={!item.hideable}
                onChange={(event) => {
                  setCheckedKeys((current) =>
                    event.target.checked
                      ? [...new Set([...current, item.key])]
                      : current.filter((key) => key !== item.key),
                  );
                }}
              >
                {(typeof item.column.title === 'function'
                  ? item.column.title({})
                  : item.column.title) ?? item.key}
              </Checkbox>
            </div>
          );
        })}
      </div>
      <div className={styles.columnSettingFooter}>
        <Button size="small" onClick={cancel}>
          {locale.cancel}
        </Button>
        <Button type="primary" size="small" loading={loading} onClick={confirm}>
          {locale.save}
        </Button>
      </div>
    </Spin>
  ) : (
    <Empty />
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={changeOpen}
      content={content}
      title={title ?? locale.columnSetting}
      rootClassName={cx(
        styles.columnSettingPopover,
        context.classNames?.settingPopup,
      )}
      styles={{ root: context.styles?.settingPopup }}
      classNames={{ body: styles.columnSettingPopoverBody }}
    >
      <Button type="text" icon={<SettingOutlined />} />
    </Popover>
  );
}

export default memo(ColumnSetting) as typeof ColumnSetting;
