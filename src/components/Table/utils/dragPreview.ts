function getRoot(element: HTMLElement) {
  return (
    element.closest<HTMLElement>('[data-table-root]') ??
    element.querySelector<HTMLElement>('[data-table-root]') ??
    element
  );
}

/** Exclude tables rendered in expanded rows, cells or toolbars. */
export function tableElements(
  root: HTMLElement,
  selector: string,
): HTMLElement[] {
  const owner = getRoot(root);
  return Array.from(owner.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.closest('[data-table-root]') === owner,
  );
}

export function tableSelector(root: HTMLElement, suffix = '') {
  return `.${CSS.escape(
    getRoot(root).dataset.tablePrefix ?? 'ant-table',
  )}${suffix}`;
}

export function getTableViewport(root: HTMLElement) {
  const prefix = tableSelector(root);
  return (
    tableElements(
      root,
      `${prefix}-tbody-virtual-holder, ${prefix}-body, ${prefix}-content`,
    )[0] ?? getRoot(root)
  );
}

export function getHorizontalScroller(root: HTMLElement) {
  const viewport = getTableViewport(root);
  return viewport.matches(`${tableSelector(root)}-tbody-virtual-holder`)
    ? tableElements(root, `${tableSelector(root)}-header`)[0] ?? viewport
    : viewport;
}

export function scrollTableHorizontally(
  root: HTMLElement,
  delta: number,
  scrollVirtual: (left: number) => void,
) {
  const viewport = getTableViewport(root);
  const scroller = getHorizontalScroller(root);
  scroller.scrollLeft += delta;
  if (scroller !== viewport) {
    // rc-table forwards scrollTo to its virtual list. Its offset is unsigned,
    // while DOM scrollLeft is negative in RTL. Imperative scrollTo does not
    // emit onVirtualScroll, so keep the fixed summary in sync here as well.
    scrollVirtual(Math.abs(scroller.scrollLeft));
    tableElements(root, `div${tableSelector(root)}-summary`).forEach(
      (summary) => {
        summary.scrollLeft = scroller.scrollLeft;
      },
    );
  }
}

export function tableRows(root: HTMLElement) {
  const prefix = tableSelector(root);
  return tableElements(root, `${prefix}-row[data-row-key]`).filter(
    (row) => !row.matches(`${prefix}-row-extra`),
  );
}

export function visibleTableRows(root: HTMLElement) {
  const viewport = getTableViewport(root).getBoundingClientRect();
  return tableRows(root).filter((row) => {
    const rect = row.getBoundingClientRect();
    return (
      rect.height > 0 &&
      rect.bottom > viewport.top &&
      rect.top < viewport.bottom
    );
  });
}
