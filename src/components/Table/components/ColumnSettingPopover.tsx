import { LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Popover, Spin } from 'antd';
import clsx from 'clsx';
import React, { memo, useContext, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import TableContext from '../TableContext';
import type { ColumnId, EnhancedColumnType } from '../type';
import { collectColumnMeta } from '../utils/columnHelpers';

interface ColumnSettingPopoverProps<RecordType = Record<string, unknown>> {
  columns: readonly EnhancedColumnType<RecordType>[];
  visibleIds: readonly ColumnId[];
  onVisibleIdsChange: (ids: ColumnId[]) => void;
  loading?: boolean;
  title?: React.ReactNode;
}

function ColumnSettingPopover<RecordType = Record<string, unknown>>(
  props: ColumnSettingPopoverProps<RecordType>,
) {
  const {
    columns,
    visibleIds,
    onVisibleIdsChange,
    loading = false,
    title: titleProp,
  } = props;
  const { prefixCls, e } = useNamespace('table');
  const { hashId: resolvedHashId } = useContext(TableContext);
  const locale = useLocale('Table');
  const [open, setOpen] = useState(false);
  const [checkValue, setCheckValue] = useState<ColumnId[]>([...visibleIds]);

  useEffect(() => {
    if (open) setCheckValue([...visibleIds]);
  }, [visibleIds, open]);

  const optionsList = useMemo(
    () =>
      collectColumnMeta(columns).map((item) => ({
        id: item.id,
        label: item.column.title || item.id,
        disabled: item.column.hideable === false,
      })),
    [columns],
  );

  const requiredIds = optionsList
    .filter((item) => item.disabled)
    .map((item) => item.id);
  const title = titleProp || locale.columnSetting;

  const handleConfirm = () => {
    onVisibleIdsChange([...new Set([...checkValue, ...requiredIds])]);
    setOpen(false);
  };

  const handleCancel = () => {
    setCheckValue([...visibleIds]);
    setOpen(false);
  };

  const renderContent = () => {
    if (!optionsList.length) return <Empty />;

    const listContent = (
      <div className={clsx(e('column-setting-list'), resolvedHashId)}>
        {optionsList.map((item) => (
          <div
            key={item.id}
            className={clsx(e('column-setting-item'), resolvedHashId)}
          >
            <Checkbox
              checked={item.disabled || checkValue.includes(item.id)}
              disabled={item.disabled}
              onChange={(event) => {
                setCheckValue((previous) =>
                  event.target.checked
                    ? [...new Set([...previous, item.id])]
                    : previous.filter((id) => id !== item.id),
                );
              }}
            >
              {item.label}
            </Checkbox>
          </div>
        ))}
      </div>
    );

    const footer = (
      <div className={clsx(e('column-setting-footer'), resolvedHashId)}>
        <Button size="small" onClick={handleCancel}>
          {locale.cancel}
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleConfirm}
          loading={loading}
        >
          {locale.save}
        </Button>
      </div>
    );

    return loading ? (
      <Spin indicator={<LoadingOutlined spin />}>
        {listContent}
        {footer}
      </Spin>
    ) : (
      <>
        {listContent}
        {footer}
      </>
    );
  };

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      content={renderContent()}
      title={title}
      rootClassName={clsx(prefixCls, resolvedHashId)}
      classNames={{
        root: clsx(e('column-setting-popover'), resolvedHashId),
        body: clsx(e('column-setting-popover-body'), resolvedHashId),
      }}
    >
      <Button
        type="text"
        icon={<SettingOutlined />}
        aria-label={String(locale.columnSetting)}
      />
    </Popover>
  );
}

export default memo(ColumnSettingPopover) as typeof ColumnSettingPopover;
