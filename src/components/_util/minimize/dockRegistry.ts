import type { MinimizePosition } from './type';

interface DockRegistryEntry {
  container: HTMLDivElement;
  scrollWrapper: HTMLDivElement;
  references: number;
  hashes: Map<string, number>;
}

const registry = new Map<string, DockRegistryEntry>();

function registryKey(namespace: string, position: MinimizePosition) {
  return `${namespace}:${position}`;
}

function syncClasses(
  entry: DockRegistryEntry,
  namespace: string,
  dockPrefixCls: string,
  position: MinimizePosition,
) {
  const hashes = Array.from(entry.hashes.keys()).filter(Boolean);
  entry.container.className = [
    `${dockPrefixCls}-container`,
    `${dockPrefixCls}-container-${position}`,
    namespace,
    ...hashes,
  ].join(' ');
  entry.scrollWrapper.className = [
    `${dockPrefixCls}-scroll-wrapper`,
    namespace,
    ...hashes,
  ].join(' ');
}

export function acquireDockContainer(options: {
  namespace: string;
  dockPrefixCls: string;
  hashId: string;
  position: MinimizePosition;
}) {
  const { namespace, dockPrefixCls, hashId, position } = options;
  const key = registryKey(namespace, position);
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
      hashes: new Map(),
    };
    registry.set(key, entry);
  }
  entry.references += 1;
  entry.hashes.set(hashId, (entry.hashes.get(hashId) || 0) + 1);
  syncClasses(entry, namespace, dockPrefixCls, position);
  let released = false;

  return {
    scrollWrapper: entry.scrollWrapper,
    release: () => {
      if (released) return;
      released = true;
      const current = registry.get(key);
      if (!current) return;
      current.references -= 1;
      const hashReferences = (current.hashes.get(hashId) || 1) - 1;
      if (hashReferences <= 0) current.hashes.delete(hashId);
      else current.hashes.set(hashId, hashReferences);
      if (current.references <= 0) {
        current.container.remove();
        registry.delete(key);
      } else {
        syncClasses(current, namespace, dockPrefixCls, position);
      }
    },
  };
}
