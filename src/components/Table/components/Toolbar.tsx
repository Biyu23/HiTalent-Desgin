import React, { memo, useContext } from 'react';
import type { ColumnMeta } from '../internal';
import { useStyles } from '../style';
import TableContext from '../TableContext';
import type { ColumnSettingOptions, TableColumnKey } from '../type';
import ColumnSetting from './ColumnSetting';

interface ToolbarProps<RecordType> {
  columns: readonly ColumnMeta<RecordType>[];
  visibleKeys: readonly TableColumnKey[];
  onVisibleKeysChange: (keys: readonly TableColumnKey[]) => void;
  columnSetting: boolean | ColumnSettingOptions;
  extra?: React.ReactNode;
}

function Toolbar<RecordType>({
  columns,
  visibleKeys,
  onVisibleKeysChange,
  columnSetting,
  extra,
}: ToolbarProps<RecordType>) {
  const context = useContext(TableContext);
  const { styles, cx } = useStyles();
  if (!columnSetting && !extra) return null;

  const options = typeof columnSetting === 'object' ? columnSetting : {};
  return (
    <div
      className={cx(styles.toolbar, context.classNames?.toolbar)}
      style={context.styles?.toolbar}
    >
      <div className={styles.toolbarExtra}>{extra}</div>
      {columnSetting ? (
        <ColumnSetting
          columns={columns}
          visibleKeys={visibleKeys}
          onChange={onVisibleKeysChange}
          title={options.title}
          loading={options.loading}
        />
      ) : null}
    </div>
  );
}

export default memo(Toolbar) as typeof Toolbar;
