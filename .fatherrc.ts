import { defineConfig } from 'father';

export default defineConfig({
  // 更多 father 配置： https://github.com/umijs/father/blob/master/docs/config.md
  esm: { output: 'dist', ignores: ['src/**/demo/**', 'src/demoIntl.ts'] },
  cjs: { output: 'lib', ignores: ['src/**/demo/**', 'src/demoIntl.ts'] },
});
