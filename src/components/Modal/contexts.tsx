import { createContext, useContext } from 'react';
import type { ModalProps } from './type';
import type { ModalWindowPosition, ModalWindowSize } from './types/internal';

export interface ModalOperationsContextValue {
  draggable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  closable: boolean;
  isMaximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: NonNullable<ModalProps['onCancel']>;
  classNames?: ModalProps['classNames'];
  styles?: ModalProps['styles'];
}

export interface ModalWindowContextValue {
  draggable: boolean;
  resizable: ModalProps['resizable'];
  open?: boolean;
  isMaximized: boolean;
  isMinimized: boolean;
  isResizing: boolean;
  position: ModalWindowPosition;
  setPosition: (position: ModalWindowPosition) => void;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
  classNames?: ModalProps['classNames'];
  styles?: ModalProps['styles'];
}

export const ModalOperationsContext =
  createContext<ModalOperationsContextValue | null>(null);
export const ModalWindowContext = createContext<ModalWindowContextValue | null>(
  null,
);

function requireContext<Value>(value: Value | null, name: string): Value {
  if (!value) throw new Error(`${name} must be used inside Modal.`);
  return value;
}

export function useModalOperations() {
  return requireContext(useContext(ModalOperationsContext), 'ModalOperations');
}

export function useModalWindow() {
  return requireContext(useContext(ModalWindowContext), 'ModalWindow');
}
