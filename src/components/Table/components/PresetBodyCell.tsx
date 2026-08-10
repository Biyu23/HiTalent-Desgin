import { Progress, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type {
  DatePresetProps,
  EnhancedLeafColumnType,
  NumberPresetProps,
  ProgressPresetProps,
  TagPresetProps,
} from '../type';
import { getValueByDataIndex } from '../utils/columnHelpers';

interface PresetBodyCellProps<RecordType = Record<string, unknown>> {
  record: RecordType;
  column: EnhancedLeafColumnType<RecordType>;
}

function PresetBodyCell<RecordType = Record<string, unknown>>(
  props: PresetBodyCellProps<RecordType>,
) {
  const { record, column } = props;
  const prefixCls = usePrefixCls('table-cell');
  const locale = useLocale('Table');
  const value = getValueByDataIndex(record, column.dataIndex);
  const preset = column.cellPreset || 'text';
  const emptyNode = (
    <span className={`${prefixCls}-empty`}>{locale.emptyText}</span>
  );

  switch (preset) {
    case 'tag': {
      const text = String(value ?? '');
      const presetProps = column.cellPresetProps as TagPresetProps | undefined;
      const color =
        presetProps?.colorMap?.[text] || presetProps?.defaultColor || 'default';
      return <Tag color={color}>{text}</Tag>;
    }
    case 'progress': {
      const presetProps = column.cellPresetProps as
        | ProgressPresetProps
        | undefined;
      const numericValue = Number(value);
      const maxValue = Number(presetProps?.max ?? 100);
      const percent =
        Number.isFinite(numericValue) &&
        Number.isFinite(maxValue) &&
        maxValue > 0
          ? Math.min(
              Math.max(Math.round((numericValue / maxValue) * 100), 0),
              100,
            )
          : 0;
      return (
        <Progress
          percent={percent}
          size="small"
          showInfo={presetProps?.showInfo !== false}
          strokeColor={presetProps?.strokeColor}
        />
      );
    }
    case 'date': {
      if (value === null || value === undefined || value === '') {
        return emptyNode;
      }
      const date = dayjs(value as string | number | Date);
      const presetProps = column.cellPresetProps as DatePresetProps | undefined;
      return date.isValid() ? (
        <>{date.format(presetProps?.format || 'YYYY-MM-DD')}</>
      ) : (
        <>{String(value)}</>
      );
    }
    case 'number': {
      if (value === null || value === undefined) return emptyNode;
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) return <>{String(value)}</>;
      const presetProps = column.cellPresetProps as
        | NumberPresetProps
        | undefined;
      const rawDecimals = Number(presetProps?.decimals ?? 0);
      const decimals = Number.isFinite(rawDecimals)
        ? Math.max(0, Math.min(Math.trunc(rawDecimals), 100))
        : 0;
      const thousandsSeparator = presetProps?.thousandsSeparator ?? ',';
      const decimalSeparator = presetProps?.decimalSeparator ?? '.';
      const parts = numberValue.toFixed(decimals).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      return <>{parts.join(decimalSeparator)}</>;
    }
    case 'boolean':
      return <>{Boolean(value) ? locale.yes : locale.no}</>;
    case 'empty':
      return value === null || value === undefined || value === '' ? (
        emptyNode
      ) : (
        <>{value as React.ReactNode}</>
      );
    case 'text':
    default:
      return value === null || value === undefined || value === '' ? (
        emptyNode
      ) : (
        <>{String(value)}</>
      );
  }
}

export default memo(PresetBodyCell) as typeof PresetBodyCell;
