export function getTableViewport(root: HTMLElement) {
  return (
    root.querySelector<HTMLElement>('.ant-table-body, .ant-table-content') ??
    root
  );
}

export function visibleTableRows(root: HTMLElement) {
  const viewport = getTableViewport(root).getBoundingClientRect();
  return Array.from(
    root.querySelectorAll<HTMLElement>('tr[data-row-key]'),
  ).filter((row) => {
    const rect = row.getBoundingClientRect();
    return (
      rect.height > 0 &&
      rect.bottom > viewport.top &&
      rect.top < viewport.bottom
    );
  });
}
