import React, { memo } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { ColumnId, EnhancedColumnType } from '../type';
import ColumnSettingPopover from './ColumnSettingPopover';

interface ToolbarProps<RecordType = Record<string, unknown>> {
  columns: readonly EnhancedColumnType<RecordType>[];
  visibleIds: readonly ColumnId[];
  onVisibleIdsChange: (ids: ColumnId[]) => void;
  showColumnSetting: boolean;
  columnSettingTitle?: React.ReactNode;
  toolbarExtra?: React.ReactNode;
  columnSettingLoading?: boolean;
}

function Toolbar<RecordType = Record<string, unknown>>(
  props: ToolbarProps<RecordType>,
) {
  const {
    columns,
    visibleIds,
    onVisibleIdsChange,
    showColumnSetting,
    columnSettingTitle,
    toolbarExtra,
    columnSettingLoading,
  } = props;
  const prefixCls = usePrefixCls('table-toolbar');

  if (!showColumnSetting && !toolbarExtra) return null;

  return (
    <div className={prefixCls}>
      <div className={`${prefixCls}-extra`}>{toolbarExtra}</div>
      {showColumnSetting && (
        <div className={`${prefixCls}-setting`}>
          <ColumnSettingPopover
            columns={columns}
            visibleIds={visibleIds}
            onVisibleIdsChange={onVisibleIdsChange}
            loading={columnSettingLoading}
            title={columnSettingTitle}
          />
        </div>
      )}
    </div>
  );
}

export default memo(Toolbar) as typeof Toolbar;
