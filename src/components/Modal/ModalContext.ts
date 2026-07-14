import React, { createContext, useContext } from 'react';
import type { MinimizePosition } from './type';

/**
 * Modal 内部共享上下文。
 *
 * 通过 Context 向 ModalHeader、MinimizedDock 等子组件注入共享状态与操作方法，
 * 彻底消除 Props Drilling —— 子组件不再需要接收 6~10 个 props。
 *
 * 设计考量：
 * - 单一 Context 而非多 Context 拆分：当前子组件数量少、状态粒度粗，
 *   拆分为 Config/State/Actions 三层 Context 反而增加心智负担，收益有限。
 * - Context value 由父组件 useMemo 稳定引用，仅在依赖变化时重建。
 */
export interface ModalContextValue {
  // ======== 静态配置 ========
  /** 组件类名前缀（如 'htd-modal'） */
  prefixCls: string;
  /** 是否开启拖拽 */
  draggable: boolean;
  /** 是否支持最小化 */
  minimizable: boolean;
  /** 是否支持最大化 */
  maximizable: boolean;
  /** 是否显示关闭按钮 */
  closable: boolean;
  /** 最小化悬浮窗停靠位置 */
  minimizePosition: MinimizePosition;

  // ======== 运行时状态 ========
  /** 弹窗是否处于开启状态（来自父组件控制的 open prop） */
  open?: boolean;
  /** 是否处于最大化状态 */
  isMaximized: boolean;
  /** 是否处于最小化状态 */
  isMinimized: boolean;
  /** 拖拽是否被禁用（最大化时强制禁用，非拖拽态时默认禁用） */
  disabledDrag: boolean;
  /** 弹窗标题（同时用于 ModalHeader 和 MinimizedDock 展示） */
  title: React.ReactNode;

  // ======== 事件分发 ========
  /** 最小化 */
  onMinimize: () => void;
  /** 从最小化恢复 */
  onRestore: () => void;
  /** 切换最大化/还原 */
  onToggleMaximize: () => void;
  /** 关闭弹窗（按钮点击或 ESC 按键） */
  onClose: (
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => void;
  /** 设置拖拽禁用状态 */
  setDisabledDrag: (disabled: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * 在 Modal 子组件内部获取共享状态与操作方法。
 *
 * 若在 <Modal> 外部调用，抛出明确错误提示，帮助开发者快速定位问题。
 *
 * @throws 当不在 Modal 组件树内时抛出 Error
 */
export const useModalContext = (): ModalContextValue => {
  const ctx = useContext(ModalContext);
  if (process.env.NODE_ENV !== 'production' && !ctx) {
    throw new Error(
      '[HiTalent Design] useModalContext() 必须在 <Modal> 组件内部调用。' +
        '请确保 <ModalHeader> 或 <MinimizedDock> 作为 <Modal> 的子组件渲染。',
    );
  }
  // 生产环境不做检查，避免性能开销
  return ctx!;
};

export default ModalContext;
