import { CSSObject, useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';

const { useToken } = theme;

export const genPopoverSelectStyle = (
  token: GlobalToken,
  prefixCls: string,
): CSSObject => {
  return {
    [`.${prefixCls}`]: {
      display: 'inline-block',
      maxWidth: '100%',
    },

    [`.${prefixCls}-selector-btn`]: {
      display: 'flex',
      gap: token.sizeXS,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      boxSizing: 'border-box',
      padding: `${token.sizeXXS}px ${token.sizeSM}px`,
      color: token.colorText,
      textAlign: 'left',
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      borderRadius: token.borderRadiusXS,
      transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      '&:hover': {
        backgroundColor: token.colorFillTertiary,
      },
      [`&.${prefixCls}-selector-btn-active`]: {
        color: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
        border: `1px solid ${token.colorPrimaryBorder}`,
      },
      [`&.${prefixCls}-selector-btn-open`]: {
        backgroundColor: token.colorFillTertiary,
      },
      [`&.${prefixCls}-selector-btn-disabled`]: {
        color: token.colorTextDisabled,
        cursor: 'not-allowed',
        backgroundColor: 'transparent',
        border: '1px solid transparent',
      },
    },

    [`.${prefixCls}-selector-text`]: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      color: 'inherit',
      lineHeight: 'inherit',
      textAlign: 'start',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      '.ant-typography': {
        marginTop: '0 !important',
        marginBottom: '0 !important',
      },
      '> span': {
        display: 'inline-block',
        maxWidth: '100%',
        overflow: 'hidden',
        verticalAlign: 'bottom',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
    },

    [`.${prefixCls}-selector-actions`]: {
      position: 'relative',
      display: 'inline-flex',
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 14,
      height: 14,
      fontSize: 12,
      lineHeight: 1,
    },

    [`.${prefixCls}-selector-arrow`]: {
      flexShrink: 0,
      color: token.colorTextQuaternary,
      fontSize: 12,
      transition: 'transform 0.3s ease-in-out, opacity 0.2s',
    },

    [`.${prefixCls}-selector-clear`]: {
      zIndex: 1,
      flexShrink: 0,
      color: token.colorTextQuaternary,
      fontSize: 12,
      cursor: 'pointer',
      transition: 'color 0.2s, opacity 0.2s',
      [`&.${prefixCls}-selector-clear-overlay`]: {
        position: 'absolute',
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        opacity: 0,
        pointerEvents: 'none',
      },
      '&:hover': {
        color: token.colorTextTertiary,
      },
    },

    [`.${prefixCls}-selector-btn:hover .${prefixCls}-selector-clear-overlay`]: {
      opacity: 1,
      pointerEvents: 'auto',
    },

    [`.${prefixCls}-selector`]: {
      '.ant-popover-inner': {
        padding: 0,
      },
      [`.${prefixCls}-dropdown`]: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: 150,
      },
      [`.${prefixCls}-menu`]: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        overflowY: 'auto',
      },
      [`.${prefixCls}-menu-scroll`]: {
        overflowY: 'auto',
      },
      [`.${prefixCls}-menu-virtual-list`]: {
        overflowY: 'auto',
      },
      [`.${prefixCls}-menu-radio`]: {
        display: 'flex',
        alignItems: 'center',
        padding: `${token.sizeXXS}px ${token.sizeSM}px`,
        cursor: 'pointer',
        color: token.colorText,
        transition: 'background-color 0.2s',
        userSelect: 'none',
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
        [`&.${prefixCls}-menu-radio-active`]: {
          color: token.colorPrimary,
          backgroundColor: token.colorPrimaryBg,
        },
        [`&.${prefixCls}-menu-radio-disabled`]: {
          color: token.colorTextDisabled,
          cursor: 'not-allowed',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
      [`.${prefixCls}-menu-checkbox`]: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        margin: 0,
        padding: `${token.sizeXXS}px ${token.sizeSM}px`,
        color: token.colorText,
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
        '> span:last-child': {
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        },
      },
      [`.${prefixCls}-menu-item-text`]: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      },
      [`.${prefixCls}-footer`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: `${token.sizeSM}px`,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      },
      [`.${prefixCls}-search`]: {
        padding: `${token.sizeXS}px ${token.sizeXS}px 0 ${token.sizeXS}px`,
        '.ant-input-affix-wrapper .anticon': {
          color: token.colorTextQuaternary,
        },
      },
      [`.${prefixCls}-select-all`]: {
        padding: `${token.sizeXXS}px ${token.sizeSM}px`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        '.ant-checkbox-wrapper': {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          margin: 0,
          '> span:first-child': {
            flexShrink: 0,
          },
          '> span:last-child': {
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        },
      },
      [`.${prefixCls}-empty`]: {
        padding: `${token.sizeLG}px ${token.sizeSM}px`,
        textAlign: 'center',
        '.ant-empty-image': {
          height: 40,
          marginBottom: token.sizeXS,
          '.ant-empty-img-simple': {
            width: 40,
            height: 40,
          },
        },
        '.ant-empty-description': {
          color: token.colorText,
          fontSize: 13,
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
    () => [genPopoverSelectStyle(token, prefixCls)],
  );
  return {
    wrapSSR,
    hashId,
    token,
  };
}
