import clsx from 'clsx';
import React, { memo, useContext } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import TableContext from '../TableContext';
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
  const { e } = useNamespace('table');
  const { hashId } = useContext(TableContext);

  if (!showColumnSetting && !toolbarExtra) return null;

  return (
    <div className={clsx(e('toolbar'), hashId)}>
      <div className={clsx(e('toolbar-extra'), hashId)}>{toolbarExtra}</div>
      {showColumnSetting && (
        <div className={clsx(e('toolbar-setting'), hashId)}>
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
