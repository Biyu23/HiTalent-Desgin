import type React from 'react';
import type { ModalProps } from '../type';

export interface ResolvedClosable {
  showClose: boolean;
  closeIcon?: React.ReactNode;
  disabled: boolean;
  ariaLabel?: string;
}

/**
 * 解析 Modal 的 closable 与 closeIcon 配置
 */
export function resolveClosable(
  closable: ModalProps['closable'],
  closeIcon: ModalProps['closeIcon'],
): ResolvedClosable {
  if (closable === false || closeIcon === false || closeIcon === null) {
    return { showClose: false, disabled: false };
  }

  const isObject = typeof closable === 'object' && closable !== null;
  const resolvedIcon =
    isObject && closable.closeIcon !== undefined
      ? closable.closeIcon
      : closeIcon;

  if (resolvedIcon === false || resolvedIcon === null) {
    return { showClose: false, disabled: false };
  }

  return {
    showClose: true,
    closeIcon: typeof resolvedIcon !== 'boolean' ? resolvedIcon : undefined,
    disabled: (isObject && closable.disabled) || false,
    ariaLabel: isObject ? closable['aria-label'] : undefined,
  };
}

/**
 * 判断是否需要渲染 ModalHeader
 */
export function shouldRenderHeader(options: {
  title?: React.ReactNode;
  minimizable?: boolean;
  maximizable?: boolean;
  draggable?: boolean;
  closable?: ModalProps['closable'];
  closeIcon?: ModalProps['closeIcon'];
}): boolean {
  const { title, minimizable, maximizable, draggable, closable, closeIcon } =
    options;

  if (title === null) return false;

  const { showClose } = resolveClosable(closable, closeIcon);
  return Boolean(
    title !== undefined || minimizable || maximizable || draggable || showClose,
  );
}
