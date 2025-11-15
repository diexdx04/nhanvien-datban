import { useState, useEffect } from 'react';

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if ((width === 1024 && height === 1366) || 
          (width === 1366 && height === 1024) ||
          (width >= 768 && width <= 1024 && /iPad|iPhone|iPod/.test(navigator.userAgent))) {
        setDeviceType('tablet');
      } else if (width >= 1024) {
        setDeviceType('desktop');
      } else {
        setDeviceType('mobile');
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceType;
};

export default useDeviceType;

