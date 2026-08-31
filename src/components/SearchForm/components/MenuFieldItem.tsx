import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Form, Popover, Tag, type FormInstance } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useStyles } from '../style';
import type { SearchFormFieldItem, SearchSearchInfo } from '../type';

interface MenuFieldItemProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  currentValues: Partial<Values>;
  searchMode?: 'submit' | 'change';
  onSearch?: (values: Values, info: SearchSearchInfo) => void;
  disabled?: boolean;
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function formatSingleValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'object' && value !== null) {
    if (value instanceof Date) return value.toLocaleDateString();
    if (
      'format' in (value as Record<string, unknown>) &&
      typeof (value as { format: unknown }).format === 'function'
    ) {
      return (value as { format: (fmt?: string) => string }).format(
        'YYYY-MM-DD',
      );
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export const MenuFieldItem = <Values extends object>({
  field,
  form,
  currentValues,
  searchMode,
  onSearch,
  disabled,
}: MenuFieldItemProps<Values>) => {
  const { styles: menuStyles } = useStyles();
  const {
    name,
    label,
    children,
    formItemProps,
    defaultExpanded = false,
    maxTagCount = 3,
    hidden,
  } = field;

  // 使用受控 activeKeys 配合 antd Collapse 获得原汁原味的手风琴展开/收起过渡动画
  const [activeKeys, setActiveKeys] = useState<string[]>(
    defaultExpanded ? [name] : [],
  );

  const isHidden =
    typeof hidden === 'function'
      ? hidden(currentValues as Values, form)
      : !!hidden;

  const rawValue = currentValues[name as keyof Values];
  const hasValue = !isEmptyValue(rawValue);

  // 清除单个值或某一项值
  const handleRemoveValue = useCallback(
    (removeTargetIndex?: number) => {
      if (disabled) return;

      if (field.onClear && removeTargetIndex === undefined) {
        field.onClear(form);
      } else if (Array.isArray(rawValue) && removeTargetIndex !== undefined) {
        const nextArr = [...rawValue];
        nextArr.splice(removeTargetIndex, 1);
        const finalVal = nextArr.length > 0 ? nextArr : undefined;
        form.setFieldValue(name as never, finalVal as never);
      } else {
        form.setFieldValue(name as never, undefined as never);
      }

      const nextValues = {
        ...form.getFieldsValue(),
      } as Values;

      if (searchMode === 'change') {
        onSearch?.(nextValues, { source: 'tag-remove' });
      }
    },
    [disabled, field, form, name, onSearch, rawValue, searchMode],
  );

  // 提取展示的 Tag 列表
  const tagList = useMemo(() => {
    if (!hasValue) return [];

    // 如果字段定义了自定义 formatTag
    if (field.formatTag) {
      const customTag = field.formatTag(
        rawValue,
        currentValues as Values,
        form,
      );
      if (customTag === false || customTag === null) return [];
      return [
        {
          key: 'custom-0',
          text: customTag,
          onClose: () => handleRemoveValue(),
        },
      ];
    }

    // 数组形式（如多选 Select、Checkbox 组）
    if (Array.isArray(rawValue)) {
      return rawValue.map((item, idx) => ({
        key: `arr-${idx}`,
        text: formatSingleValue(item),
        onClose: () => handleRemoveValue(idx),
      }));
    }

    // 单值形式
    return [
      {
        key: 'single-0',
        text: formatSingleValue(rawValue),
        onClose: () => handleRemoveValue(),
      },
    ];
  }, [currentValues, field, form, handleRemoveValue, hasValue, rawValue]);

  if (isHidden) return null;

  // 拆分展示的和超出折叠的 Tag
  const visibleTags = tagList.slice(0, maxTagCount);
  const overflowTags = tagList.slice(maxTagCount);

  // 渲染表单控件
  const renderControl = () => {
    if (typeof children === 'function') {
      return children(form);
    }
    if (React.isValidElement(children)) {
      if (disabled) {
        return React.cloneElement(children, {
          disabled: true,
          ...children.props,
        });
      }
      return children;
    }
    return children;
  };

  // 面板头部 Label 与 Tag 区域
  const headerContent = (
    <div className={menuStyles.menuFieldHeaderWrapper}>
      <div className={menuStyles.menuFieldLabelRow}>
        <span className={menuStyles.menuFieldLabel}>{label}</span>
      </div>

      {/* 存在值的时候在 label 下方展示 Tag */}
      {tagList.length > 0 && (
        <div
          className={menuStyles.menuFieldTagsWrapper}
          onClick={(e) => e.stopPropagation()} // 防止点击 Tag 触发手风琴折叠
        >
          {visibleTags.map((tag) => (
            <Tag
              key={tag.key}
              closable={!disabled}
              onClose={(e) => {
                e.stopPropagation();
                tag.onClose();
              }}
              className={menuStyles.menuFieldTag}
            >
              {tag.text}
            </Tag>
          ))}

          {/* 超出部分展示 +N... 并在鼠标悬停时 Popover 提示 */}
          {overflowTags.length > 0 && (
            <Popover
              placement="top"
              content={
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    maxWidth: 240,
                  }}
                >
                  {overflowTags.map((tag) => (
                    <Tag
                      key={tag.key}
                      closable={!disabled}
                      onClose={(e) => {
                        e.stopPropagation();
                        tag.onClose();
                      }}
                      className={menuStyles.menuFieldTag}
                    >
                      {tag.text}
                    </Tag>
                  ))}
                </div>
              }
            >
              <span className={menuStyles.menuFieldTagMore}>
                +{overflowTags.length}...
              </span>
            </Popover>
          )}
        </div>
      )}
    </div>
  );

  const collapseItems = [
    {
      key: name,
      label: headerContent,
      children: (
        <div className={menuStyles.menuFieldControlBox}>
          <Form.Item name={name} {...formItemProps}>
            {renderControl()}
          </Form.Item>
        </div>
      ),
    },
  ];

  return (
    <div className={menuStyles.menuFieldWrapper}>
      <Collapse
        ghost
        activeKey={activeKeys}
        onChange={(keys) => {
          const nextKeys = Array.isArray(keys) ? keys : [keys];
          setActiveKeys(nextKeys as string[]);
        }}
        expandIconPosition="end"
        expandIcon={({ isActive }) =>
          isActive ? <MinusOutlined /> : <PlusOutlined />
        }
        className={menuStyles.menuSubCollapse}
        items={collapseItems}
      />
    </div>
  );
};
