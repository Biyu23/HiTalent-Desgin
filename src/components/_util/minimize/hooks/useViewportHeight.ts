import { useEffect, useState } from 'react';

const DEFAULT_VIEWPORT_HEIGHT = 900;

const getViewportHeight = (): number =>
  typeof window === 'undefined' ? DEFAULT_VIEWPORT_HEIGHT : window.innerHeight;

const useViewportHeight = (): number => {
  const [height, setHeight] = useState(getViewportHeight);

  useEffect(() => {
    const handleResize = () => setHeight(getViewportHeight());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
};

export default useViewportHeight;
