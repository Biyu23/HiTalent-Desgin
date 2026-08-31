import type React from 'react';
import { useCallback, useLayoutEffect, useState } from 'react';

export interface UseDockExpansionOptions {
  rootRef: React.RefObject<HTMLElement>;
  collapsible: boolean;
  revision: string;
}

export interface DockExpansionBindings {
  expanded: boolean;
  onMouseEnter: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave: React.MouseEventHandler<HTMLDivElement>;
  onFocusCapture: React.FocusEventHandler<HTMLDivElement>;
  onBlurCapture: React.FocusEventHandler<HTMLDivElement>;
}

const useDockExpansion = ({
  rootRef,
  collapsible,
  revision,
}: UseDockExpansionOptions): DockExpansionBindings => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useLayoutEffect(() => {
    if (
      focused &&
      (!rootRef.current || !rootRef.current.contains(document.activeElement))
    ) {
      setFocused(false);
    }
  }, [focused, revision, rootRef]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setFocused(false);
    }
  }, []);

  return {
    expanded: !collapsible || hovered || focused,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocusCapture: () => setFocused(true),
    onBlurCapture: handleBlur,
  };
};

export default useDockExpansion;
