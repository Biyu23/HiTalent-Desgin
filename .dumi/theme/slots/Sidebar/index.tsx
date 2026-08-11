import {
  NavLink,
  useLocale,
  useLocation,
  useRouteMeta,
  useSidebarData,
} from 'dumi';
import Toc from 'dumi/theme/slots/Toc';
import type { FC } from 'react';
import React from 'react';
import './index.less';

const Sidebar: FC = () => {
  const { pathname } = useLocation();
  const meta = useRouteMeta();
  const sidebar = useSidebarData();
  const locale = useLocale();

  if (!sidebar) return null;

  return (
    <nav
      className="dumi-default-sidebar htd-doc-sidebar"
      aria-label={locale.id === 'en-US' ? 'Documentation' : '文档导航'}
    >
      {sidebar.map((group, index) => (
        <dl className="dumi-default-sidebar-group" key={String(index)}>
          {group.title && <dt>{group.title}</dt>}
          {group.children.map((child) => (
            <dd key={child.link}>
              <NavLink to={child.link} title={child.title} end>
                <span>{child.title}</span>
              </NavLink>
              {child.link === pathname && meta.frontmatter.toc === 'menu' && (
                <Toc />
              )}
            </dd>
          ))}
        </dl>
      ))}
    </nav>
  );
};

export default Sidebar;
