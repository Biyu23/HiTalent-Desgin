import { useCallback, useEffect, useRef } from 'react';
import { useLayoutMotion } from '../hooks/useLayoutMotion';
import { visibleTableRows } from '../utils/dragPreview';

/** A small header label follows the pointer; actual cells stay in the table. */
export function useColumnMotion(rootRef: React.RefObject<HTMLElement>) {
  const preview = useRef<HTMLDivElement | null>(null);
  const previewSize = useRef({ width: 0, height: 0 });
  const lastPosition = useRef('');
  const { capture, cancel: cancelLayout } = useLayoutMotion('x');

  const cancel = useCallback(() => {
    preview.current?.remove();
    preview.current = null;
  }, []);

  const start = useCallback(
    (key: string) => {
      cancel();
      const header = Array.from(
        rootRef.current?.querySelectorAll<HTMLElement>(
          '[data-column-drag-key]',
        ) ?? [],
      ).find((cell) => cell.dataset.columnDragKey === key);
      if (!header) return;
      const computed = getComputedStyle(header);
      const label = document.createElement('div');
      label.dataset.tableColumnPreview = key;
      label.setAttribute('aria-hidden', 'true');
      label.setAttribute('inert', '');
      label.textContent = header.textContent?.trim() || key;
      Object.assign(label.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        maxWidth: '240px',
        padding: '8px 12px',
        boxSizing: 'border-box',
        border: '1px solid rgba(128, 128, 128, 0.25)',
        borderRadius: '4px',
        backgroundColor: getComputedStyle(
          header.closest('.ant-table') ?? header,
        ).backgroundColor,
        color: computed.color,
        font: computed.font,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxShadow: '0 3px 12px #0002',
        pointerEvents: 'none',
        zIndex: '1000',
      });
      document.body.appendChild(label);
      preview.current = label;
      previewSize.current = {
        width: label.offsetWidth,
        height: label.offsetHeight,
      };
      lastPosition.current = '';
    },
    [cancel, rootRef],
  );

  const move = useCallback((x: number, y: number) => {
    const label = preview.current;
    if (!label) return;
    const { width, height } = previewSize.current;
    const left = Math.max(
      0,
      Math.min(window.innerWidth - width, x - width / 2),
    );
    const top = Math.max(0, Math.min(window.innerHeight - height, y + 12));
    const position = `translate3d(${left}px, ${top}px, 0)`;
    if (position !== lastPosition.current) {
      label.style.transform = position;
      lastPosition.current = position;
    }
  }, []);

  const captureLayout = useCallback(
    (changedKeys?: ReadonlySet<string>) => {
      const root = rootRef.current;
      if (!root) return;
      capture(
        [
          ...root.querySelectorAll<HTMLElement>('th[data-table-column-key]'),
          ...visibleTableRows(root).flatMap((row) =>
            Array.from(
              row.querySelectorAll<HTMLElement>('td[data-table-column-key]'),
            ),
          ),
        ].filter(
          (cell) =>
            !cell.hasAttribute('data-table-column-fixed') &&
            (!changedKeys || changedKeys.has(cell.dataset.tableColumnKey!)),
        ),
      );
    },
    [capture, rootRef],
  );

  useEffect(() => cancel, [cancel]);
  return { start, move, captureLayout, cancel, cancelLayout };
}
