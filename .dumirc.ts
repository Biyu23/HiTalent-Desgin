import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  apiParser: {},
  // 解析器配置
  resolve: {
    // 配置文档解析
    // docDirs: ['docs', 'src'],
    // 配置组件文档自动生成
    // atomDirs: [{ type: 'component', dir: 'src/components' }],
    entryFile: './src/index.ts',
  },
  themeConfig: {
    name: 'MyUI',
    // 替换为你们的 Logo
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
    // 对齐 Antd 的主色调
    theme: {
      '@c-primary': '#1677ff',
    },
    nav: [
      { title: '指南', link: '/guide' },
      { title: '组件', link: '/components/ProButton' }, // 指向你们的组件文档目录
    ],
    footer: 'Made with ❤️ by MyUI Team',
    socialLinks: {
      github: 'https://github.com/biyu23/myui', // 你们的仓库地址
    },
    // 侧边栏层级配置，让组件列表像 antd 一样折叠展示
    sidebar: {
      '/components': [
        {
          title: '通用组件',
          children: [
            { title: 'ProButton 高级按钮', link: '/components/ProButton' },
            { title: 'ProModal 高级弹窗', link: '/components/ProModal' },
            {
              title: 'PopoverSelect 气泡选择',
              link: '/components/PopoverSelect',
            },
          ],
        },
      ],
    },
  },
});

// import { defineConfig } from 'dumi';

// export default defineConfig({
//   outputPath: 'docs-dist',
//   // 开启 apiParser，这是生成 antd 风格 API 属性表格的核心
//   apiParser: {},
//   resolve: {
//     // 配置入口文件，apiParser 会从这里寻找类型导出
//     entryFile: './src/index.ts',
//     // 配置文档解析
//     docDirs: ['docs', 'src'],
//     // 配置组件文档自动生成
//     atomDirs: [{ type: 'component', dir: 'src/components' }],
//   },
//   locales: [
//     { id: 'zh-CN', name: '中文' },
//     { id: 'en-US', name: 'EN' },
//   ],
//   themeConfig: {
//     name: 'MyUI',
//     // 替换为你们的 Logo
//     logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
//     // 对齐 Antd 的主色调
//     theme: {
//       '@c-primary': '#1677ff',
//     },
//     nav: [
//       { title: '指南', link: '/guide' },
//       { title: '组件', link: '/components/ProButton' }, // 指向你们的组件文档目录
//     ],
//     footer: 'Made with ❤️ by MyUI Team',
//     socialLinks: {
//       github: 'https://github.com/biyu23/myui', // 你们的仓库地址
//     },
//     // 侧边栏层级配置，让组件列表像 antd 一样折叠展示
//     sidebar: {
//       '/components': [
//         {
//           title: '通用组件',
//           children: [
//             { title: 'ProButton 高级按钮', link: '/components/ProButton' },
//             { title: 'ProModal 高级弹窗', link: '/components/ProModal' },
//             {
//               title: 'PopoverSelect 气泡选择',
//               link: '/components/PopoverSelect',
//             },
//           ],
//         },
//       ],
//     },
//   },
// });
