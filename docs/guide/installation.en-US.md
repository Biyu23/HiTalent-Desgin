---
title: Installation
toc: content
---

# Installation

## Install with a package manager

HiTalent Design treats React, React DOM, and Ant Design as peer dependencies. Install them with the library in your application:

```bash
npm install hi-talent-design antd
```

Or use Yarn:

```bash
yarn add hi-talent-design antd
```

## Requirements

| Dependency | Supported range  |
| ---------- | ---------------- |
| React      | >= 16.9.0        |
| React DOM  | >= 16.9.0        |
| Ant Design | >= 5 < 6         |
| TypeScript | 4.7+ recommended |

The package ships ES Modules and TypeScript declarations. Make sure the application build handles Ant Design styles before using the components.

## Import only what you use

Import components from the package entry:

```tsx | pure
import { Button, Modal, PopoverSelect, Table } from 'hi-talent-design';
```

Your bundler can tree-shake unused exports. Do not import implementation files from `src`, `dist`, or component internals.

## Verify the installation

Render a minimal button to confirm that dependencies and styles load correctly:

```tsx | pure
import { Button } from 'hi-talent-design';

export default () => <Button type="primary">Get started</Button>;
```

Continue with [Quick Start](/en-US/guide/quick-start).
