import { Button } from 'antd';
import React from 'react';
import type { SearchFormLocale } from '../../../locales';
import { useStyles } from '../style';
import type { SearchFormProps } from '../type';

type SearchActionsProps = Pick<
  SearchFormProps,
  | 'showSearchButton'
  | 'showResetButton'
  | 'searchText'
  | 'resetText'
  | 'disabled'
  | 'classNames'
  | 'styles'
  | 'actionExtra'
> & {
  variant?: 'menu' | 'drawer' | 'inline';
  onSubmit: () => void;
  onReset: () => void;
  locale: SearchFormLocale;
};

export function SearchActions({
  variant = 'menu',
  showSearchButton = true,
  showResetButton = true,
  searchText,
  resetText,
  disabled,
  classNames,
  styles,
  actionExtra,
  onSubmit,
  onReset,
  locale,
}: SearchActionsProps) {
  const { styles: formStyles, cx } = useStyles();
  if (
    !showSearchButton &&
    !showResetButton &&
    (actionExtra === null || actionExtra === undefined)
  )
    return null;
  return (
    <div
      className={cx(
        formStyles.searchActions,
        variant === 'menu' && formStyles.menuActions,
        variant === 'drawer' && formStyles.drawerFooter,
        variant === 'inline' && formStyles.inlineActions,
        classNames?.actions,
      )}
      style={styles?.actions}
    >
      {showSearchButton && (
        <Button type="primary" onClick={onSubmit} disabled={disabled}>
          {searchText ?? locale.search}
        </Button>
      )}
      {showResetButton && (
        <Button onClick={onReset} disabled={disabled}>
          {resetText ?? locale.reset}
        </Button>
      )}
      {actionExtra}
    </div>
  );
}
