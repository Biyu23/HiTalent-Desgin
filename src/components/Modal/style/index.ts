import { CSSObject, useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';

const { useToken } = theme;

export const genModalStyle = (
  token: GlobalToken,
  prefixCls: string,
): CSSObject => {
  const modalContent = '.ant-modal-content';
  const modalHeader = '.ant-modal-header';
  const modalFooter = '.ant-modal-footer';
  const modalBody = '.ant-modal-body';

  return {
    [`.${prefixCls}-wrap-constrained`]: {
      overflow: 'hidden',
    },
    [`.${prefixCls}`]: {
      [`&.${prefixCls}-draggable, &.${prefixCls}-resizable, &.${prefixCls}-manual-size`]:
        {
          paddingBottom: 0,
        },
      [`&&.${prefixCls}-transition-active`]: {
        transition: `width ${token.motionDurationSlow} ${token.motionEaseInOut}, height ${token.motionDurationSlow} ${token.motionEaseInOut}, top ${token.motionDurationSlow} ${token.motionEaseInOut}`,
        [modalContent]: {
          transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`,
        },
      },
      [`.${prefixCls}-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: token.size,
        [`&.${prefixCls}-header-draggable`]: {
          cursor: 'move',
        },
      },
      [`.${prefixCls}-title`]: {
        flex: 1,
        overflow: 'hidden',
      },
      [`.${prefixCls}-actions`]: {
        flexShrink: 0,
        '.ant-btn': {
          color: token.colorTextSecondary,
        },
      },
      [`&.${prefixCls}-draggable`]: {
        [modalFooter]: {
          cursor: 'move',
          'button, a, input, textarea, select, [contenteditable], [data-modal-no-drag]':
            {
              cursor: 'auto',
            },
        },
      },
      [`&&.${prefixCls}-manual-size`]: {
        boxSizing: 'border-box',
        maxWidth: 'none',
        [`.${prefixCls}-window, ${modalContent}`]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        [`${modalHeader}, ${modalFooter}`]: {
          flexShrink: 0,
        },
        [modalBody]: {
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        },
      },
      [`&.${prefixCls}-resizing, &.${prefixCls}-resizing ${modalContent}`]: {
        transition: 'none',
      },
      [modalContent]: {
        position: 'relative',
      },
      [`.${prefixCls}-resize-handle`]: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        zIndex: 2,
        width: 16,
        height: 16,
        cursor: 'nwse-resize',
        touchAction: 'none',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: 3,
          bottom: 3,
          width: 6,
          height: 6,
          borderColor: 'currentColor',
          borderStyle: 'solid',
          borderWidth: '0 1px 1px 0',
          opacity: 0.35,
        },
        '&:hover::after': {
          color: token.colorPrimary,
          opacity: 1,
        },
      },
      [`&&.${prefixCls}-maximized`]: {
        top: 0,
        width: '100%',
        height: '100vh',
        maxWidth: '100vw',
        margin: 0,
        paddingBottom: 0,
        [modalContent]: {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
        },
        [modalBody]: {
          flex: 1,
          overflow: 'auto',
        },
        [`.${prefixCls}-header`]: {
          cursor: 'default',
        },
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  const { theme, token, hashId } = useToken();
  const wrapSSR = useStyleRegister(
    {
      theme: theme as any,
      token,
      hashId,
      path: ['@hi-talent/design', prefixCls],
    },
    () => [genModalStyle(token, prefixCls)],
  );
  return {
    wrapSSR,
    hashId,
    token,
  };
}
