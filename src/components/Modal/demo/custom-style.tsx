/**
 * description: 使用 Less 样式文件配合 `rootClassName` 或 `classNames` 精准覆盖头部、主体、底部、遮罩、容器卡片及窗口缩放手柄与操作图标等样式。
 */
import {
  AppstoreOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  LaptopOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Flex,
  Radio,
  Space,
  Tag,
  Typography,
} from 'antd';
import { Modal } from 'hi-talent-design';
import { useDemoIntl } from 'hi-talent-design/demoIntl';
import React, { useState } from 'react';
import './custom-style.less';

type ModalThemeKey =
  | 'tech-dark-modal'
  | 'aurora-glass-modal'
  | 'warm-card-modal';

const messages = {
  'zh-CN': {
    'modalStyle.open': '打开 Less 样式弹窗',
    'modalStyle.theme': 'Less 主题预设',
    'modalStyle.techDark': '科技暗黑 (tech-dark-modal)',
    'modalStyle.auroraGlass': '极光磨砂 (aurora-glass-modal)',
    'modalStyle.warmCard': '温暖卡片 (warm-card-modal)',
    'modalStyle.title': 'Less 控制弹窗样式',
    'modalStyle.badge': 'Less 控制',
    'modalStyle.info':
      '通过向 Modal 传入 rootClassName，在外部 Less 文件中嵌套选择器即可完成全方位的视觉定制。',
    'modalStyle.slotsTitle': 'Less 样式控制插槽',
    'modalStyle.slotMask': '遮罩层 (.ant-modal-mask)',
    'modalStyle.slotContent': '容器卡片 (.ant-modal-content)',
    'modalStyle.slotHeader': '标题头部 (.ant-modal-header)',
    'modalStyle.slotBody': '内容主体 (.ant-modal-body)',
    'modalStyle.slotFooter': '操作底部 (.ant-modal-footer)',
    'modalStyle.slotActions': '窗口操作图标 (.ht-modal-actions)',
    'modalStyle.slotResize': '缩放手柄 (.ht-modal-resize-handle)',
    'modalStyle.slotDock': '最小化悬浮卡片 (&.ht-minimize-dock)',
    'modalStyle.cancel': '取消',
    'modalStyle.confirm': '确认生效',
    'modalStyle.demoContent':
      '当前弹窗同时开启了拖拽移动（draggable）、右下角缩放（resizable）、最大化（maximizable）与最小化（minimizable）。',
  },
  'en-US': {
    'modalStyle.open': 'Open Less Styled Modal',
    'modalStyle.theme': 'Less Theme Preset',
    'modalStyle.techDark': 'Tech Dark (tech-dark-modal)',
    'modalStyle.auroraGlass': 'Aurora Glass (aurora-glass-modal)',
    'modalStyle.warmCard': 'Warm Card (warm-card-modal)',
    'modalStyle.title': 'Less Controlled Modal',
    'modalStyle.badge': 'Controlled by Less',
    'modalStyle.info':
      'Pass rootClassName to Modal and nest selectors in an external Less file for full-featured visual customization.',
    'modalStyle.slotsTitle': 'Less Style Controlled Slots',
    'modalStyle.slotMask': 'Mask Layer (.ant-modal-mask)',
    'modalStyle.slotContent': 'Container Card (.ant-modal-content)',
    'modalStyle.slotHeader': 'Header (.ant-modal-header)',
    'modalStyle.slotBody': 'Body Area (.ant-modal-body)',
    'modalStyle.slotFooter': 'Footer Actions (.ant-modal-footer)',
    'modalStyle.slotActions': 'Window Action Icons (.ht-modal-actions)',
    'modalStyle.slotResize': 'Resize Handle (.ht-modal-resize-handle)',
    'modalStyle.slotDock': 'Minimized Dock Card (&.ht-minimize-dock)',
    'modalStyle.cancel': 'Cancel',
    'modalStyle.confirm': 'Confirm',
    'modalStyle.demoContent':
      'This modal combines draggable, resizable, maximizable, and minimizable capabilities.',
  },
};

export default () => {
  const { t } = useDemoIntl(messages);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ModalThemeKey>('tech-dark-modal');

  const isDark = theme === 'tech-dark-modal';

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Flex gap={12} align="center" wrap="wrap">
        <Radio.Group
          optionType="button"
          buttonStyle="solid"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          options={[
            { label: t('modalStyle.techDark'), value: 'tech-dark-modal' },
            { label: t('modalStyle.auroraGlass'), value: 'aurora-glass-modal' },
            { label: t('modalStyle.warmCard'), value: 'warm-card-modal' },
          ]}
        />
        <Button
          type="primary"
          icon={<BgColorsOutlined />}
          onClick={() => setOpen(true)}
        >
          {t('modalStyle.open')}
        </Button>
      </Flex>

      <Modal
        rootClassName={theme}
        title={
          <Flex align="center" gap={8}>
            <LaptopOutlined style={{ color: isDark ? '#38bdf8' : undefined }} />
            <span>{t('modalStyle.title')}</span>
            <Tag color={isDark ? 'cyan' : 'purple'}>
              {t('modalStyle.badge')}
            </Tag>
          </Flex>
        }
        open={open}
        width={620}
        draggable
        resizable
        maximizable
        minimizable
        onCancel={() => setOpen(false)}
        footer={
          <Flex justify="space-between" align="center">
            <Tag icon={<CheckCircleOutlined />} color="success">
              .{theme}
            </Tag>
            <Space>
              <Button onClick={() => setOpen(false)}>
                {t('modalStyle.cancel')}
              </Button>
              <Button type="primary" onClick={() => setOpen(false)}>
                {t('modalStyle.confirm')}
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
            <Typography.Text
              style={{
                fontSize: 13,
                color: isDark ? '#94a3b8' : '#64748b',
                display: 'block',
                marginBottom: 6,
              }}
            >
              💡 {t('modalStyle.info')}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: 12,
                color: isDark ? '#64748b' : '#94a3b8',
              }}
            >
              ✨ {t('modalStyle.demoContent')}
            </Typography.Text>
          </Card>

          <div>
            <h4
              style={{
                color: isDark ? '#f1f5f9' : undefined,
                marginBottom: 12,
              }}
            >
              <AppstoreOutlined style={{ marginRight: 8 }} />
              {t('modalStyle.slotsTitle')}
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
              <Descriptions.Item label={t('modalStyle.slotMask')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                backdrop-filter, background-color
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotContent')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                border-radius, box-shadow, border, background
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotHeader')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background, border-bottom, padding, color
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotBody')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background-color, padding, color
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotFooter')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                border-top, background-color, padding
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotActions')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                color, hover background
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotResize')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                border-color
              </Descriptions.Item>
              <Descriptions.Item label={t('modalStyle.slotDock')}>
                <CodeOutlined style={{ marginRight: 4 }} />
                background-color, border, border-radius, box-shadow
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Space>
      </Modal>
    </Space>
  );
};
