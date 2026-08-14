import type React from 'react';
import type { ResponsiveButtonGroupMode } from '../type';

export interface ResponsiveLayoutItem {
  key: React.Key;
  priority?: number;
}

export interface ResponsiveLayoutInput {
  items: readonly ResponsiveLayoutItem[];
  mode: ResponsiveButtonGroupMode;
  direction?: 'ltr' | 'rtl';
  minVisibleCount: number;
  gap: number;
  containerWidth: number | null;
  itemWidths: ReadonlyMap<React.Key, number>;
  overflowWidths: ReadonlyMap<number, number>;
}

export interface ResponsiveLayoutResult {
  visibleKeys: React.Key[];
  collapsedKeys: React.Key[];
}
