import { CheckOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useIntl, usePrefersColor, useSiteData } from 'dumi';
import type { FC } from 'react';
import React from 'react';
import './index.less';

const IconDark: FC = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M8.218 1.455c3.527.109 6.327 3.018 6.327 6.545 0 3.6-2.945 6.545-6.545 6.545a6.562 6.562 0 0 1-6.036-4h.218c3.6 0 6.545-2.945 6.545-6.545 0-.91-.182-1.745-.509-2.545m0-1.455c-.473 0-.909.218-1.2.618-.29.4-.327.946-.145 1.382.254.655.4 1.31.4 2 0 2.8-2.291 5.09-5.091 5.09h-.218c-.473 0-.91.22-1.2.62-.291.4-.328.945-.146 1.38C1.891 14.074 4.764 16 8 16c4.4 0 8-3.6 8-8a7.972 7.972 0 0 0-7.745-8h-.037Z" />
  </svg>
);

const IconLight: FC = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M8 13a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM8 3a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm7 4a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM3 8a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm9.95 3.536.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414Zm-9.9-7.072-.707-.707a1 1 0 0 1 1.414-1.414l.707.707A1 1 0 0 1 3.05 4.464Zm9.9 0a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707Zm-9.9 7.072a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707ZM8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const IconAuto: FC = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    aria-hidden="true"
    fill="currentColor"
  >
    <path d="M14.595 8a6.595 6.595 0 1 1-13.19 0 6.595 6.595 0 0 1 13.19 0ZM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 2.014v11.972A5.986 5.986 0 0 0 8 2.014Z" />
  </svg>
);

type ColorType = 'light' | 'dark' | 'auto';

const ICON_MAPPING: Record<ColorType, FC> = {
  light: IconLight,
  dark: IconDark,
  auto: IconAuto,
};

const ColorSwitch: FC = () => {
  const { themeConfig } = useSiteData();
  const defaultColor =
    (themeConfig.prefersColor?.default as ColorType) || 'auto';
  const intl = useIntl();
  const [, prefersColor = defaultColor, setPrefersColor] = usePrefersColor();

  const Icon = ICON_MAPPING[prefersColor as ColorType] || ICON_MAPPING.auto;
  const currentTitle = intl.formatMessage({
    id: `header.color.mode.${prefersColor}`,
  });

  const menuItems: MenuProps['items'] = [
    {
      key: 'light',
      label: (
        <div className="htd-color-menu-item">
          <span className="htd-color-menu-icon">
            <IconLight />
          </span>
          <span className="htd-color-menu-text">
            {intl.formatMessage({ id: 'header.color.mode.light' })}
          </span>
          {prefersColor === 'light' && (
            <CheckOutlined className="htd-color-menu-check" />
          )}
        </div>
      ),
    },
    {
      key: 'dark',
      label: (
        <div className="htd-color-menu-item">
          <span className="htd-color-menu-icon">
            <IconDark />
          </span>
          <span className="htd-color-menu-text">
            {intl.formatMessage({ id: 'header.color.mode.dark' })}
          </span>
          {prefersColor === 'dark' && (
            <CheckOutlined className="htd-color-menu-check" />
          )}
        </div>
      ),
    },
    {
      key: 'auto',
      label: (
        <div className="htd-color-menu-item">
          <span className="htd-color-menu-icon">
            <IconAuto />
          </span>
          <span className="htd-color-menu-text">
            {intl.formatMessage({ id: 'header.color.mode.auto' })}
          </span>
          {prefersColor === 'auto' && (
            <CheckOutlined className="htd-color-menu-check" />
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      overlayClassName="htd-color-dropdown"
      menu={{
        items: menuItems,
        selectedKeys: [prefersColor],
        onClick: ({ key }) => {
          setPrefersColor(key as ColorType);
        },
      }}
      trigger={['click']}
      placement="bottomRight"
    >
      <button
        type="button"
        className="dumi-default-color-switch htd-color-switch-btn"
        title={currentTitle}
        aria-label={currentTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="htd-color-switch-icon">
          <Icon />
        </span>
      </button>
    </Dropdown>
  );
};

export default ColorSwitch;
