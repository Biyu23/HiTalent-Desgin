import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  outputPath: 'docs-dist',
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],

  // ⚠️ 请勿开启 apiParser。
  // 原因：dumi 内建解析器通过 unpkg 动态加载 TypeScript 标准库定义文件
  //（固定路径 /lib/lib.esnext.d.ts），该 CDN 在国内网络环境不可达（已实测
  // unpkg.com、registry.npmmirror.com 均无效），会直接导致 docs:build 失败。
  // 当前 API 表格通过各组件 index.md 中的
  // <API src="./type.ts" identifier="XxxProps" hideTitle></API> 手动维护。
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
