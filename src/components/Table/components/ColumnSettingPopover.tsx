import { LoadingOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Checkbox, Empty, Popover, Spin } from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import type { EnhancedColumnType } from '../type';
import { getColumnKey } from '../utils/columnHelpers';

interface ColumnSettingPopoverProps<
  RecordType extends Record<string, unknown> = Record<string, unknown>,
> {
  /** 原始列定义 */
  columns: EnhancedColumnType<RecordType>[];
  /** 当前可见列 keys */
  visibleKeys: string[];
  /** 可见列变更 */
  onVisibleKeysChange: (keys: string[]) => void;
  /** 加载/保存中 */
  loading?: boolean;
  /** 自定义标题 */
  title?: React.ReactNode;
}

/**
 * ColumnSettingPopover — 列显示/隐藏设置的 Popover 面板
 *
 * 参考用户提供的 TableColumnSetting 组件设计，
 * 使用项目现有的 ConfigProvider locale 替代 react-i18next。
 */
function ColumnSettingPopover<
  RecordType extends Record<string, unknown> = Record<string, unknown>,
>(props: ColumnSettingPopoverProps<RecordType>) {
  const {
    columns,
    visibleKeys,
    onVisibleKeysChange,
    loading = false,
    title: titleProp,
  } = props;

  const prefixCls = usePrefixCls('table-column-setting');
  const locale = useLocale('Table');
  const [open, setOpen] = useState(false);
  const [checkValue, setCheckValue] = useState<string[]>(visibleKeys);

  // 同步外部变化
  useEffect(() => {
    if (open) {
      setCheckValue(visibleKeys);
    }
  }, [visibleKeys, open]);

  // 构建 checkbox 选项列表
  const optionsList = useMemo(() => {
    if (!columns.length) return [];
    return columns.map((col, index) => {
      const key = getColumnKey(col, index);
      return {
        key,
        label: (col.title as React.ReactNode) || key,
        disabled: col.hideable === false,
        hidden: col.hidden,
      };
    });
  }, [columns]);

  const title = titleProp || locale.columnSetting;

  const handleConfirm = () => {
    onVisibleKeysChange(checkValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setCheckValue(visibleKeys);
    setOpen(false);
  };

  const renderContent = () => {
    if (!optionsList.length) return <Empty />;

    const listContent = (
      <div className={`${prefixCls}-list`}>
        {optionsList.map((item) => (
          <div key={item.key} className={`${prefixCls}-item`}>
            <Checkbox
              checked={checkValue.includes(item.key)}
              disabled={item.disabled}
              onChange={(e) => {
                setCheckValue((prev) => {
                  if (e.target.checked) {
                    return [...prev, item.key];
                  }
                  return prev.filter((k) => k !== item.key);
                });
              }}
            >
              {item.label}
            </Checkbox>
          </div>
        ))}
      </div>
    );

    const footer = (
      <div className={`${prefixCls}-footer`}>
        <Button size="small" onClick={handleCancel}>
          {locale.cancel}
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleConfirm}
          loading={loading}
        >
          {locale.save}
        </Button>
      </div>
    );

    if (loading) {
      return (
        <Spin indicator={<LoadingOutlined spin />}>
          {listContent}
          {footer}
        </Spin>
      );
    }

    return (
      <>
        {listContent}
        {footer}
      </>
    );
  };

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      content={renderContent()}
      title={title}
      classNames={{
        root: `${prefixCls}-popover`,
        body: `${prefixCls}-popover-body`,
      }}
    >
      <Button type="text" icon={<SettingOutlined />} />
    </Popover>
  );
}

export default memo(ColumnSettingPopover) as typeof ColumnSettingPopover;
