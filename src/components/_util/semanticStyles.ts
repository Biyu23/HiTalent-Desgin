import clsx from 'clsx';
import type { CSSPropertiesWithVars } from '../../types/native';

export type SemanticClassNames<Slot extends string> = Partial<
  Record<Slot, string>
>;

export type SemanticStyles<Slot extends string> = Partial<
  Record<Slot, CSSPropertiesWithVars>
>;

export interface SemanticStyleProps<Slot extends string> {
  rootClassName?: string;
  classNames?: SemanticClassNames<Slot>;
  styles?: SemanticStyles<Slot>;
}

export function mergeSemanticClassNames<Slot extends string>(
  ...sources: Array<SemanticClassNames<Slot> | undefined>
): SemanticClassNames<Slot> {
  const result: SemanticClassNames<Slot> = {};

  sources.forEach((source) => {
    if (!source) return;
    (Object.keys(source) as Slot[]).forEach((slot) => {
      const merged = clsx(result[slot], source[slot]);
      if (merged) result[slot] = merged;
    });
  });

  return result;
}

export function mergeSemanticStyles<Slot extends string>(
  ...sources: Array<SemanticStyles<Slot> | undefined>
): SemanticStyles<Slot> {
  const result: SemanticStyles<Slot> = {};

  sources.forEach((source) => {
    if (!source) return;
    (Object.keys(source) as Slot[]).forEach((slot) => {
      const next = source[slot];
      if (next) result[slot] = { ...result[slot], ...next };
    });
  });

  return result;
}
