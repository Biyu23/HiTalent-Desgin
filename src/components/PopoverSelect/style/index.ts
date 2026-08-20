import type { CSSObject } from '@ant-design/cssinjs';
import type { GlobalToken } from 'antd/es/theme/interface';
import { useComponentStyle } from '../../../styles';

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
      gap: token.paddingXS,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      boxSizing: 'border-box',
      padding: `${token.paddingXXS}px ${token.paddingSM}px`,
      color: token.colorText,
      textAlign: 'left',
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      borderRadius: token.borderRadiusXS,
      transition: `color ${token.motionDurationMid} ${token.motionEaseInOut}, background-color ${token.motionDurationMid} ${token.motionEaseInOut}, border-color ${token.motionDurationMid} ${token.motionEaseInOut}`,
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
        [`.${prefixCls}-selector-arrow`]: {
          transform: 'rotate(180deg)',
        },
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
        margin: 0,
        padding: 0,
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
      minWidth: token.fontSizeSM,
      height: token.fontSizeSM,
      fontSize: token.fontSizeSM,
      lineHeight: 1,
    },

    [`.${prefixCls}-selector-arrow`]: {
      flexShrink: 0,
      color: token.colorTextQuaternary,
      fontSize: token.fontSizeSM,
      transition: `transform ${token.motionDurationMid} ${token.motionEaseInOut}, opacity ${token.motionDurationMid}`,
    },

    [`.${prefixCls}-selector-clear`]: {
      zIndex: 1,
      flexShrink: 0,
      color: token.colorTextQuaternary,
      fontSize: token.fontSizeSM,
      cursor: 'pointer',
      transition: `color ${token.motionDurationMid}, opacity ${token.motionDurationMid}`,
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

    [`.${prefixCls}-selector-btn:hover .${prefixCls}-selector-arrow-has-clear`]:
      {
        opacity: 0,
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
        padding: `${token.paddingXXS}px ${token.paddingSM}px`,
        cursor: 'pointer',
        color: token.colorText,
        transition: `background-color ${token.motionDurationMid}`,
        userSelect: 'none',
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
        [`&.${prefixCls}-menu-radio-active`]: {
          color: token.colorPrimary,
          backgroundColor: token.colorPrimaryBg,
          '&:hover': {
            backgroundColor: token.colorPrimaryBgHover || token.colorPrimaryBg,
          },
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
        padding: `${token.paddingXXS}px ${token.paddingSM}px`,
        color: token.colorText,
        transition: `background-color ${token.motionDurationMid}`,
        '&:hover': {
          backgroundColor: token.colorFillTertiary,
        },
        '&.ant-checkbox-wrapper-disabled, &[disabled]': {
          cursor: 'not-allowed',
          '&:hover': {
            backgroundColor: 'transparent',
          },
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
        padding: token.paddingSM,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      },
      [`.${prefixCls}-search`]: {
        padding: `${token.paddingXS}px ${token.paddingXS}px 0 ${token.paddingXS}px`,
        '.ant-input-affix-wrapper .anticon': {
          color: token.colorTextQuaternary,
        },
      },
      [`.${prefixCls}-select-all`]: {
        padding: `${token.paddingXXS}px ${token.paddingSM}px`,
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
        padding: `${token.paddingLG}px ${token.paddingSM}px`,
        textAlign: 'center',
        '.ant-empty-image': {
          height: 40,
          marginBottom: token.marginXS,
          '.ant-empty-img-simple': {
            width: 40,
            height: 40,
          },
        },
        '.ant-empty-description': {
          color: token.colorText,
          fontSize: token.fontSizeSM,
        },
      },
    },
  };
};

export function useStyle(prefixCls: string) {
  return useComponentStyle('PopoverSelect', prefixCls, genPopoverSelectStyle);
}
