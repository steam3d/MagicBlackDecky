import { useCallback, useRef } from "react";

type ReleaseHandle = (() => void) | null;

/**
 * Provides helpers for capturing all gamepad input through SteamUI's NavigationManager.
 */
export const useCatchAllGamepad = () => {
  const releaseRef = useRef<ReleaseHandle>(null);
  const navManagerRef = useRef<any>(null);

  const release = useCallback(() => {
    if (!navManagerRef.current) {
      releaseRef.current = null;
      return;
    }

    if (releaseRef.current) {
      releaseRef.current();
    } else if (navManagerRef.current?.SetCatchAllGamepadInput) {
      navManagerRef.current.SetCatchAllGamepadInput(null);
    }

    navManagerRef.current = null;
    releaseRef.current = null;
  }, []);

  const subscribe = useCallback((handler: (navEvent: unknown, rawEvent: unknown) => void) => {
    if (releaseRef.current || navManagerRef.current) {
      return;
    }

    const navManager = (window as any)?.SteamUIStore?.NavigationManager;
    if (!navManager?.SetCatchAllGamepadInput) {
      return;
    }

    navManagerRef.current = navManager;
    const releaseHandle = navManager.SetCatchAllGamepadInput(handler);

    if (typeof releaseHandle === "function") {
      releaseRef.current = releaseHandle;
      return;
    }

    releaseRef.current = () => {
      navManager.SetCatchAllGamepadInput(null);
    };
  }, []);

  return { subscribe, release };
};
