import { createContext, useContext } from 'react';
import type { ModalProps } from './type';
import type { ModalWindowPosition, ModalWindowSize } from './types/internal';

export interface ModalWindowContextValue {
  draggable: boolean;
  resizable: ModalProps['resizable'];
  open?: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  position: ModalWindowPosition;
  setPosition: (position: ModalWindowPosition) => void;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
}

export const ModalWindowContext = createContext<ModalWindowContextValue | null>(
  null,
);

export function useModalWindow() {
  return useContext(ModalWindowContext)!;
}
