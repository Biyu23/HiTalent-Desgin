import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Popover, Tag, type FormInstance } from 'antd';
import React from 'react';
import { useValidationExpand } from '../hooks/useValidationExpand';
import { useStyles } from '../style';
import type { SearchFormFieldItem } from '../type';
import { formatFilterValue, isEmptyValue } from '../utils';
import { FieldRenderer } from './FieldRenderer';

interface MenuFieldItemProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  validationAttempt: number;
  form: FormInstance<Values>;
  currentValues: Partial<Values>;
  onRemove: (field: SearchFormFieldItem<Values>, index?: number) => void;
  disabled?: boolean;
}

export const MenuFieldItem = <Values extends object>({
  field,
  form,
  validationAttempt,
  currentValues,
  onRemove,
  disabled: formDisabled,
}: MenuFieldItemProps<Values>) => {
  const { styles: menuStyles, cx } = useStyles();
  const disabled = formDisabled || field.disabled;
  const {
    name,
    label,

    defaultExpanded = false,
    maxTagCount = 3,
  } = field;

  const collapseState = useValidationExpand(
    defaultExpanded ? [name] : [],
    [name],
    validationAttempt,
  );

  const rawValue = currentValues[name as keyof Values];
  const hasValue = !isEmptyValue(rawValue);
  const handleRemoveValue = (index?: number) => onRemove(field, index);

  // 提取展示的 Tag 列表
  const getTags = () => {
    if (!hasValue) return [];

    // 如果字段定义了自定义 formatTag
    if (field.formatTag) {
      const customTag = field.formatTag(
        rawValue,
        currentValues as Values,
        form,
      );
      if (customTag === false || customTag === null || customTag === undefined)
        return [];
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
        text: formatFilterValue(item),
        onClose: () => handleRemoveValue(idx),
      }));
    }

    // 单值形式
    return [
      {
        key: 'single-0',
        text: formatFilterValue(rawValue),
        onClose: () => handleRemoveValue(),
      },
    ];
  };
  const tagList = getTags();

  // 拆分展示的和超出折叠的 Tag
  const tagLimit = Number.isFinite(maxTagCount)
    ? Math.max(0, Math.floor(maxTagCount))
    : 3;
  const visibleTags = tagList.slice(0, tagLimit);
  const overflowTags = tagList.slice(tagLimit);

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
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {visibleTags.map((tag) => (
            <Tag
              key={tag.key}
              closable={!disabled}
              onClose={(e) => {
                e.preventDefault();
                e.stopPropagation();
                tag.onClose();
              }}
              className={menuStyles.menuFieldTag}
            >
              <span className={menuStyles.menuFieldTagText}>{tag.text}</span>
            </Tag>
          ))}

          {/* 超出部分展示 +N... 并在鼠标悬停时 Popover 提示 */}
          {overflowTags.length > 0 && (
            <Popover
              placement="top"
              trigger={['hover', 'focus']}
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
                        e.preventDefault();
                        e.stopPropagation();
                        tag.onClose();
                      }}
                      className={menuStyles.menuFieldTag}
                    >
                      <span className={menuStyles.menuFieldTagText}>
                        {tag.text}
                      </span>
                    </Tag>
                  ))}
                </div>
              }
            >
              <button type="button" className={menuStyles.menuFieldTagMore}>
                +{overflowTags.length}
              </button>
            </Popover>
          )}
        </div>
      )}
    </div>
  );

  const collapseItems = [
    {
      key: name,
      forceRender: true,
      collapsible: disabled ? ('disabled' as const) : undefined,
      label: headerContent,
      children: (
        <div className={menuStyles.menuFieldControlBox}>
          <FieldRenderer
            field={field}
            form={form}
            disabled={disabled}
            showLabel={false}
          />
        </div>
      ),
    },
  ];

  return (
    <div
      className={cx(
        menuStyles.menuFieldWrapper,
        disabled && menuStyles.menuFieldDisabled,
      )}
    >
      <Collapse
        ghost
        {...collapseState}
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
