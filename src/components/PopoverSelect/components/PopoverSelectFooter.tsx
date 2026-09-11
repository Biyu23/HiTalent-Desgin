import { Button, Space } from 'antd';
import React from 'react';
import type { PopoverSelectLocale } from '../../../locales';
import type { PopoverSelectRenderContext, RawValueType } from '../type';

export default function PopoverSelectFooter<
  V extends RawValueType,
  O extends object,
>({
  context,
  locale,
  showClear,
  showCancel,
}: {
  context: PopoverSelectRenderContext<V, O>;
  locale: PopoverSelectLocale;
  showClear?: boolean;
  showCancel?: boolean;
}) {
  return (
    <Space>
      {showClear && (
        <Button size="small" onClick={context.clear}>
          {locale.clearAll}
        </Button>
      )}
      {showCancel && (
        <Button size="small" onClick={context.cancel}>
          {locale.cancel}
        </Button>
      )}
      {context.confirmRequired && (
        <Button size="small" type="primary" onClick={context.confirm}>
          {locale.confirm}
        </Button>
      )}
    </Space>
  );
}
