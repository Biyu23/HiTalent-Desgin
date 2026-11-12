import { EditOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Modal, Popover } from 'antd';
import React, { useState } from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import { useStyles } from './style';
import type { EditableFieldProps } from './type';

export type * from './type';

/** 只管理编辑入口、容器和确认结果；草稿与业务保存由 children 管理。 */
export default function EditableField<Value>(props: EditableFieldProps<Value>) {
  const {
    value,
    onChange,
    renderValue,
    children,
    readOnly = false,
    disabled: customDisabled,
    trigger = 'action',
    actionVisibility = 'hover',
    renderAction,
    mode = 'popup',
    popupWidth = 320,
    popoverProps,
    modalProps,
    prefixCls: customPrefixCls,
    className,
    style,
    styles: customStyles,
    classNames,
    onClickCapture,
    ...rest
  } = props;
  const locale = useLocale('EditableField');
  const prefixCls = usePrefixCls('editable-field', customPrefixCls);
  const { componentDisabled } = ConfigProvider.useConfig();
  const blocked = readOnly || (customDisabled ?? componentDisabled);
  const canEdit = !blocked && !!children;
  const { styles, cx } = useStyles(prefixCls);
  const [editing, setEditing] = useState(false);

  // 权限变化立即结束本次编辑，恢复权限后也不重新打开旧草稿。
  if (editing && !canEdit) setEditing(false);

  const startEdit = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canEdit || editing) return;
    setEditing(true);
  };
  const cancel = () => setEditing(false);
  const submit = (nextValue: Value) => {
    if (!canEdit) return;
    onChange?.(nextValue);
    setEditing(false);
  };
  const editor =
    editing && canEdit ? (
      <div
        className={cx(`${prefixCls}-editor`, styles.editor, classNames?.editor)}
        style={{
          ...(mode === 'popup'
            ? { width: popupWidth, maxWidth: 'calc(100vw - 48px)' }
            : undefined),
          ...customStyles?.editor,
        }}
        // Portal 的点击同样会沿 React 树冒泡，避免触发外层列表操作。
        onClick={(event) => event.stopPropagation()}
      >
        {children?.({ value, submit, cancel })}
      </div>
    ) : null;
  const valueTrigger = canEdit && trigger === 'value';
  const field = (
    <div
      {...rest}
      className={cx(prefixCls, styles.root, classNames?.root, className, {
        [`${prefixCls}-editable`]: canEdit,
        [`${prefixCls}-editing`]: editing && canEdit,
        [`${prefixCls}-action-visible`]: actionVisibility === 'always',
      })}
      style={{ ...customStyles?.root, ...style }}
      onClickCapture={(event) => {
        if (blocked) {
          event.preventDefault();
          event.stopPropagation();
        } else onClickCapture?.(event);
      }}
    >
      <div
        // React 17 尚未声明 inert 类型；空字符串启用原生鼠标和键盘隔离。
        {...{ inert: blocked ? '' : undefined }}
        hidden={editing && canEdit && mode === 'inline'}
        className={cx(styles.value, classNames?.value, {
          [`${prefixCls}-value-trigger`]: valueTrigger,
        })}
        style={customStyles?.value}
        onClick={valueTrigger ? startEdit : undefined}
      >
        {renderValue(value)}
      </div>
      {canEdit && trigger === 'action' && (
        <div
          hidden={editing}
          className={cx(
            `${prefixCls}-action`,
            styles.action,
            classNames?.action,
          )}
          style={customStyles?.action}
        >
          {renderAction ? (
            renderAction({ onClick: startEdit })
          ) : (
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              title={locale.edit}
              onClick={startEdit}
            />
          )}
        </div>
      )}
      {mode === 'inline' && editor}
    </div>
  );

  let content = field;
  if (mode === 'popup') {
    content = (
      <Popover
        placement="bottomLeft"
        {...popoverProps}
        open={editing && canEdit}
        trigger={[]}
        content={editor}
        fresh
        destroyOnHidden
      >
        {field}
      </Popover>
    );
  }
  if (mode === 'modal') {
    content = (
      <>
        {field}
        <Modal
          title={locale.edit}
          {...modalProps}
          open={editing && canEdit}
          footer={null}
          maskClosable={false}
          onCancel={cancel}
          destroyOnHidden
        >
          {editor}
        </Modal>
      </>
    );
  }
  return <ConfigProvider componentDisabled={blocked}>{content}</ConfigProvider>;
}
