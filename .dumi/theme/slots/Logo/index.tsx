import { Link, useLocale } from 'dumi';
import type { FC } from 'react';
import React from 'react';
import './index.less';

const Logo: FC = () => {
  const locale = useLocale();
  const home = 'base' in locale ? locale.base : '/';

  return (
    <Link
      className="dumi-default-logo htd-doc-logo"
      to={home}
      aria-label="HiTalent Design"
    >
      <span className="htd-doc-logo-mark" aria-hidden="true">
        HT
      </span>
      <span className="htd-doc-logo-copy">
        <strong>HiTalent Design</strong>
        <small>Business UI</small>
      </span>
    </Link>
  );
};

export default Logo;
