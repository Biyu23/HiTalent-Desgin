import { CheckOutlined, CopyOutlined } from '@ant-design/icons';
import { Link, useRouteMeta } from 'dumi';
import type { FC } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

type HeroAction = {
  text: string;
  link: string;
};

type HeroSignal = {
  label: string;
  value: string;
};

type HeroInstall = {
  label: string;
  command: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
};

type HomeHero = {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: HeroAction[];
  signals?: HeroSignal[];
  install?: HeroInstall;
};

const isExternalLink = (link: string) =>
  /^(\w+:)\/\/|^(mailto|tel):/.test(link);

const Hero: FC = () => {
  const { frontmatter } = useRouteMeta();
  const hero = frontmatter.hero as HomeHero | undefined;
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const resetTimer = useRef<number>();

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  if (!hero) return null;

  const handleCopy = async () => {
    if (!hero.install) return;

    try {
      if (!navigator.clipboard?.writeText)
        throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(hero.install.command);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2200);
  };

  return (
    <section className="dumi-default-hero htd-doc-hero">
      <div className="htd-doc-hero-inner">
        <div className="htd-doc-hero-copy">
          {hero.eyebrow && (
            <div className="htd-doc-hero-eyebrow">{hero.eyebrow}</div>
          )}
          {hero.title && (
            <h1 dangerouslySetInnerHTML={{ __html: hero.title }} />
          )}
          {hero.description && (
            <p dangerouslySetInnerHTML={{ __html: hero.description }} />
          )}
          {Boolean(hero.actions?.length) && (
            <div className="dumi-default-hero-actions htd-doc-hero-actions">
              {hero.actions?.map(({ text, link }, index) =>
                isExternalLink(link) ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    data-primary={index === 0 || undefined}
                    key={text}
                  >
                    {text}
                  </a>
                ) : (
                  <Link
                    to={link}
                    data-primary={index === 0 || undefined}
                    key={text}
                  >
                    {text}
                  </Link>
                ),
              )}
            </div>
          )}
        </div>

        <aside className="htd-doc-hero-console" aria-label="Capabilities">
          <div className="htd-doc-hero-console-head">
            <span>HI·TALENT / UI SYSTEM</span>
            <i aria-hidden="true" />
          </div>
          <div className="htd-doc-hero-signals">
            {hero.signals?.map((signal, index) => (
              <div className="htd-doc-hero-signal" key={signal.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{signal.label}</strong>
                <small>{signal.value}</small>
              </div>
            ))}
          </div>
          {hero.install && (
            <div className="htd-doc-install">
              <span>{hero.install.label}</span>
              <div>
                <code>{hero.install.command}</code>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label={hero.install.copyLabel}
                >
                  {copyState === 'copied' ? (
                    <CheckOutlined />
                  ) : (
                    <CopyOutlined />
                  )}
                </button>
              </div>
              <small aria-live="polite">
                {copyState === 'copied'
                  ? hero.install.copiedLabel
                  : copyState === 'failed'
                  ? hero.install.failedLabel
                  : ' '}
              </small>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
};

export default Hero;
