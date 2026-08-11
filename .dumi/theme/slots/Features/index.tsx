import { ArrowRightOutlined } from '@ant-design/icons';
import { Link, useRouteMeta } from 'dumi';
import type { FC, ReactNode } from 'react';
import React from 'react';
import './index.less';

type HomeFeature = {
  mark?: string;
  title?: string;
  description?: string;
  link?: string;
  meta?: string;
};

type HomeHighlight = {
  value: string;
  label: string;
};

type HomeComponentLink = {
  title: string;
  description: string;
  link: string;
  category: string;
};

type HomeLabels = {
  capabilitiesTitle?: string;
  capabilitiesDescription?: string;
  highlightsLabel?: string;
  componentsTitle?: string;
  componentsDescription?: string;
  componentsAction?: string;
  componentsActionLink?: string;
};

const renderLink = (link: string, children: ReactNode) =>
  /^(\w+:)\/\/|^(mailto|tel):/.test(link) ? (
    <a href={link} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <Link to={link}>{children}</Link>
  );

const Features: FC = () => {
  const { frontmatter } = useRouteMeta();
  const features = (frontmatter.features || []) as HomeFeature[];
  const highlights = (frontmatter.highlights || []) as HomeHighlight[];
  const componentLinks = (frontmatter.componentLinks ||
    []) as HomeComponentLink[];
  const labels = (frontmatter.home || {}) as HomeLabels;

  if (!features.length && !highlights.length && !componentLinks.length) {
    return null;
  }

  return (
    <div className="dumi-default-features htd-doc-home">
      {features.length > 0 && (
        <section className="htd-doc-home-section">
          <div className="htd-doc-home-heading">
            <div>
              <span>CORE CAPABILITIES</span>
              <h2>{labels.capabilitiesTitle}</h2>
            </div>
            <p>{labels.capabilitiesDescription}</p>
          </div>
          <div className="htd-doc-capability-grid">
            {features.map((feature) => (
              <article className="htd-doc-capability" key={feature.title}>
                <div className="htd-doc-capability-top">
                  <i aria-hidden="true">{feature.mark}</i>
                  {feature.meta && <span>{feature.meta}</span>}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                {feature.link &&
                  renderLink(
                    feature.link,
                    <span className="htd-doc-card-link">
                      {feature.title}
                      <ArrowRightOutlined />
                    </span>,
                  )}
              </article>
            ))}
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="htd-doc-highlights">
          <span>{labels.highlightsLabel}</span>
          <div>
            {highlights.map((highlight) => (
              <article key={highlight.value}>
                <strong>{highlight.value}</strong>
                <small>{highlight.label}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {componentLinks.length > 0 && (
        <section className="htd-doc-home-section htd-doc-component-index">
          <div className="htd-doc-home-heading">
            <div>
              <span>COMPONENT INDEX</span>
              <h2>{labels.componentsTitle}</h2>
            </div>
            <p>{labels.componentsDescription}</p>
          </div>
          <div className="htd-doc-component-grid">
            {componentLinks.map((component) => (
              <Link to={component.link} key={component.link}>
                <span>{component.category}</span>
                <strong>{component.title}</strong>
                <small>{component.description}</small>
                <ArrowRightOutlined />
              </Link>
            ))}
          </div>
          {labels.componentsAction && labels.componentsActionLink && (
            <Link
              className="htd-doc-component-action"
              to={labels.componentsActionLink}
            >
              {labels.componentsAction}
              <ArrowRightOutlined />
            </Link>
          )}
        </section>
      )}
    </div>
  );
};

export default Features;
