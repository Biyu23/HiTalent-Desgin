import type { MinimizePosition } from './type';

type ClassReferences = Map<string, number>;

interface DockRegistryEntry {
  container: HTMLDivElement;
  scrollWrapper: HTMLDivElement;
  references: number;
  containerClasses: ClassReferences;
  scrollWrapperClasses: ClassReferences;
}

const registry = new Map<string, DockRegistryEntry>();

const getRegistryKey = (
  dockPrefixCls: string,
  position: MinimizePosition,
): string => `${dockPrefixCls}:${position}`;

const addClassReference = (
  references: ClassReferences,
  className?: string,
): void => {
  if (!className) return;
  references.set(className, (references.get(className) || 0) + 1);
};

const removeClassReference = (
  references: ClassReferences,
  className?: string,
): void => {
  if (!className) return;
  const nextCount = (references.get(className) || 1) - 1;
  if (nextCount <= 0) references.delete(className);
  else references.set(className, nextCount);
};

const syncClasses = (
  entry: DockRegistryEntry,
  dockPrefixCls: string,
  position: MinimizePosition,
): void => {
  entry.container.className = [
    `${dockPrefixCls}-container`,
    `${dockPrefixCls}-container-${position}`,
    ...entry.containerClasses.keys(),
  ].join(' ');

  entry.scrollWrapper.className = [
    `${dockPrefixCls}-scroll-wrapper`,
    ...entry.scrollWrapperClasses.keys(),
  ].join(' ');
};

export interface AcquireDockContainerOptions {
  dockPrefixCls: string;
  containerClassName?: string;
  scrollWrapperClassName?: string;
  position: MinimizePosition;
}

export function acquireDockContainer(options: AcquireDockContainerOptions): {
  container: HTMLDivElement;
  scrollWrapper: HTMLDivElement;
  release: () => void;
} {
  const {
    dockPrefixCls,
    containerClassName,
    scrollWrapperClassName,
    position,
  } = options;
  const key = getRegistryKey(dockPrefixCls, position);
  let entry = registry.get(key);

  if (!entry) {
    const container = document.createElement('div');
    const scrollWrapper = document.createElement('div');
    container.appendChild(scrollWrapper);
    document.body.appendChild(container);
    entry = {
      container,
      scrollWrapper,
      references: 0,
      containerClasses: new Map(),
      scrollWrapperClasses: new Map(),
    };
    registry.set(key, entry);
  }

  entry.references += 1;
  addClassReference(entry.containerClasses, containerClassName);
  addClassReference(entry.scrollWrapperClasses, scrollWrapperClassName);
  syncClasses(entry, dockPrefixCls, position);
  let released = false;

  return {
    container: entry.container,
    scrollWrapper: entry.scrollWrapper,
    release: () => {
      if (released) return;
      released = true;

      const current = registry.get(key);
      if (!current) return;

      current.references -= 1;
      removeClassReference(current.containerClasses, containerClassName);
      removeClassReference(
        current.scrollWrapperClasses,
        scrollWrapperClassName,
      );

      if (current.references <= 0) {
        current.container.remove();
        registry.delete(key);
      } else {
        syncClasses(current, dockPrefixCls, position);
      }
    },
  };
}
