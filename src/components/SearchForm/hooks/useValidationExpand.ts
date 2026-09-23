import { useEffect, useRef, useState } from 'react';

/** 每次提交失败展开面板，之后仍允许用户手动收起。 */
export function useValidationExpand(
  defaultKeys: string[],
  allKeys: string[],
  validationAttempt: number,
) {
  const [activeKey, setActiveKey] = useState(defaultKeys);
  const lastAttempt = useRef(0);
  useEffect(() => {
    if (validationAttempt !== lastAttempt.current) {
      lastAttempt.current = validationAttempt;
      if (validationAttempt > 0) setActiveKey(allKeys);
    }
  }, [allKeys, validationAttempt]);
  return {
    activeKey,
    onChange: (keys: string | string[]) =>
      setActiveKey(Array.isArray(keys) ? keys : [keys]),
  };
}
