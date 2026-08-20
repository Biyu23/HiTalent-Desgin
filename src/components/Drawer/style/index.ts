import type { CSSObject } from '@ant-design/cssinjs';
import type { GlobalToken } from 'antd/es/theme/interface';
import { useComponentStyle } from '../../../styles';

export const genDrawerStyle = (
  token: GlobalToken,
  prefixCls: string,
): CSSObject => {
  return {
    [`.${prefixCls}`]: {
      [`.${prefixCls}-header-actions`]: {
        '.ant-btn': {
          color: token.colorTextSecondary,
        },
      },

      [`.${prefixCls}-empty-title`]: {
        display: 'inline-block',
      },
    },

    [`.${prefixCls}-wrapper`]: {
      [`&.${prefixCls}-wrapper-resizing`]: {
        transition: 'none',

        [`&.${prefixCls}-wrapper-horizontal`]: {
          willChange: 'width',
        },

        [`&.${prefixCls}-wrapper-vertical`]: {
          willChange: 'height',
        },
      },
    },

    [`.${prefixCls}-resize-handle`]: {
      position: 'absolute',
      zIndex: 2,
      boxSizing: 'border-box',
      background: 'transparent',
      pointerEvents: 'auto',
      userSelect: 'none',
      touchAction: 'none',

      '&::after': {
        content: '""',
        position: 'absolute',
        background: 'transparent',
        transition: 'background-color 0.2s ease, opacity 0.2s ease',
      },

      [`&:hover::after, &.${prefixCls}-resize-handle-resizing::after`]: {
        background: token.colorPrimary,
        opacity: 0.2,
      },

      [`&.${prefixCls}-resize-handle-resizing::after`]: {
        opacity: 0.3,
      },

      [`&.${prefixCls}-resize-handle-left, &.${prefixCls}-resize-handle-right`]:
        {
          top: 0,
          bottom: 0,
          width: 4,
          cursor: 'col-resize',

          '&::after': {
            top: 0,
            right: -3,
            bottom: 0,
            left: -3,
          },
        },

      [`&.${prefixCls}-resize-handle-top, &.${prefixCls}-resize-handle-bottom`]:
        {
          right: 0,
          left: 0,
          height: 4,
          cursor: 'row-resize',

          '&::after': {
            top: -3,
            right: 0,
            bottom: -3,
            left: 0,
          },
        },

      [`&.${prefixCls}-resize-handle-left`]: {
        right: 0,
      },

      [`&.${prefixCls}-resize-handle-right`]: {
        left: 0,
      },

      [`&.${prefixCls}-resize-handle-top`]: {
        bottom: 0,
      },

      [`&.${prefixCls}-resize-handle-bottom`]: {
        top: 0,
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  return useComponentStyle('Drawer', prefixCls, genDrawerStyle);
}
