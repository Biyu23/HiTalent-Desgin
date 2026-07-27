import { Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { memo, useMemo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
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

  const dataIndex = column.dataIndex as string;
  const value = record[dataIndex] as
    | string
    | number
    | boolean
    | null
    | undefined;
  const preset = column.cellPreset || 'text';
  const presetProps = (column.cellPresetProps || {}) as Record<string, unknown>;

  const rendered = useMemo(() => {
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
  }, [preset, value, presetProps, locale, prefixCls]);

  return <>{rendered}</>;
}

export default memo(PresetBodyCell) as typeof PresetBodyCell;
