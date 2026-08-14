import type React from 'react';

export interface ModalWindowPosition {
  x: number;
  y: number;
}

export interface ModalWindowSize {
  width: number;
  height: number;
}

export interface ModalWindowState {
  position: ModalWindowPosition;
  positionRef: React.MutableRefObject<ModalWindowPosition>;
  size: ModalWindowSize | null;
  isResizing: boolean;
  setPosition: (position: ModalWindowPosition) => void;
  setSize: (size: ModalWindowSize) => void;
  setResizing: (resizing: boolean) => void;
}
