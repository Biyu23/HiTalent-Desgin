import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  outputPath: 'docs-dist',
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  // dumi 内建 API 解析器依赖 unpkg CDN 拉取 TS 库定义，
  // 国内网络不可达且存在 URL 构造 bug，故禁用，API 表格手动维护
  apiParser: false,
  alias: {
    myui: path.resolve(__dirname, 'src'),
  },
  resolve: {
    entryFile: './src/index.ts',
    atomDirs: [{ type: 'component', dir: 'src/components' }],
  },
  themeConfig: {
    name: 'MyUI',
    logo: false,
    theme: {
      '@c-primary': '#1677ff',
    },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/button' },
    ],
    footer: 'MyUI · 基于 Ant Design 的业务组件库',
    socialLinks: {
      github: 'https://github.com/biyu23/myui',
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
          ],
        },
      ],
    },
    hero: {
      title: 'MyUI',
      description: '基于 Ant Design 的高级业务组件库，简洁、类型安全、开箱即用',
      actions: [
        { text: '开始使用', link: '/guide' },
        { text: '浏览组件', link: '/components/button' },
      ],
    },
  },
});
