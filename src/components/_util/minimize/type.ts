import type React from 'react';

export type MinimizePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export interface MinimizeStackConfig {
  threshold?: number;
}

export type MinimizeStack = boolean | MinimizeStackConfig;

export interface MinimizeLocale {
  restore: string;
  close: string;
  minimizedDockLabel: string;
  minimizedDockDragHandle: string;
}

export interface DockItem {
  id: string;
  title?: React.ReactNode;
  position: MinimizePosition;
  className?: string;
  style?: React.CSSProperties;
  stack?: MinimizeStack;
  locale: MinimizeLocale;
  onRestore: () => void;
  onClose: () => void;
}

export interface MinimizedDockProps {
  id?: string;
  open?: boolean;
  minimized: boolean;
  title?: React.ReactNode;
  position: MinimizePosition;
  className?: string;
  style?: React.CSSProperties;
  stack?: MinimizeStack;
  locale: MinimizeLocale;
  onRestore: () => void;
  onClose: () => void;
}

export interface UseMinimizeStateOptions {
  minimized?: boolean;
  onMinimizeChange?: (minimized: boolean) => void;
}

export interface UseMinimizeStateReturn {
  isMinimized: boolean;
  minimize: () => void;
  restore: () => void;
  reset: () => void;
}
