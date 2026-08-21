/**
 * description: 使用 CSS-in-JS 样式配合 `rootClassName` 或 `classNames` 精准覆盖头部、主体、底部、遮罩、内容区、拖拽把手及最小化操作按钮等样式。
 */
import { useStyleRegister } from '@ant-design/cssinjs';
import {
  AppstoreOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Flex,
  Radio,
  Space,
  Tag,
  theme as antdTheme,
} from 'antd';
import { ConfigContext, Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useContext, useState } from 'react';

type ThemeKey = 'tech-dark-drawer' | 'aurora-glass-drawer' | 'warm-card-drawer';

const messages = {
  'zh-CN': {
    'style.open': '打开定制样式抽屉',
    'style.theme': '主题预设',
    'style.techDark': '科技暗黑 (tech-dark-drawer)',
    'style.auroraGlass': '极光磨砂 (aurora-glass-drawer)',
    'style.warmCard': '温暖卡片 (warm-card-drawer)',
    'style.title': '定制抽屉',
    'style.badge': '样式定制',
    'style.customSlots': '样式控制插槽',
    'style.slotMask': '遮罩层 (mask 插槽)',
    'style.slotContent': '内容容器 (content 插槽)',
    'style.slotHeader': '标题头部 (header 插槽)',
    'style.slotBody': '主体区域 (body 插槽)',
    'style.slotFooter': '底部操作 (footer 插槽)',
    'style.slotDragger': '拖拽把手 (.htd-drawer-resize-handle)',
    'style.slotMinimize': '最小化按钮 (.htd-drawer-header-actions)',
    'style.slotDock': '最小化悬浮卡片 (&.htd-minimize-dock)',
    'style.close': '关闭',
    'style.submit': '确认',
    'style.info':
      '通过向 Drawer 传入 rootClassName，在 CSS-in-JS 中嵌套选择器即可完成全方位的样式定制。',
  },
  'en-US': {
    'style.open': 'Open Styled Drawer',
    'style.theme': 'Theme Preset',
    'style.techDark': 'Tech Dark (tech-dark-drawer)',
    'style.auroraGlass': 'Aurora Glass (aurora-glass-drawer)',
    'style.warmCard': 'Warm Card (warm-card-drawer)',
    'style.title': 'Styled Drawer',
    'style.badge': 'Custom Styled',
    'style.customSlots': 'Style Controlled Slots',
    'style.slotMask': 'Mask Layer (mask slot)',
    'style.slotContent': 'Content Container (content slot)',
    'style.slotHeader': 'Header (header slot)',
    'style.slotBody': 'Body Area (body slot)',
    'style.slotFooter': 'Footer Actions (footer slot)',
    'style.slotDragger': 'Resize Handle (.htd-drawer-resize-handle)',
    'style.slotMinimize': 'Minimize Button (.htd-drawer-header-actions)',
    'style.slotDock': 'Minimized Dock Card (&.htd-minimize-dock)',
    'style.close': 'Close',
    'style.submit': 'Confirm',
    'style.info':
      'Pass rootClassName to Drawer and nest selectors in CSS-in-JS for full-featured styling.',
  },
};

