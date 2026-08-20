import { CSSObject, useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';

const { useToken } = theme;

export const genTableStyle = (
  token: GlobalToken,
  prefixCls: string,
): CSSObject => {
  return {
    [`.${prefixCls}-wrapper`]: {
      position: 'relative',
    },

    [`.${prefixCls}-toolbar`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: token.sizeXS,
      marginBottom: token.sizeSM,
    },

    [`.${prefixCls}-toolbar-extra`]: {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      flex: 1,
    },

    [`.${prefixCls}-toolbar-setting`]: {
      display: 'flex',
      alignItems: 'center',
    },

    [`.${prefixCls}`]: {
      [`&&.${prefixCls}-zebra`]: {
        ['.ant-table-tbody > tr.ant-table-row:nth-child(even) > td']: {
          backgroundColor: token.colorFillQuaternary,
        },
        ['.ant-table-tbody > tr.ant-table-row:hover > td']: {
          backgroundColor: token.colorFillTertiary,
        },
      },

      [`&&.${prefixCls}-no-hover`]: {
        ['.ant-table-tbody > tr.ant-table-row:hover > td']: {
          backgroundColor: 'inherit',
        },
      },

      [`.${prefixCls}-resizable-th`]: {
        '&&::before': {
          display: 'none',
        },
      },

      [`.${prefixCls}-resize-handle`]: {
        position: 'absolute',
        top: 0,
        insetInlineEnd: 0,
        bottom: 0,
        width: 10,
        cursor: 'col-resize',
        zIndex: 10,
        background: 'transparent',
        transition: 'background-color 0.2s',

        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          insetInlineEnd: 0,
          width: 1,
          height: '1.6em',
          transform: 'translateY(-50%)',
          backgroundColor: token.colorBorderSecondary,
          transition: 'all 0.2s',
        },

        [`&:hover::after, &.${prefixCls}-resize-handle-active::after`]: {
          width: 2,
          height: '100%',
          backgroundColor: token.colorPrimary,
        },
      },

      [`.${prefixCls}-drag-handle`]: {
        display: 'flex',
        alignItems: 'center',
        gap: token.sizeXXS,

        [`&:hover .${prefixCls}-drag-handle-wrapper`]: {
          visibility: 'visible',
        },
      },

      [`.${prefixCls}-drag-handle-wrapper`]: {
        flexShrink: 0,
        cursor: 'grab',
        color: token.colorTextQuaternary,
        fontSize: 12,
        visibility: 'hidden',
        transition: 'color 0.2s, visibility 0.2s',
        '&:active': {
          cursor: 'grabbing',
        },
      },

      ['.ant-table-thead > tr > th:hover']: {
        [`.${prefixCls}-drag-handle-wrapper`]: {
          visibility: 'visible',
        },
      },

      [`.${prefixCls}-header-cell`]: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden',

        [`.${prefixCls}-header-cell-title`]: {
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },

      [`.${prefixCls}-row-drag-handle-wrapper`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },

      [`.${prefixCls}-row-drag-handle`]: {
        cursor: 'grab',
        color: token.colorTextTertiary,
        fontSize: 14,
        transition: 'color 0.2s',
        '&:hover': {
          color: token.colorPrimary,
        },
        '&:active': {
          cursor: 'grabbing',
        },
        [`&.${prefixCls}-row-drag-handle-disabled`]: {
          cursor: 'not-allowed',
          color: token.colorTextDisabled,
        },
      },

      [`& .${prefixCls}-row-drag-over-before > td`]: {
        borderTop: `2px solid ${token.colorPrimary}`,
      },

      [`& .${prefixCls}-row-drag-over-after > td`]: {
        borderBottom: `2px solid ${token.colorPrimary}`,
      },

      [`& .${prefixCls}-row-drag-over-inside > td`]: {
        backgroundColor: token.colorPrimaryBg,
        borderTop: `1px dashed ${token.colorPrimary}`,
        borderBottom: `1px dashed ${token.colorPrimary}`,
        '&:first-child': {
          borderInlineStart: `1px dashed ${token.colorPrimary}`,
        },
        '&:last-child': {
          borderInlineEnd: `1px dashed ${token.colorPrimary}`,
        },
      },

      [`.${prefixCls}-drag-container`]: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      },
    },

    [`.${prefixCls}-column-setting-popover-body`]: {
      padding: 0,
      '.ant-popover-title': {
        fontWeight: 400,
        marginBottom: 0,
        fontSize: 14,
        color: token.colorText,
        padding: `${token.sizeXS}px ${token.size}px`,
        borderBottom: `1px solid ${token.colorSplit}`,
      },
    },

    [`.${prefixCls}-column-setting-list`]: {
      width: '100%',
      maxHeight: 300,
      overflowX: 'hidden',
      overflowY: 'auto',
      borderBottom: `1px solid ${token.colorSplit}`,
      padding: `${token.sizeXXS}px 0`,
      display: 'flex',
      flexDirection: 'column',

      '.ant-checkbox-group': {
        padding: `${token.sizeXXS}px 0`,
        display: 'flex',
        flexDirection: 'column',
      },

      '.ant-checkbox-wrapper': {
        width: '100%',
        padding: `${token.sizeXXS}px ${token.size}px`,
        color: token.colorText,
        '&:hover': {
          backgroundColor: token.colorPrimaryBg,
        },
      },
    },

    [`.${prefixCls}-column-setting-item`]: {
      width: '100%',
      padding: `${token.sizeXS}px ${token.size}px`,
      color: token.colorText,
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      overflow: 'hidden',
      '&:hover': {
        backgroundColor: token.colorFillTertiary,
      },
      '.ant-checkbox-wrapper': {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
    },

    [`.${prefixCls}-column-setting-footer`]: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: token.size,
      padding: `${token.sizeXS}px ${token.size}px`,
      borderTop: `1px solid ${token.colorBorderSecondary}`,
    },

    // 拖拽浮层 DragOverlay（Portal 到 body）
    [`.${prefixCls}-drag-overlay`]: {
      table: {
        borderCollapse: 'collapse',
        background: token.colorBgElevated,
        border: `1px dashed ${token.colorPrimary}`,
        boxShadow: token.boxShadowSecondary,
      },
      'th, td': {
        padding: `${token.sizeXS}px ${token.size}px`,
        background: token.colorBgElevated,
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
    () => [genTableStyle(token, prefixCls)],
  );
  return {
    wrapSSR,
    hashId,
    token,
  };
}
