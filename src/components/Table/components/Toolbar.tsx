import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
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

  if (!showColumnSetting && !toolbarExtra) return null;

  return (
    <div className={e('toolbar')}>
      <div className={e('toolbar-extra')}>{toolbarExtra}</div>
      {showColumnSetting && (
        <div className={e('toolbar-setting')}>
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
