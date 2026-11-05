import { EditOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Popover } from 'antd';
import React, { useState } from 'react';
import { useLocale, usePrefixCls } from '../../configProvider';
import { useStyles } from './style';
import type { EditableFieldProps } from './type';

export type * from './type';

/** 管理只读与编辑切换；校验规则和保存请求均由调用方处理。 */
export default function EditableField<Value>(props: EditableFieldProps<Value>) {
  const {
    value,
    onChange,
    renderValue,
    renderEditor,
    onSave,
    mode = 'popup',
    disabled: customDisabled,
    actionVisibility = 'hover',
    popupWidth = 320,
    placement = 'bottomLeft',
    getPopupContainer,
    prefixCls: customPrefixCls,
    className,
    style,
    styles: customStyles,
    classNames,
    ...rest
  } = props;
  const locale = useLocale('EditableField');
  const prefixCls = usePrefixCls('editable-field', customPrefixCls);
  const { componentDisabled } = ConfigProvider.useConfig();
  const disabled = customDisabled ?? componentDisabled;
  const { styles, cx } = useStyles();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const startEdit = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    // 每次进入编辑读取最新值；编辑期间不因外部刷新覆盖正在输入的草稿。
    setDraft(value);
    setEditing(true);
  };

  const save = async () => {
    if (saving || disabled) return;
    setSaving(true);
    try {
      // Promise resolve 后才提交；reject 则保留编辑状态。
      await onSave?.(draft);
    } catch {
      // 校验和错误提示由业务处理，这里只结束 Loading 并保留草稿。
      return;
    } finally {
      setSaving(false);
    }
    onChange(draft);
    setEditing(false);
  };

  const editor = editing ? (
    <div
      data-mode={mode}
      className={cx(styles.editor, classNames?.editor)}
      style={{
        ...(mode === 'popup'
          ? { width: popupWidth, maxWidth: 'calc(100vw - 48px)' }
          : undefined),
        ...customStyles?.editor,
      }}
      // React Portal 的事件仍向父组件冒泡，编辑操作不应触发外层详情跳转。
      onClick={(event) => event.stopPropagation()}
    >
      {renderEditor({ value: draft, onChange: setDraft, saving })}
      <div
        className={cx(styles.footer, classNames?.footer)}
        style={customStyles?.footer}
      >
        <Button disabled={saving} onClick={() => setEditing(false)}>
          {locale.cancel}
        </Button>
        <Button
          type="primary"
          loading={saving}
          disabled={disabled}
          onClick={save}
        >
          {locale.save}
        </Button>
      </div>
    </div>
  ) : null;

  const field = (
    <div
      {...rest}
      className={cx(prefixCls, styles.root, classNames?.root, className)}
      style={{ ...customStyles?.root, ...style }}
      data-editable={!disabled}
      data-editing={editing}
      data-action-visible={actionVisibility === 'always'}
    >
      {editing && mode === 'inline' ? editor : renderValue(value)}
      {!disabled && !editing && (
        <Button
          data-edit-action
          className={cx(styles.action, classNames?.action)}
          style={customStyles?.action}
          type="text"
          size="small"
          icon={<EditOutlined />}
          title={locale.edit}
          onClick={startEdit}
        />
      )}
    </div>
  );

  // 只由明确的保存或取消结束编辑，点击外部及嵌套选择器不会丢失草稿。
  return mode === 'popup' ? (
    <Popover
      open={editing}
      trigger={[]}
      content={editor}
      rootClassName={classNames?.popup}
      styles={{ root: customStyles?.popup }}
      placement={placement}
      getPopupContainer={getPopupContainer}
    >
      {field}
    </Popover>
  ) : (
    field
  );
}
