import { useCallback, useEffect, useRef, useState } from 'react';

// ==================== 列配置数据项 ====================

/**
 * 后端列配置单条记录
 * 对应 API 返回的列配置数组中的每一项
 */
export interface ColumnConfigItem {
  /** 列标识（对应 EnhancedColumnType.key / dataIndex） */
  key: string;
  /** 是否可见 */
  visible: boolean;
  /** 排序序号 */
  order: number;
  /** 列宽（px），可选 */
  width?: number;
}

// ==================== Hook 配置 ====================

export interface UseTableColumnsOptions {
  /**
   * 从后端获取列配置
   * 返回排序好的列配置数组
   */
  request: () => Promise<ColumnConfigItem[]>;

  /**
   * 保存列配置到后端
   * @param configs 当前完整的列配置数组
   * @returns 任意后端响应（hook 仅关注是否成功）
   */
  updateRequest?: (configs: ColumnConfigItem[]) => Promise<any>;

  /**
   * 挂载时是否自动请求，默认 true
   */
  fetchOnMount?: boolean;
}

// ==================== Hook 返回值 ====================

export interface UseTableColumnsResult {
  /**
   * 直接解构传给 <HiTable> 的受控 props
   *
   * @example
   * ```tsx
   * const { tableProps } = useTableColumns({ request, updateRequest });
   * return <HiTable columns={columns} dataSource={data} {...tableProps} />;
   * ```
   */
  tableProps: {
    visibleKeys: string[];
    orderedKeys: string[];
    columnWidths: Record<string, number>;
    onVisibleKeysChange: (keys: string[]) => void;
    onColumnOrderChange: (keys: string[]) => void;
    onColumnWidthChange: (widths: Record<string, number>) => void;
  };

  /** 加载/保存中 */
  loading: boolean;
  /** 当前完整的列配置数据 */
  columnConfigs: ColumnConfigItem[];
}

// ==================== 工具函数 ====================

/**
 * 从 ColumnConfigItem[] 提取 visibleKeys（按 order 排序）
 */
function deriveVisibleKeys(configs: ColumnConfigItem[]): string[] {
  return configs
    .filter((c) => c.visible)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.key);
}

/**
 * 从 ColumnConfigItem[] 提取 orderedKeys（按 order 排序）
 */
function deriveOrderedKeys(configs: ColumnConfigItem[]): string[] {
  return [...configs].sort((a, b) => a.order - b.order).map((c) => c.key);
}

/**
 * 从 ColumnConfigItem[] 提取 columnWidths
 */
function deriveColumnWidths(
  configs: ColumnConfigItem[],
): Record<string, number> {
  const widths: Record<string, number> = {};
  configs.forEach((c) => {
    if (c.width !== undefined) {
      widths[c.key] = c.width;
    }
  });
  return widths;
}

/**
 * 根据新的 visibleKeys 更新 configs（保持已有 order，新增项追加到末尾）
 */
function applyVisibleKeys(
  configs: ColumnConfigItem[],
  visibleKeys: string[],
): ColumnConfigItem[] {
  const visibleSet = new Set(visibleKeys);

  // 现有的 keys
  const existingKeys = new Set(configs.map((c) => c.key));

  // 之前不存在的 key 需要追加
  const newKeys = visibleKeys.filter((k) => !existingKeys.has(k));
  const maxOrder =
    configs.length > 0 ? Math.max(...configs.map((c) => c.order ?? 0)) : -1;

  const updated = configs.map((c) => ({
    ...c,
    visible: visibleSet.has(c.key),
  }));

  // 追加全新的列
  newKeys.forEach((key, i) => {
    updated.push({
      key,
      visible: true,
      order: maxOrder + 1 + i,
    });
  });

  return updated;
}

/**
 * 根据新的 orderedKeys 更新 configs 的 order 值
 */
function applyOrderedKeys(
  configs: ColumnConfigItem[],
  orderedKeys: string[],
): ColumnConfigItem[] {
  return configs.map((c) => {
    const idx = orderedKeys.indexOf(c.key);
    return idx === -1 ? c : { ...c, order: idx };
  });
}

/**
 * 根据新的 columnWidths 更新 configs 的 width 值
 */
function applyColumnWidths(
  configs: ColumnConfigItem[],
  columnWidths: Record<string, number>,
): ColumnConfigItem[] {
  return configs.map((c) => {
    if (c.key in columnWidths) {
      return { ...c, width: columnWidths[c.key] };
    }
    return c;
  });
}

// ==================== Hook 实现 ====================

/**
 * useTableColumns — 将后端列配置与 Table 组件桥接的 Hook
 *
 * 封装完整的异步 fetch/save 生命周期，返回可直接解构给 `<HiTable>` 的受控 props。
 *
 * @example
 * ```tsx
 * const MyPage = () => {
 *   const { tableProps, loading } = useTableColumns({
 *     request: () => getReportColumns('myModule').then(parseResponse),
 *     updateRequest: (configs) => editReportColumns({
 *       itemSortAll: JSON.stringify(configs),
 *       module: 'myModule',
 *     }),
 *   });
 *
 *   return (
 *     <HiTable
 *       columns={columns}
 *       dataSource={data}
 *       {...tableProps}
 *       columnSettingLoading={loading}
 *     />
 *   );
 * };
 * ```
 */
export function useTableColumns(
  options: UseTableColumnsOptions,
): UseTableColumnsResult {
  const { request, updateRequest, fetchOnMount = true } = options;

  // ---- 状态 ----
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfigItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 保存防抖 ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // ---- 派生状态 ----
  const visibleKeys = deriveVisibleKeys(columnConfigs);
  const orderedKeys = deriveOrderedKeys(columnConfigs);
  const columnWidths = deriveColumnWidths(columnConfigs);

  // ---- 加载（错误直接 throw，由业务层处理） ----
  const fetchColumns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request();
      if (mountedRef.current) {
        setColumnConfigs(data);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [request]);

  // 挂载自动请求
  useEffect(() => {
    if (fetchOnMount) {
      fetchColumns();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchOnMount, fetchColumns]);

  // ---- 保存（防抖） ----
  const save = useCallback(
    (configs: ColumnConfigItem[]) => {
      if (!updateRequest) return;

      // 清除前一次防抖
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          await updateRequest(configs);
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      }, 300);
    },
    [updateRequest],
  );

  // ---- 变更处理器 ----

  const handleVisibleKeysChange = useCallback(
    (keys: string[]) => {
      setColumnConfigs((prev) => {
        const next = applyVisibleKeys(prev, keys);
        save(next);
        return next;
      });
    },
    [save],
  );

  const handleColumnOrderChange = useCallback(
    (keys: string[]) => {
      setColumnConfigs((prev) => {
        const next = applyOrderedKeys(prev, keys);
        save(next);
        return next;
      });
    },
    [save],
  );

  const handleColumnWidthChange = useCallback(
    (widths: Record<string, number>) => {
      setColumnConfigs((prev) => {
        const next = applyColumnWidths(prev, widths);
        save(next);
        return next;
      });
    },
    [save],
  );

  // ---- 清理 ----
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    tableProps: {
      visibleKeys,
      orderedKeys,
      columnWidths,
      onVisibleKeysChange: handleVisibleKeysChange,
      onColumnOrderChange: handleColumnOrderChange,
      onColumnWidthChange: handleColumnWidthChange,
    },
    loading,
    columnConfigs,
  };
}