const genDemoThemeStyle = (rootPrefixCls: string, antdPrefixCls: string) => ({
  '.tech-dark-drawer': {
    [`.${antdPrefixCls}-drawer-mask`]: {
      backdropFilter: 'blur(6px)',
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
    },
    [`.${antdPrefixCls}-drawer-content`]: {
      backgroundColor: '#0f172a',
      borderRadius: '16px 0 0 16px',
      boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
      color: '#f8fafc',
    },
    [`.${antdPrefixCls}-drawer-header`]: {
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderBottom: '1px solid rgba(51, 65, 85, 0.7)',
      padding: '16px 24px',
      [`.${antdPrefixCls}-drawer-title`]: {
        color: '#38bdf8',
      },
    },
    [`.${antdPrefixCls}-drawer-body`]: {
      backgroundColor: '#090d16',
      padding: 24,
      color: '#cbd5e1',
    },
    [`.${antdPrefixCls}-drawer-footer`]: {
      backgroundColor: '#0f172a',
      borderTop: '1px solid rgba(51, 65, 85, 0.7)',
      padding: '12px 24px',
    },
    [`.${rootPrefixCls}-drawer-resize-handle`]: {
      backgroundColor: '#38bdf8',
      boxShadow: '0 0 8px rgba(56, 189, 248, 0.6)',
    },
    [`.${rootPrefixCls}-drawer-header-actions .${antdPrefixCls}-btn`]: {
      color: '#38bdf8',
      '&:hover': {
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        color: '#7dd3fc',
      },
    },
    [`&.${rootPrefixCls}-minimize-dock`]: {
      backgroundColor: '#1e293b',
      border: '1px solid #38bdf8',
      borderRadius: 10,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      [`.${rootPrefixCls}-minimize-title`]: {
        color: '#38bdf8',
        fontWeight: 500,
      },
      [`.${rootPrefixCls}-minimize-actions .${antdPrefixCls}-btn`]: {
        color: '#38bdf8',
        '&:hover': {
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          color: '#7dd3fc',
        },
      },
    },
  },
  '.aurora-glass-drawer': {
    [`.${antdPrefixCls}-drawer-mask`]: {
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(30, 27, 75, 0.3)',
    },
    [`.${antdPrefixCls}-drawer-content`]: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px 0 0 16px',
      borderLeft: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: '-8px 0 32px rgba(99, 102, 241, 0.18)',
    },
    [`.${antdPrefixCls}-drawer-header`]: {
      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
      borderBottom: '1px solid #c7d2fe',
      padding: '16px 24px',
      [`.${antdPrefixCls}-drawer-title`]: {
        color: '#4338ca',
      },
    },
    [`.${antdPrefixCls}-drawer-body`]: {
      backgroundColor: 'transparent',
      padding: 24,
    },
    [`.${antdPrefixCls}-drawer-footer`]: {
      backgroundColor: '#eef2ff',
      borderTop: '1px solid #c7d2fe',
      padding: '14px 24px',
    },
    [`.${rootPrefixCls}-drawer-resize-handle`]: {
      backgroundColor: '#6366f1',
    },
    [`.${rootPrefixCls}-drawer-header-actions .${antdPrefixCls}-btn`]: {
      color: '#6366f1',
      '&:hover': {
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        color: '#4338ca',
      },
    },
    [`&.${rootPrefixCls}-minimize-dock`]: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #c7d2fe',
      borderRadius: 10,
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.2)',
      [`.${rootPrefixCls}-minimize-title`]: {
        color: '#4338ca',
        fontWeight: 500,
      },
      [`.${rootPrefixCls}-minimize-actions .${antdPrefixCls}-btn`]: {
        color: '#6366f1',
        '&:hover': {
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          color: '#4338ca',
        },
      },
    },
  },
  '.warm-card-drawer': {
    [`.${antdPrefixCls}-drawer-mask`]: {
      backdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(68, 64, 60, 0.25)',
    },
    [`.${antdPrefixCls}-drawer-content`]: {
      backgroundColor: '#fff',
      borderRadius: '20px 0 0 20px',
      borderLeft: '1px solid #fde68a',
      boxShadow: '-10px 0 35px rgba(217, 119, 6, 0.12)',
    },
    [`.${antdPrefixCls}-drawer-header`]: {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderBottom: '1px solid #fde68a',
      padding: '16px 24px',
      [`.${antdPrefixCls}-drawer-title`]: {
        color: '#b45309',
      },
    },
    [`.${antdPrefixCls}-drawer-body`]: {
      backgroundColor: '#fffdfa',
      padding: 24,
    },
    [`.${antdPrefixCls}-drawer-footer`]: {
      backgroundColor: '#fffbeb',
      borderTop: '1px solid #fde68a',
      padding: '14px 24px',
    },
    [`.${rootPrefixCls}-drawer-resize-handle`]: {
      backgroundColor: '#f59e0b',
    },
    [`.${rootPrefixCls}-drawer-header-actions .${antdPrefixCls}-btn`]: {
      color: '#d97706',
      '&:hover': {
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        color: '#b45309',
      },
    },
    [`&.${rootPrefixCls}-minimize-dock`]: {
      backgroundColor: '#fff',
      border: '1px solid #fde68a',
      borderRadius: 10,
      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.15)',
      [`.${rootPrefixCls}-minimize-title`]: {
        color: '#b45309',
        fontWeight: 500,
      },
      [`.${rootPrefixCls}-minimize-actions .${antdPrefixCls}-btn`]: {
        color: '#d97706',
        '&:hover': {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#b45309',
        },
      },
    },
  },
});

