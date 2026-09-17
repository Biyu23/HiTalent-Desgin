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
> & {
  onSubmit: () => void;
  onReset: () => void;
  locale: SearchFormLocale;
};

export function SearchActions({
  showSearchButton = true,
  showResetButton = true,
  searchText,
  resetText,
  disabled,
  classNames,
  styles,
  onSubmit,
  onReset,
  locale,
}: SearchActionsProps) {
  const { styles: formStyles, cx } = useStyles();
  if (!showSearchButton && !showResetButton) return null;
  return (
    <div
      className={cx(formStyles.drawerFooter, classNames?.actions)}
      style={styles?.actions}
    >
      {showResetButton && (
        <Button onClick={onReset} disabled={disabled}>
          {resetText ?? locale.reset}
        </Button>
      )}
      {showSearchButton && (
        <Button type="primary" onClick={onSubmit} disabled={disabled}>
          {searchText ?? locale.search}
        </Button>
      )}
    </div>
  );
}
