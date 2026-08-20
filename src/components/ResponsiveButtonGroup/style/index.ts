import type { CSSObject } from '@ant-design/cssinjs';
import type { GlobalToken } from 'antd/es/theme/interface';
import { useComponentStyle } from '../../../styles';

export const genResponsiveButtonGroupStyle = (
  token: GlobalToken,
  prefixCls: string,
): CSSObject => {
  return {
    [`.${prefixCls}`]: {
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      width: '100%',
      minWidth: 0,

      [`.${prefixCls}-visible`]: {
        display: 'flex',
        flex: '0 0 auto',
        flexWrap: 'nowrap',
        alignItems: 'center',
        minWidth: 'max-content',
      },

      [`.${prefixCls}-overflow-trigger, .${prefixCls}-overflow-label`]: {
        display: 'inline-flex',
        alignItems: 'center',
      },

      [`.${prefixCls}-overflow-trigger`]: {
        flex: '0 0 auto',
      },

      [`.${prefixCls}-overflow-count`]: {
        marginInlineStart: token.sizeXXS,
      },

      [`.${prefixCls}-overflow-arrow`]: {
        marginInlineStart: token.sizeXXS,
        fontSize: 10,
      },

      [`.${prefixCls}-measure`]: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        display: 'flex',
        width: 0,
        maxWidth: 0,
        height: 0,
        overflow: 'hidden',
        visibility: 'hidden',
        pointerEvents: 'none',
        contain: 'strict',
      },

      [`.${prefixCls}-measure-item`]: {
        display: 'inline-flex',
        flex: '0 0 auto',
      },
      [`.${prefixCls}-menu-item-content, .${prefixCls}-menu-item-icon`]: {
        display: 'inline-flex',
        alignItems: 'center',
      },

      [`.${prefixCls}-menu-item-content`]: {
        gap: token.sizeSM,
        width: '100%',
      },

      [`.${prefixCls}-menu-item-icon`]: {
        flex: '0 0 auto',
      },

      [`.${prefixCls}-menu-item-label`]: {
        minWidth: 0,
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  return useComponentStyle(
    'ResponsiveButtonGroup',
    prefixCls,
    genResponsiveButtonGroupStyle,
  );
}
