import { useCallback, useRef } from "react";
import { getSleepManagerModule } from "../utils/sleepManager";

type ReleaseHandle = (() => void) | null;

const buildReleaseHandle = (handle: unknown): ReleaseHandle => {
  if (!handle) {
    return null;
  }
  if (typeof handle === "function") {
    return handle as () => void;
  }
  if (typeof (handle as any).unregister === "function") {
    return () => {
      (handle as any).unregister();
    };
  }
  if (typeof (handle as any).Unregister === "function") {
    return () => {
      (handle as any).Unregister();
    };
  }
  return null;
};

const getRegisterFunction = (): ((handler: () => void) => unknown) | null => {
  const sleepManagerModule = getSleepManagerModule();
  if (sleepManagerModule?.RegisterForNotifyResumeFromSuspend) {
    return sleepManagerModule.RegisterForNotifyResumeFromSuspend;
  }

  const steamClient = (window as any)?.SteamClient;
  return (
    steamClient?.System?.RegisterForNotifyResumeFromSuspend ??
    steamClient?.System?.SleepManager?.RegisterForNotifyResumeFromSuspend ??
    null
  );
};

/**
 * Subscribes to SteamOS suspend resume notifications and provides a cleanup helper.
 */
export const useResumeFromSuspendNotification = () => {
  const releaseRef = useRef<ReleaseHandle>(null);

  const release = useCallback(() => {
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
  }, []);

  const subscribe = useCallback((handler: () => void) => {
    if (releaseRef.current) {
      return;
    }

    const registerFn = getRegisterFunction();
    if (typeof registerFn !== "function") {
      return;
    }

    const handle = registerFn(handler);
    const releaseHandle = buildReleaseHandle(handle);
    releaseRef.current = releaseHandle;
  }, []);

  return { subscribe, release };
};
