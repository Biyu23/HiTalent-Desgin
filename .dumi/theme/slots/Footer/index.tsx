import { GithubOutlined } from '@ant-design/icons';
import { useLocale, useSiteData } from 'dumi';
import type { FC } from 'react';
import React from 'react';
import './index.less';

const content = {
  'zh-CN': {
    description: '为复杂业务界面提供可靠、类型安全的高级组件。',
    source: '查看源码',
    builtWith: '基于 Ant Design 与 dumi 构建',
  },
  'en-US': {
    description:
      'Reliable, type-safe components for complex business interfaces.',
    source: 'View source',
    builtWith: 'Built with Ant Design and dumi',
  },
};

const Footer: FC = () => {
  const locale = useLocale();
  const { themeConfig } = useSiteData();
  const copy = content[locale.id as keyof typeof content] || content['zh-CN'];
  const github = themeConfig.socialLinks?.github;

  return (
    <footer className="dumi-default-footer htd-doc-footer">
      <div>
        <div className="htd-doc-footer-brand">
          <span aria-hidden="true">HT</span>
          <div>
            <strong>HiTalent Design</strong>
            <p>{copy.description}</p>
          </div>
        </div>
        <div className="htd-doc-footer-meta">
          {github && (
            <a href={github} target="_blank" rel="noreferrer">
              <GithubOutlined />
              {copy.source}
            </a>
          )}
          <span>{copy.builtWith}</span>
          <small>© 2026 HiTalent Design</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
