/** 将表内节点统一定位到所属 Table 容器。 */
function getRoot(element: HTMLElement) {
  return (
    element.closest<HTMLElement>('[data-table-root]') ??
    element.querySelector<HTMLElement>('[data-table-root]') ??
    element
  );
}

/** 排除展开行、单元格或工具栏内渲染的嵌套表格。 */
export function tableElements(
  root: HTMLElement,
  selector: string,
): HTMLElement[] {
  const owner = getRoot(root);
  return Array.from(owner.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.closest('[data-table-root]') === owner,
  );
}

/** 通过实际 Antd 前缀生成选择器，兼容 ConfigProvider 的自定义前缀。 */
export function tableSelector(root: HTMLElement, suffix = '') {
  return `.${CSS.escape(
    getRoot(root).dataset.tablePrefix ?? 'ant-table',
  )}${suffix}`;
}

/** 普通表格与虚拟表格使用不同滚动容器，在此统一识别。 */
export function getTableViewport(root: HTMLElement) {
  const prefix = tableSelector(root);
  return (
    tableElements(
      root,
      `${prefix}-tbody-virtual-holder, ${prefix}-body, ${prefix}-content`,
    )[0] ?? getRoot(root)
  );
}

/** 虚拟表格由表头维护 DOM 横向滚动，表体另用命令式接口同步。 */
export function getHorizontalScroller(root: HTMLElement) {
  const viewport = getTableViewport(root);
  return viewport.matches(`${tableSelector(root)}-tbody-virtual-holder`)
    ? tableElements(root, `${tableSelector(root)}-header`)[0] ?? viewport
    : viewport;
}

/** 同步表头、虚拟表体和固定汇总行的横向偏移。 */
export function scrollTableHorizontally(
  root: HTMLElement,
  delta: number,
  scrollVirtual: (left: number) => void,
) {
  const viewport = getTableViewport(root);
  const scroller = getHorizontalScroller(root);
  scroller.scrollLeft += delta;
  if (scroller !== viewport) {
    // rc-table 将 scrollTo 转交给虚拟列表，其偏移量为非负值，
    // 而 RTL 布局中的 DOM scrollLeft 为负值；命令式调用 scrollTo 不会
    // 触发 onVirtualScroll，因此需在此同步固定汇总行。
    scrollVirtual(Math.abs(scroller.scrollLeft));
    tableElements(root, `div${tableSelector(root)}-summary`).forEach(
      (summary) => {
        summary.scrollLeft = scroller.scrollLeft;
      },
    );
  }
}

/** 只选择当前表格的数据行，排除详情辅助行与嵌套表格。 */
export function tableRows(root: HTMLElement) {
  const prefix = tableSelector(root);
  return tableElements(root, `${prefix}-row[data-row-key]`).filter(
    (row) => !row.matches(`${prefix}-row-extra`),
  );
}

/** 动画仅测量视口内的数据行，避免长表格全部参与布局读取。 */
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
