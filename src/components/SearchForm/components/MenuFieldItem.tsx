import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Collapse, Popover, Tag, type FormInstance } from 'antd';
import React from 'react';
import { useStyles } from '../style';
import type { SearchFormFieldItem } from '../type';
import { formatFilterValue, isEmptyValue } from '../utils';
import { FieldRenderer } from './FieldRenderer';

interface MenuFieldItemProps<Values extends object> {
  field: SearchFormFieldItem<Values>;
  form: FormInstance<Values>;
  currentValues: Partial<Values>;
  onRemove: (field: SearchFormFieldItem<Values>, index?: number) => void;
  disabled?: boolean;
}

export const MenuFieldItem = <Values extends object>({
  field,
  form,
  currentValues,
  onRemove,
  disabled,
}: MenuFieldItemProps<Values>) => {
  const { styles: menuStyles } = useStyles();
  const {
    name,
    label,

    defaultExpanded = false,
    maxTagCount = 3,
  } = field;

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
  const visibleTags = tagList.slice(0, maxTagCount);
  const overflowTags = tagList.slice(maxTagCount);

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
                e.preventDefault();
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
                        e.preventDefault();
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
    <div className={menuStyles.menuFieldWrapper}>
      <Collapse
        ghost
        defaultActiveKey={defaultExpanded ? [name] : []}
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
