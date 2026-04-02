import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'EN' },
  ],
  // 解析器配置
  resolve: {
    // 配置文档解析
    docDirs: ['docs', 'src'],
    // 配置组件文档自动生成
    atomDirs: [{ type: 'component', dir: 'src/components' }],
  },
});
