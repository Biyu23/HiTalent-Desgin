const MEASUREMENT_IGNORED_PROPS = new Set([
  'id',
  'name',
  'form',
  'htmlType',
  'href',
  'target',
  'download',
  'tabIndex',
  'tooltip',
]);

export function getMeasurementButtonProps<Props extends object>(
  buttonProps?: Props,
): Props | undefined {
  if (!buttonProps) return undefined;

  const measurementProps: Record<string, unknown> = {};
  Object.entries(buttonProps).forEach(([key, value]) => {
    if (MEASUREMENT_IGNORED_PROPS.has(key) || /^on[A-Z]/.test(key)) return;
    measurementProps[key] = value;
  });

  return measurementProps as Props;
}
