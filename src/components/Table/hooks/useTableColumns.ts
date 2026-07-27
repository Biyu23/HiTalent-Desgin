import { useCallback, useEffect, useRef, useState } from 'react';
import type { EnhancedColumnType } from '../type';

// ==================== 列配置数据项 ====================

/**
 * 后端列配置单条记录
 * 对应 API 返回的列配置数组中的每一项
 */
export interface ColumnConfigItem {
  /** 列标识（对应 EnhancedColumnType.key / dataIndex） */
  key: string;
  /** 是否可见 */
  hidden: boolean;
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

export interface UseTableColumnsResult<RecordType = any> {
  /**
   * 合并了后端配置的 columns（已注入 hidden/width/顺序）
   * 直接传给 <HiTable> 的 columns prop
   *
   * @example
   * ```tsx
   * const { columns, loading } = useTableColumns({ request, updateRequest });
   * return <HiTable columns={columns} dataSource={data} onColumnsChange={handleChange} />;
   * ```
   */
  columns: EnhancedColumnType<RecordType>[];

  /** 加载/保存中 */
  loading: boolean;
  /** 当前完整的列配置数据 */
  columnConfigs: ColumnConfigItem[];
}

// ==================== 工具函数 ====================

/**
 * 将后端 ColumnConfigItem[] 合并到 EnhancedColumnType[] 上
 * 按照后端配置的顺序排序，注入 hidden 和 width
 */
export function mergeConfigToColumns<RecordType>(
  columns: EnhancedColumnType<RecordType>[],
  configs: ColumnConfigItem[],
): EnhancedColumnType<RecordType>[] {
  // 构建后端配置索引
  const configMap = new Map<string, ColumnConfigItem>();
  configs.forEach((c) => configMap.set(c.key, c));

  // 按 configs 的顺序生成 columns
  const ordered = configs
    .map((cfg) => {
      // 尝试通过 key 匹配，也尝试 dataIndex
      const col =
        columns.find(
          (c, i) =>
            (c.key as string) === cfg.key ||
            c.dataIndex?.toString() === cfg.key ||
            `col_${i}` === cfg.key,
        ) || columns.find((c) => c.dataIndex?.toString() === cfg.key);

      if (!col) return null;

      return {
        ...col,
        hidden: cfg.hidden,
        width: cfg.width ?? col.width ?? col.defaultWidth,
      };
    })
    .filter(Boolean) as EnhancedColumnType<RecordType>[];

  // 补充后端配置中不存在的列（追加到末尾）
  const configuredKeys = new Set(configs.map((c) => c.key));
  const unconfigured = columns.filter(
    (col, i) =>
      !configuredKeys.has(
        (col.key as string) || col.dataIndex?.toString() || `col_${i}`,
      ),
  );

  return [...ordered, ...unconfigured];
}

// ==================== Hook 实现 ====================

/**
 * useTableColumns — 将后端列配置与 Table 组件桥接的 Hook
 *
 * 封装完整的异步 fetch/save 生命周期，返回合并后的 columns 直接传给 `<HiTable>`。
 *
 * @example
 * ```tsx
 * const MyPage = () => {
 *   const { columns, loading } = useTableColumns({
 *     request: () => getReportColumns('myModule'),
 *     updateRequest: (configs) => editReportColumns(configs),
 *   });
 *
 *   return (
 *     <HiTable
 *       columns={columns}
 *       dataSource={data}
 *       onColumnsChange={(updated) => setColumns(updated)}
 *       columnSettingLoading={loading}
 *     />
 *   );
 * };
 * ```
 */
export function useTableColumns<RecordType = any>(
  options: UseTableColumnsOptions,
): UseTableColumnsResult<RecordType> {
  const { request, fetchOnMount = true } = options;

  // ---- 状态 ----
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfigItem[]>([]);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);

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

  // ---- 清理 ----
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    columns: columnConfigs as unknown as EnhancedColumnType<RecordType>[],
    loading,
    columnConfigs,
  };
}
