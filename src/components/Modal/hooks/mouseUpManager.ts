/**
 * 全局 mouseup 监听管理器（单例）。
 *
 * 问题：如果每个 ModalHeader 独立注册 `window.addEventListener('mouseup', ...)`，
 * N 个弹窗实例会产生 N 个无意义的重复监听器。
 *
 * 方案：
 * 1. 单例管理所有实例的 isMouseDownRef。
 * 2. `document` 上只维护一个全局 mouseup 处理器，遍历所有 ref 并重置。
 * 3. 实例挂载时注册 ref，卸载时注销；当 Set 为空时自动移除全局监听器。
 */
class GlobalMouseUpManager {
  private refs = new Set<React.MutableRefObject<boolean>>();
  private listener: (() => void) | null = null;

  register(ref: React.MutableRefObject<boolean>) {
    this.refs.add(ref);
    this.ensureListening();
  }

  unregister(ref: React.MutableRefObject<boolean>) {
    this.refs.delete(ref);
    if (this.refs.size === 0) {
      this.dispose();
    }
  }

  private ensureListening() {
    if (this.listener) return;
    this.listener = () => {
      this.refs.forEach((ref) => {
        if (ref.current) ref.current = false;
      });
    };
    document.addEventListener('mouseup', this.listener);
  }

  private dispose() {
    if (!this.listener) return;
    document.removeEventListener('mouseup', this.listener);
    this.listener = null;
  }
}

/** 全局单例，供所有 ModalHeader 组件共享 */
const globalMouseUpManager = new GlobalMouseUpManager();

export default globalMouseUpManager;
