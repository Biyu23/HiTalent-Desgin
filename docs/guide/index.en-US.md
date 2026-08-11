---
title: Introduction
toc: content
---

# HiTalent Design

HiTalent Design is an advanced business component library built on Ant Design. It packages complex, repeated interactions that otherwise drift between product teams.

## What it solves

Ant Design provides dependable primitives, while production applications still need window management, persisted column state, tree dragging, high-volume selection, and adapters for legacy data formats. HiTalent Design turns those combined behaviors into stable APIs so teams can focus on the workflow instead of rebuilding interaction infrastructure.

## Design goals

- **Built for real workflows**: capabilities start from common business tasks, not isolated visual effects.
- **Preserve native behavior**: enhancements keep the essential Ant Design APIs available.
- **Type safe**: complex configuration, generic data, and instance methods have complete TypeScript types.
- **Adopt progressively**: start with one component without replacing an existing Ant Design stack.
- **One internationalization entry point**: ConfigProvider manages locale, direction, and scoped message overrides.

## Component overview

| Component      | Problem it addresses                                      |
| -------------- | --------------------------------------------------------- |
| Button         | Async actions, repeated clicks, and disabled explanations |
| PopoverSelect  | Large option sets, field mapping, and value formats       |
| Table          | Column state, drag operations, tree moves, and presets    |
| Modal          | Drag, resize, maximize, and multi-window minimization     |
| ConfigProvider | CSS prefix, locale, scoped copy, and text direction       |

## Next steps

1. Review [Installation](/en-US/guide/installation) for dependency requirements.
2. Follow [Quick Start](/en-US/guide/quick-start) to render the first component.
3. Connect locale and CSS prefix in [Global Configuration](/en-US/guide/global-config).
