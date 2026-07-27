import { Input, InputRef, Progress, Tag } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { memo, useCallback, useContext, useMemo, useRef } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import TableContext from '../TableContext';
import type { EnhancedColumnType } from '../type';

interface PresetBodyCellProps<RecordType = Record<string, unknown>> {
  /** 原始子节点 */
  children: React.ReactNode;
  /** 当前行数据 */
  record: RecordType;
  /** 列定义 */
  column: EnhancedColumnType<RecordType>;
  /** 该行 key */
  rowKey: React.Key;
  /** 列 key */
  columnKey: string;
}

function PresetBodyCell<
  RecordType extends Record<string, unknown> = Record<string, unknown>,
>(props: PresetBodyCellProps<RecordType>) {
  const { record, column } = props;
  const prefixCls = usePrefixCls('table-cell');
  const locale = useLocale('Table');
  const context = useContext(TableContext);

  const dataIndex = column.dataIndex as string;
  const value = record[dataIndex] as
    | string
    | number
    | boolean
    | null
    | undefined;
  const preset = column.cellPreset || 'text';
  const presetProps = (column.cellPresetProps || {}) as Record<string, unknown>;

  // ---- 行内编辑 ----
  const isEditing =
    context.enableInlineEdit &&
    context.editingCell?.recordKey === record.key &&
    context.editingCell?.columnKey === column.key;

  const inputRef = useRef<InputRef>(null);

  const handleDoubleClick = useCallback(() => {
    if (column.editable && context.enableInlineEdit && record.key) {
      context.onStartEdit(record.key as React.Key, column.key as string);
    }
  }, [column.editable, column.key, context, record.key]);

  const handleSave = useCallback(
    async (newValue: string) => {
      context.onEndEdit();
      await context.onCellEdit?.(record, dataIndex, newValue);
    },
    [context, record, dataIndex],
  );

  const handleCancel = useCallback(() => {
    context.onEndEdit();
  }, [context]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave(inputRef.current?.input?.value ?? String(value ?? ''));
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel, value],
  );

  const rendered = useMemo(() => {
    if (isEditing) {
      return (
        <Input
          ref={inputRef}
          className={`${prefixCls}-edit-input`}
          size="small"
          defaultValue={String(value ?? '')}
          onBlur={(e) => handleSave(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      );
    }

    switch (preset) {
      case 'tag': {
        const val = String(value ?? '');
        const colorMap = (presetProps.colorMap || {}) as Record<string, string>;
        const color =
          colorMap[val] || (presetProps.defaultColor as string) || 'default';
        return <Tag color={color}>{val}</Tag>;
      }

      case 'progress': {
        const numValue = Number(value) || 0;
        const max = (presetProps.max as number) ?? 100;
        const percent = Math.min(Math.round((numValue / max) * 100), 100);
        return (
          <Progress
            percent={percent}
            size="small"
            showInfo={presetProps.showInfo !== false}
            strokeColor={presetProps.strokeColor as string}
          />
        );
      }

      case 'date': {
        if (value === null || value === undefined || value === '') {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        const format = (presetProps.format as string) || 'YYYY-MM-DD';
        try {
          return dayjs(value as string | number).format(format);
        } catch {
          return String(value);
        }
      }

      case 'number': {
        if (value === null || value === undefined) {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        const num = Number(value);
        if (isNaN(num)) return String(value);
        const decimals = (presetProps.decimals as number) ?? 0;
        const tsSep = (presetProps.thousandsSeparator as string) ?? ',';
        const decSep = (presetProps.decimalSeparator as string) ?? '.';
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, tsSep);
        return parts.join(decSep);
      }

      case 'boolean': {
        const boolVal = Boolean(value);
        return boolVal ? locale.yes : locale.no;
      }

      case 'empty': {
        if (value === null || value === undefined || value === '') {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        return value as React.ReactNode;
      }

      case 'text':
      default:
        if (value === null || value === undefined || value === '') {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        return String(value);
    }
  }, [
    preset,
    value,
    presetProps,
    locale,
    prefixCls,
    isEditing,
    handleSave,
    handleKeyDown,
  ]);

  if (column.editable && !isEditing) {
    return (
      <div
        className={clsx(`${prefixCls}-editable`)}
        onDoubleClick={handleDoubleClick}
        title={locale.clickToEdit}
      >
        {rendered}
      </div>
    );
  }

  return <>{rendered}</>;
}

export default memo(PresetBodyCell) as typeof PresetBodyCell;
