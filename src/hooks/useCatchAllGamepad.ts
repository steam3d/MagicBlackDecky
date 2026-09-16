import { useCallback, useRef } from "react";

type ReleaseHandle = (() => void) | null;

const buildReleaseHandle = (handle: unknown): ReleaseHandle => {
  if (typeof handle === "function") {
    return handle as () => void;
  }
  if (handle && typeof (handle as any).Unregister === "function") {
    return () => {
      (handle as any).Unregister();
    };
  }
  if (handle && typeof (handle as any).unregister === "function") {
    return () => {
      (handle as any).unregister();
    };
  }
  return null;
};

/**
 * Provides helpers for capturing all gamepad input through SteamUI's NavigationManager.
 */
export const useCatchAllGamepad = () => {
  const releaseRef = useRef<ReleaseHandle>(null);
  const navManagerRef = useRef<any>(null);

  const release = useCallback(() => {
    const releaseHandle = releaseRef.current;
    navManagerRef.current = null;
    releaseRef.current = null;
    releaseHandle?.();
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
    releaseRef.current = buildReleaseHandle(
      navManager.SetCatchAllGamepadInput(handler),
    );
  }, []);

  return { subscribe, release };
};
