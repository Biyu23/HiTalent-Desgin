import { useState } from 'react';

let dockIdSeed = 0;

const useDockId = (initialId?: string): string => {
  const [id] = useState(() => initialId || `dock-${++dockIdSeed}`);
  return id;
};

export default useDockId;
