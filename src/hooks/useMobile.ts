import { useDeviceSpec } from "./useDeviceSpec";

export const useMobile = () => {
  const { isMobile } = useDeviceSpec();
  return isMobile;
};