export default () => {
  const { t } = useDemoIntl(messages);
  const { prefixCls: rootPrefixCls, antdPrefixCls = 'ant' } =
    useContext(ConfigContext);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>('tech-dark-drawer');
  const { theme: tokenTheme, token, hashId } = antdTheme.useToken();
  const wrapSSR = useStyleRegister(
    {
      theme: tokenTheme,
      token,
      hashId,
      path: ['demo-drawer-themes', rootPrefixCls, antdPrefixCls],
    },
    () => [genDemoThemeStyle(rootPrefixCls, antdPrefixCls)],
  );

  const isDark = theme === 'tech-dark-drawer';

  return wrapSSR(
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { label: t('style.techDark'), value: 'tech-dark-drawer' },
            { label: t('style.auroraGlass'), value: 'aurora-glass-drawer' },
            { label: t('style.warmCard'), value: 'warm-card-drawer' },
          ]}
        />
        <Button
          type="primary"
          icon={<BgColorsOutlined />}
          onClick={() => setOpen(true)}
        >
          {t('style.open')}
        </Button>
      </Flex>

      <Drawer
        rootClassName={theme}
        title={
          <Flex align="center" gap={8}>
            <SettingOutlined
              style={{ color: isDark ? '#38bdf8' : undefined }}
            />
            <span>{t('style.title')}</span>
            <Tag color={isDark ? 'cyan' : 'purple'}>{t('style.badge')}</Tag>
          </Flex>
        }
        open={open}
        resizable
        minimizable
        defaultSize={460}
        onClose={() => setOpen(false)}
        footer={
          <Flex justify="space-between" align="center">
            <Tag icon={<CheckCircleOutlined />} color="success">
              .{theme}
            </Tag>
            <Space>
              <Button size="small" onClick={() => setOpen(false)}>
                {t('style.close')}
              </Button>
              <Button
                size="small"
                type="primary"
                onClick={() => setOpen(false)}
              >
                {t('style.submit')}
              </Button>
            </Space>
          </Flex>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card
            size="small"
            style={{
              background: isDark ? 'rgba(30, 41, 59, 0.6)' : undefined,
              borderColor: isDark ? '#334155' : undefined,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              💡 {t('style.info')}
            </p>
          </Card>

          <div>
            <h4
              style={{
                color: isDark ? '#f1f5f9' : undefined,
                marginBottom: 12,
              }}
            >
              <AppstoreOutlined style={{ marginRight: 8 }} />
              {t('style.customSlots')}
            </h4>
            <Descriptions
              column={1}
              size="small"
              bordered
              contentStyle={{ color: isDark ? '#cbd5e1' : undefined }}
              labelStyle={{
                width: '52%',
                fontWeight: 500,
                color: isDark ? '#94a3b8' : undefined,
                background: isDark ? 'rgba(30, 41, 59, 0.4)' : undefined,
              }}
            >
              <Descriptions.Item label={t('style.slotMask')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                backdrop-filter, background-color
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotContent')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                border-radius, box-shadow, background
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotHeader')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background, border-bottom, padding
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotBody')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background-color, padding, color
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotFooter')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                border-top, background-color, padding
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotDragger')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background-color, box-shadow
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotMinimize')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                color, hover background
              </Descriptions.Item>
              <Descriptions.Item label={t('style.slotDock')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background-color, border, border-radius, box-shadow
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      </Drawer>
    </Space>,
  );
};
