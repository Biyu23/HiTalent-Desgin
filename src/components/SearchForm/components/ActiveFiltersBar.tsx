import { Button, Tag, Tooltip } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
import type { ActiveFilterItem } from '../hooks/useActiveFilters';
import { useStyles } from '../style';
import type { SearchFormClassNames, SearchFormStyles } from '../type';

interface ActiveFiltersBarProps {
  prefixCls?: string;
  filters: ActiveFilterItem[];
  onClearAll: () => void;
  locale: SearchFormLocale;
  classNames?: SearchFormClassNames;
  styles?: SearchFormStyles;
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onClearAll,
  locale,
  classNames,
  styles: customStyles,
}) => {
  const { styles: barStyles, cx } = useStyles();

  if (filters.length === 0) {
    return null;
  }

  return (
    <div
      className={cx(barStyles.activeFiltersBar, classNames?.activeFilters)}
      style={customStyles?.activeFilters}
    >
      <div className={barStyles.activeFiltersLeft}>
        <span className={barStyles.activeFiltersTitle}>
          {locale.activeFilters}:
        </span>
        {filters.map((filter) => (
          <Tag
            key={filter.name}
            closable
            onClose={(e) => {
              e.preventDefault();
              filter.onRemove();
            }}
            className={barStyles.filterTag}
          >
            <Tooltip title={filter.tooltipText} placement="top">
              <span className={barStyles.filterTagContent}>
                {filter.content}
              </span>
            </Tooltip>
          </Tag>
        ))}
      </div>

      <Button
        type="link"
        size="small"
        danger
        onClick={onClearAll}
        className={barStyles.clearAllBtn}
      >
        {locale.clearAll}
      </Button>
    </div>
  );
};
