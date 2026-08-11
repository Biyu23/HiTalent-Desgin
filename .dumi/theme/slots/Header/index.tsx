import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { useLocale, useRouteMeta, useSiteData } from 'dumi';
import ColorSwitch from 'dumi/theme/slots/ColorSwitch';
import HeaderExtra from 'dumi/theme/slots/HeaderExtra';
import LangSwitch from 'dumi/theme/slots/LangSwitch';
import Logo from 'dumi/theme/slots/Logo';
import Navbar from 'dumi/theme/slots/Navbar';
import RtlSwitch from 'dumi/theme/slots/RtlSwitch';
import SearchBar from 'dumi/theme/slots/SearchBar';
import SocialIcon from 'dumi/theme/slots/SocialIcon';
import type { FC } from 'react';
import React, { useMemo, useState } from 'react';
import './index.less';

const Header: FC = () => {
  const { frontmatter } = useRouteMeta();
  const { themeConfig } = useSiteData();
  const locale = useLocale();
  const [showMenu, setShowMenu] = useState(false);
  const menuLabel = locale.id === 'en-US' ? 'Navigation menu' : '导航菜单';

  const socialIcons = useMemo(() => {
    const { socialLinks } = themeConfig;

    return socialLinks
      ? Object.keys(socialLinks)
          .slice(0, 5)
          .map((icon) => ({
            icon,
            link: socialLinks[icon as keyof typeof socialLinks],
          }))
          .filter((item): item is { icon: string; link: string } =>
            Boolean(item.link),
          )
      : [];
  }, [themeConfig.socialLinks]);

  return (
    <header
      className="dumi-default-header htd-doc-header"
      data-static={Boolean(frontmatter.hero) || undefined}
      data-mobile-active={showMenu || undefined}
      onClick={() => setShowMenu(false)}
    >
      <div className="dumi-default-header-content htd-doc-header-content">
        <section className="dumi-default-header-left htd-doc-header-brand">
          <Logo />
        </section>

        <section
          id="htd-doc-mobile-nav"
          className="dumi-default-header-right htd-doc-header-nav"
        >
          <Navbar />
          <div className="dumi-default-header-right-aside htd-doc-header-aside">
            <LangSwitch />
            <RtlSwitch />
            {themeConfig.prefersColor.switch && <ColorSwitch />}
            {socialIcons.map((item) => (
              <SocialIcon icon={item.icon} link={item.link} key={item.link} />
            ))}
            <HeaderExtra />
          </div>
        </section>

        <div
          className="htd-doc-header-search"
          onClick={(event) => event.stopPropagation()}
        >
          <SearchBar />
        </div>

        <button
          type="button"
          className="dumi-default-header-menu-btn htd-doc-header-menu"
          aria-label={menuLabel}
          aria-expanded={showMenu}
          aria-controls="htd-doc-mobile-nav"
          onClick={(event) => {
            event.stopPropagation();
            setShowMenu((value) => !value);
          }}
        >
          {showMenu ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>
    </header>
  );
};

export default Header;
