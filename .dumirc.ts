import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  outputPath: 'docs-dist',
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
      { type: 'component', dir: 'src/configProvider' },
    ],
  },
  themeConfig: {
    name: 'HiTalent Design',
    logo: false,
    theme: {
      '@c-primary': '#1677ff',
    },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/button' },
      { title: 'Hooks', link: '/hooks/use-merge-state' },
    ],
    footer: 'HiTalent Design · 基于 Ant Design 的业务组件库',
    socialLinks: {
      github: 'https://github.com/biyu23/hi-talent-design',
    },
    sidebar: {
      '/components': [
        {
          title: '通用组件',
          children: [
            { title: 'Button 高级按钮', link: '/components/button' },
            { title: 'Modal 高级弹窗', link: '/components/modal' },
            {
              title: 'PopoverSelect 气泡选择',
              link: '/components/popover-select',
            },
            { title: 'Table 增强表格', link: '/components/table' },
          ],
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
      '/guide': [
        {
          title: '指南',
          children: [{ title: 'Getting Started', link: '/guide' }],
        },
      ],
      '/hooks': [
        {
          title: '自定义 Hooks',
          children: [
            {
              title: 'useMergeState 合并状态',
              link: '/hooks/use-merge-state',
            },
            {
              title: 'useDragBounds 拖拽边界',
              link: '/hooks/use-drag-bounds',
            },
            {
              title: 'useFieldNames 字段映射',
              link: '/hooks/use-field-names',
            },
          ],
        },
      ],
    },
    hero: {
      title: 'HiTalent Design',
      description: '基于 Ant Design 的高级业务组件库，简洁、类型安全、开箱即用',
      actions: [
        { text: '开始使用', link: '/guide' },
        { text: '浏览组件', link: '/components/button' },
      ],
    },
  },
});
