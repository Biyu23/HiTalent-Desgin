type EqualityComparator<Value> = (left: Value, right: Value) => boolean;

export function areArraysEqual<Value>(
  left: readonly Value[],
  right: readonly Value[],
  isEqual: EqualityComparator<Value> = Object.is,
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => isEqual(value, right[index]))
  );
}

export function areMapsEqual<Key, Value>(
  left: ReadonlyMap<Key, Value>,
  right: ReadonlyMap<Key, Value>,
  isEqual: EqualityComparator<Value> = Object.is,
): boolean {
  if (left.size !== right.size) return false;

  for (const [key, value] of left) {
    if (!right.has(key) || !isEqual(value, right.get(key) as Value)) {
      return false;
    }
  }

  return true;
}
