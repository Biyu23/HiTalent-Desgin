import { Input, InputRef, Progress, Tag } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import React, { memo, useCallback, useContext, useMemo, useRef } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import TableContext from '../TableContext';
import type { EnhancedColumnType } from '../type';

interface PresetBodyCellProps<RecordType = any> {
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

/**
 * PresetBodyCell — 预设 Cell 渲染 + 行内编辑
 *
 * 根据 column.cellPreset 自动渲染不同格式的内容：
 * - text:     纯文本
 * - tag:      antd Tag 标签（配合 colorMap 映射颜色）
 * - progress: antd Progress 进度条
 * - date:     日期格式化（dayjs）
 * - number:   数字格式化（千分位 + 小数位）
 * - boolean:  布尔值 → 是/否
 * - empty:    空值占位符
 *
 * 行内编辑：
 * - 当 column.editable 为 true 时，双击 cell 进入编辑模式
 * - 编辑完成（blur / Enter）通过 context.onCellEdit 提交
 * - 编辑中按 Escape 取消编辑
 */
function PresetBodyCell<RecordType extends Record<string, any> = any>(
  props: PresetBodyCellProps<RecordType>,
) {
  const { record, column } = props;
  const prefixCls = usePrefixCls('table-cell');
  const locale = useLocale('Table');
  const context = useContext(TableContext);

  const dataIndex = column.dataIndex as string;
  const value = record[dataIndex];
  const preset = column.cellPreset || 'text';
  const presetProps = (column.cellPresetProps || {}) as Record<string, any>;

  // ---- 行内编辑 ----
  const isEditing =
    context.enableInlineEdit &&
    context.editingCell?.recordKey === record.key &&
    context.editingCell?.columnKey === column.key;

  const inputRef = useRef<InputRef>(null);

  const handleDoubleClick = useCallback(() => {
    if (column.editable && context.enableInlineEdit) {
      context.onStartEdit(record.key, column.key as string);
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
    // ---- 编辑模式：渲染 Input ----
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
      // ---- 状态标签 ----
      case 'tag': {
        const val = String(value ?? '');
        const colorMap = (presetProps.colorMap || {}) as Record<string, string>;
        const color = colorMap[val] || presetProps.defaultColor || 'default';
        return <Tag color={color}>{val}</Tag>;
      }

      // ---- 进度条 ----
      case 'progress': {
        const numValue = Number(value) || 0;
        const max = presetProps.max ?? 100;
        const percent = Math.min(Math.round((numValue / max) * 100), 100);
        return (
          <Progress
            percent={percent}
            size="small"
            showInfo={presetProps.showInfo !== false}
            strokeColor={presetProps.strokeColor}
          />
        );
      }

      // ---- 日期 ----
      case 'date': {
        if (value === null || value === undefined || value === '') {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        const format = presetProps.format || 'YYYY-MM-DD';
        try {
          return dayjs(value).format(format);
        } catch {
          return String(value);
        }
      }

      // ---- 数字 ----
      case 'number': {
        if (value === null || value === undefined) {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        const num = Number(value);
        if (isNaN(num)) return String(value);
        const decimals = presetProps.decimals ?? 0;
        const tsSep = presetProps.thousandsSeparator ?? ',';
        const decSep = presetProps.decimalSeparator ?? '.';
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, tsSep);
        return parts.join(decSep);
      }

      // ---- 布尔值 ----
      case 'boolean': {
        const boolVal = Boolean(value);
        return boolVal ? locale.yes : locale.no;
      }

      // ---- 空值占位 ----
      case 'empty': {
        if (value === null || value === undefined || value === '') {
          return (
            <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
          );
        }
        return value;
      }

      // ---- 纯文本（默认） ----
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

  // 如果列可编辑且非编辑模式，包裹可点击容器
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
