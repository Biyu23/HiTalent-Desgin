import React, { memo, useContext } from 'react';
import { useStyles } from '../style';
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
  const context = useContext(TableContext);
  const { styles: tableStyles, cx } = useStyles();
  const { classNames, styles } = context;

  if (!showColumnSetting && !toolbarExtra) return null;

  return (
    <div
      className={cx(tableStyles.toolbar, classNames?.toolbar)}
      style={styles?.toolbar}
    >
      <div className={cx(tableStyles.toolbarExtra, classNames?.toolbarExtra)}>
        {toolbarExtra}
      </div>
      {showColumnSetting && (
        <div className={tableStyles.toolbarSetting}>
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
