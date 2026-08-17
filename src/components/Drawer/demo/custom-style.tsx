/**
 * description: 使用 Less 样式文件配合 `rootClassName` 或 `classNames` 精准覆盖头部、主体、底部、遮罩、内容区、拖拽把手及最小化操作按钮等样式。
 */
import {
  AppstoreOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Card, Descriptions, Flex, Radio, Space, Tag } from 'antd';
import { Drawer } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import './custom-style.less';

type ThemeKey = 'tech-dark-drawer' | 'aurora-glass-drawer' | 'warm-card-drawer';

const messages = {
  'zh-CN': {
    'style.open': '打开 Less 样式抽屉',
    'style.theme': 'Less 主题预设',
    'style.techDark': '科技暗黑 (tech-dark-drawer)',
    'style.auroraGlass': '极光磨砂 (aurora-glass-drawer)',
    'style.warmCard': '温暖卡片 (warm-card-drawer)',
    'style.title': 'Less 定制抽屉',
    'style.badge': 'Less 控制',
    'style.customSlots': 'Less 样式控制插槽',
    'style.slotMask': '遮罩层 (.ant-drawer-mask)',
    'style.slotContent': '内容容器 (.ant-drawer-content)',
    'style.slotHeader': '标题头部 (.ant-drawer-header)',
    'style.slotBody': '主体区域 (.ant-drawer-body)',
    'style.slotFooter': '底部操作 (.ant-drawer-footer)',
    'style.slotDragger': '拖拽把手 (.ht-drawer-resize-handle)',
    'style.slotMinimize': '最小化按钮 (.ht-drawer-header-actions)',
    'style.slotDock': '最小化悬浮卡片 (&.ht-minimize-dock)',
    'style.close': '关闭',
    'style.submit': '确认',
    'style.info':
      '通过向 Drawer 传入 rootClassName，在外部 Less 文件中嵌套选择器即可完成全方位的样式定制。',
  },
  'en-US': {
    'style.open': 'Open Less Styled Drawer',
    'style.theme': 'Less Theme Preset',
    'style.techDark': 'Tech Dark (tech-dark-drawer)',
    'style.auroraGlass': 'Aurora Glass (aurora-glass-drawer)',
    'style.warmCard': 'Warm Card (warm-card-drawer)',
    'style.title': 'Less Styled Drawer',
    'style.badge': 'Controlled by Less',
    'style.customSlots': 'Less Style Controlled Slots',
    'style.slotMask': 'Mask Layer (.ant-drawer-mask)',
    'style.slotContent': 'Content Container (.ant-drawer-content)',
    'style.slotHeader': 'Header (.ant-drawer-header)',
    'style.slotBody': 'Body Area (.ant-drawer-body)',
    'style.slotFooter': 'Footer Actions (.ant-drawer-footer)',
    'style.slotDragger': 'Resize Handle (.ht-drawer-resize-handle)',
    'style.slotMinimize': 'Minimize Button (.ht-drawer-header-actions)',
    'style.slotDock': 'Minimized Dock Card (&.ht-minimize-dock)',
    'style.close': 'Close',
    'style.submit': 'Confirm',
    'style.info':
      'Pass rootClassName to Drawer and nest selectors in an external Less file for full-featured styling.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>('tech-dark-drawer');

  const isDark = theme === 'tech-dark-drawer';

  return (
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
    </Space>
  );
};
