import type { DockItem, MinimizePosition } from '../type';

export interface DockDragOffset {
  x: number;
  y: number;
}

type Listener = () => void;

const ZERO_OFFSET: DockDragOffset = { x: 0, y: 0 };

const sameOffset = (left: DockDragOffset, right: DockDragOffset): boolean =>
  left.x === right.x && left.y === right.y;

export class DockStore {
  private items = new Map<MinimizePosition, DockItem[]>();
  private itemListeners = new Map<MinimizePosition, Set<Listener>>();
  private dragOffsets = new Map<MinimizePosition, DockDragOffset>();
  private dragListeners = new Map<MinimizePosition, Set<Listener>>();

  getItems(position: MinimizePosition): DockItem[] {
    return this.items.get(position) || [];
  }

  register(item: DockItem): () => void {
    const current = this.getItems(item.position);
    const existingIndex = current.findIndex((entry) => entry.id === item.id);

    if (existingIndex >= 0) {
      const next = [...current];
      next[existingIndex] = item;
      this.items.set(item.position, next);
    } else {
      this.items.set(item.position, [...current, item]);
    }
    this.notify(this.itemListeners, item.position);

    let registered = true;
    return () => {
      if (!registered) return;
      registered = false;
      this.unregister(item.position, item.id);
    };
  }

  update(item: DockItem): void {
    const current = this.getItems(item.position);
    const index = current.findIndex((entry) => entry.id === item.id);
    if (index < 0 || current[index] === item) return;

    const next = [...current];
    next[index] = item;
    this.items.set(item.position, next);
    this.notify(this.itemListeners, item.position);
  }

  unregister(position: MinimizePosition, id: string): void {
    const current = this.getItems(position);
    const next = current.filter((item) => item.id !== id);
    if (next.length === current.length) return;

    if (next.length === 0) {
      this.items.delete(position);
      this.dragOffsets.delete(position);
    } else {
      this.items.set(position, next);
    }

    this.notify(this.itemListeners, position);
    if (next.length === 0) {
      this.notify(this.dragListeners, position);
    }
  }

  getDragOffset(position: MinimizePosition): DockDragOffset {
    return this.dragOffsets.get(position) || ZERO_OFFSET;
  }

  setDragOffset(
    position: MinimizePosition,
    offset: DockDragOffset,
  ): DockDragOffset {
    const current = this.getDragOffset(position);
    if (sameOffset(current, offset)) return current;

    const next = { x: offset.x, y: offset.y };
    this.dragOffsets.set(position, next);
    this.notify(this.dragListeners, position);
    return next;
  }

  subscribeItems(position: MinimizePosition, listener: Listener): () => void {
    return this.subscribe(this.itemListeners, position, listener);
  }

  subscribeDragOffset(
    position: MinimizePosition,
    listener: Listener,
  ): () => void {
    return this.subscribe(this.dragListeners, position, listener);
  }

  private subscribe(
    listeners: Map<MinimizePosition, Set<Listener>>,
    position: MinimizePosition,
    listener: Listener,
  ): () => void {
    let set = listeners.get(position);
    if (!set) {
      set = new Set();
      listeners.set(position, set);
    }
    set.add(listener);

    return () => {
      set?.delete(listener);
      if (set?.size === 0) {
        listeners.delete(position);
      }
    };
  }

  private notify(
    listeners: Map<MinimizePosition, Set<Listener>>,
    position: MinimizePosition,
  ): void {
    listeners.get(position)?.forEach((listener) => listener());
  }
}

export const dockStore = new DockStore();
