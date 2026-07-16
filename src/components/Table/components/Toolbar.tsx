import React, { memo } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { EnhancedColumnType } from '../type';
import ColumnSettingPopover from './ColumnSettingPopover';

interface ToolbarProps<RecordType = any> {
  /** 原始列定义 */
  columns: EnhancedColumnType<RecordType>[];
  /** 当前可见列 keys */
  visibleKeys: string[];
  /** 可见列变更 */
  onVisibleKeysChange: (keys: string[]) => void;
  /** 是否显示列设置 */
  showColumnSetting: boolean;
  /** 额外工具栏内容 */
  toolbarExtra?: React.ReactNode;
  /** 列设置加载/保存中 */
  columnSettingLoading?: boolean;
}

/**
 * Toolbar — Table 右上角操作栏
 *
 * 渲染列设置按钮和用户自定义的额外操作
 */
function Toolbar<RecordType = any>(props: ToolbarProps<RecordType>) {
  const {
    columns,
    visibleKeys,
    onVisibleKeysChange,
    showColumnSetting,
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
            visibleKeys={visibleKeys}
            onVisibleKeysChange={onVisibleKeysChange}
            loading={columnSettingLoading}
          />
        </div>
      )}
    </div>
  );
}

export default memo(Toolbar) as typeof Toolbar;
