import type { CSSObject } from '@ant-design/cssinjs';
import { Keyframes } from '@ant-design/cssinjs';
import type { GlobalToken } from 'antd/es/theme/interface';
import { useComponentStyle } from '../../../../styles';

const minimizeDockIn = new Keyframes('minimizeDockIn', {
  from: {
    opacity: 0,
    transform: 'translateY(20px) scale(0.95)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
});

export const genMinimizeStyle = (
  token: GlobalToken,
  prefixCls: string,
  antdPrefixCls = 'ant',
): CSSObject => {
  return {
    [`.${prefixCls}-container`]: {
      position: 'fixed',
      zIndex: token.zIndexPopupBase ? token.zIndexPopupBase + 100 : 1000,
      display: 'flex',
      pointerEvents: 'none',

      [`&.${prefixCls}-container-bottom-right`]: {
        right: 0,
        bottom: 0,
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-end',
          flexDirection: 'column-reverse',
          maskImage:
            'linear-gradient(to bottom, transparent, black 28px, black 100%)',
        },
      },
      [`&.${prefixCls}-container-bottom-left`]: {
        bottom: 0,
        left: 0,
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-start',
          flexDirection: 'column-reverse',
          maskImage:
            'linear-gradient(to bottom, transparent, black 28px, black 100%)',
        },
      },
      [`&.${prefixCls}-container-bottom`]: {
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'center',
          flexDirection: 'column-reverse',
          maskImage:
            'linear-gradient(to bottom, transparent, black 28px, black 100%)',
        },
      },
      [`&.${prefixCls}-container-top-right`]: {
        top: 0,
        right: 0,
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-end',
          flexDirection: 'column',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - 28px), transparent)',
        },
      },
      [`&.${prefixCls}-container-top-left`]: {
        top: 0,
        left: 0,
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-start',
          flexDirection: 'column',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - 28px), transparent)',
        },
      },
      [`&.${prefixCls}-container-top`]: {
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'center',
          flexDirection: 'column',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - 28px), transparent)',
        },
      },
      [`&.${prefixCls}-container-left`]: {
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-start',
          flexDirection: 'column',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - 28px), transparent)',
        },
      },
      [`&.${prefixCls}-container-right`]: {
        top: '50%',
        right: 0,
        transform: 'translateY(-50%)',
        [`.${prefixCls}-scroll-wrapper`]: {
          alignItems: 'flex-end',
          flexDirection: 'column',
          maskImage:
            'linear-gradient(to bottom, black, black calc(100% - 28px), transparent)',
        },
      },
    },

    [`.${prefixCls}-scroll-wrapper`]: {
      boxSizing: 'border-box',
      display: 'flex',
      width: '100vw',
      minWidth: '100vw',
      height: '100vh',
      minHeight: '100vh',
      flexShrink: 0,
      gap: token.sizeSM,
      padding: token.sizeLG,
      overflowY: 'auto',
      pointerEvents: 'none',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',

      '&::-webkit-scrollbar': {
        display: 'none',
      },
    },

    [`.${prefixCls}-dock`]: {
      width: 280,
      overflow: 'hidden',
      flexShrink: 0,
      pointerEvents: 'auto',
      background: token.colorBgElevated,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadiusSM || 4,
      boxShadow: token.boxShadow,
      animationName: minimizeDockIn,
      animationDuration: token.motionDurationSlow || '0.3s',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',

      [`& .${prefixCls}-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${token.sizeSM}px ${token.size}px`,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      },

      [`& .${prefixCls}-title`]: {
        flex: 1,
        overflow: 'hidden',
        marginInlineEnd: token.sizeSM,
      },

      [`& .${prefixCls}-actions`]: {
        flexShrink: 0,
        [`.${antdPrefixCls}-btn`]: {
          color: token.colorTextSecondary,
        },
      },
    },
  };
};

export function useStyle(prefixCls: string, antdPrefixCls = 'ant') {
  return useComponentStyle(
    'MinimizedDock',
    prefixCls,
    (token, currentPrefixCls) =>
      genMinimizeStyle(token, currentPrefixCls, antdPrefixCls),
  );
}
