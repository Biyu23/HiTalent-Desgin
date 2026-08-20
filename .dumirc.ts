import { defineConfig } from 'dumi';
import path from 'path';

const zhNav = [
  { title: '首页', link: '/' },
  { title: '指南', link: '/guide' },
  { title: '组件', link: '/components/button' },
  { title: 'Hooks', link: '/hooks/use-merge-state' },
];

const enNav = [
  { title: 'Home', link: '/en-US' },
  { title: 'Guide', link: '/en-US/guide' },
  { title: 'Components', link: '/en-US/components/button' },
  { title: 'Hooks', link: '/en-US/hooks/use-merge-state' },
];

export default defineConfig({
  outputPath: 'docs-dist',
  favicons: ['/favicon.svg'],
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  alias: {
    'hi-talent-design': path.resolve(__dirname, 'src'),
  },
  resolve: {
    entryFile: './src/index.ts',
    atomDirs: [
      { type: 'component', dir: 'src/components' },
      {
        type: 'component',
        subType: 'config-provider',
        dir: 'src/configProvider',
      },
    ],
  },
  themeConfig: {
    name: 'HiTalent Design',
    logo: false,
    prefersColor: {
      default: 'auto',
      switch: true,
    },
    theme: {
      '@c-primary': '#1677ff',
    },
    nav: {
      'zh-CN': zhNav,
      'en-US': enNav,
    },
    footer: 'HiTalent Design',
    socialLinks: {
      github: 'https://github.com/biyu23/hi-talent-design',
    },
    sidebar: {
      '/guide': [
        {
          title: '开始使用',
          children: [
            { title: '介绍', link: '/guide' },
            { title: '安装', link: '/guide/installation' },
            { title: '快速开始', link: '/guide/quick-start' },
            { title: '全局配置', link: '/guide/global-config' },
          ],
        },
      ],
      '/en-US/guide': [
        {
          title: 'Getting Started',
          children: [
            { title: 'Introduction', link: '/en-US/guide' },
            { title: 'Installation', link: '/en-US/guide/installation' },
            { title: 'Quick Start', link: '/en-US/guide/quick-start' },
            {
              title: 'Global Configuration',
              link: '/en-US/guide/global-config',
            },
          ],
        },
      ],
      '/components': [
        {
          title: '通用',
          children: [
            { title: 'Button 按钮', link: '/components/button' },
            {
              title: 'ResponsiveButtonGroup 响应式按钮组',
              link: '/components/responsive-button-group',
            },
            {
              title: 'SvgIcon 自定义图标【废弃】',
              link: '/components/svg-icon',
            },
          ],
        },
        {
          title: '数据录入',
          children: [
            {
              title: 'PopoverSelect 气泡选择',
              link: '/components/popover-select',
            },
          ],
        },
        {
          title: '数据展示',
          children: [{ title: 'Table 增强表格', link: '/components/table' }],
        },
        {
          title: '反馈与窗口',
          children: [
            { title: 'Drawer 抽屉', link: '/components/drawer' },
            { title: 'Modal 高级弹窗', link: '/components/modal' },
          ],
        },
        {
          title: '导航',
          children: [],
        },
        {
          title: '全局配置',
          children: [
            {
              title: 'ConfigProvider 全局配置',
              link: '/components/config-provider',
            },
          ],
        },
      ],
      '/en-US/components': [
        {
          title: 'General',
          children: [
            { title: 'Button', link: '/en-US/components/button' },
            {
              title: 'ResponsiveButtonGroup',
              link: '/en-US/components/responsive-button-group',
            },
            {
              title: 'SvgIcon【废弃】',
              link: '/en-US/components/svg-icon',
            },
          ],
        },
        {
          title: 'Data Entry',
          children: [
            {
              title: 'PopoverSelect',
              link: '/en-US/components/popover-select',
            },
          ],
        },
        {
          title: 'Data Display',
          children: [{ title: 'Table', link: '/en-US/components/table' }],
        },
        {
          title: 'Feedback & Windows',
          children: [
            { title: 'Drawer', link: '/en-US/components/drawer' },
            { title: 'Modal', link: '/en-US/components/modal' },
          ],
        },
        {
          title: 'Navigation',
          children: [],
        },
        {
          title: 'Global Configuration',
          children: [
            {
              title: 'ConfigProvider',
              link: '/en-US/components/config-provider',
            },
          ],
        },
      ],
      '/hooks': [
        {
          title: '状态管理',
          children: [
            {
              title: 'useMergeState 合并状态',
              link: '/hooks/use-merge-state',
            },
          ],
        },
        {
          title: '交互能力',
          children: [
            {
              title: 'useDragBounds 拖拽边界',
              link: '/hooks/use-drag-bounds',
            },
          ],
        },
        {
          title: '数据适配',
          children: [
            {
              title: 'useFieldNames 字段映射',
              link: '/hooks/use-field-names',
            },
          ],
        },
      ],
      '/en-US/hooks': [
        {
          title: 'State',
          children: [
            {
              title: 'useMergeState',
              link: '/en-US/hooks/use-merge-state',
            },
          ],
        },
        {
          title: 'Interaction',
          children: [
            {
              title: 'useDragBounds',
              link: '/en-US/hooks/use-drag-bounds',
            },
          ],
        },
        {
          title: 'Data Adapters',
          children: [
            {
              title: 'useFieldNames',
              link: '/en-US/hooks/use-field-names',
            },
          ],
        },
      ],
    },
  },
});
