import { useEffect, useState } from "react";

interface DeviceSpec {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  isDesktop: boolean;
}

export const useDeviceSpec = (): DeviceSpec => {
  const [spec, setSpec] = useState<DeviceSpec>({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateSpec = () => {
      const width = window.innerWidth;
      const isTouch = 
        "ontouchstart" in window || 
        navigator.maxTouchPoints > 0;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      setSpec({
        isMobile,
        isTablet,
        isTouch,
        isDesktop,
      });
    };

    updateSpec();
    window.addEventListener("resize", updateSpec);
    return () => window.removeEventListener("resize", updateSpec);
  }, []);

  return spec;
};
