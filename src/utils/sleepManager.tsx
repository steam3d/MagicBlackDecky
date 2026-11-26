import { findModuleExport, findVar } from "@decky/ui";

export type SleepManagerModule = {
  RegisterForNotifyResumeFromSuspend?: (handler: () => void) => unknown;
  NotifyResumeFromSuspend?: (...args: any[]) => unknown;
};

const isSleepManagerModule = (exp: any): exp is SleepManagerModule => {
  if (typeof exp !== "object" || exp == null) {
    return false;
  }

  return (
    typeof exp.RegisterForNotifyResumeFromSuspend === "function" ||
    typeof exp.NotifyResumeFromSuspend === "function"
  );
};

export const getSleepManagerModule = (): SleepManagerModule | null => {
  const globalModule = (window as any)?.SleepManager;
  if (isSleepManagerModule(globalModule)) {
    return globalModule;
  }

  // Decky UI 5 exposes Steam's internal ESM variables through findVar. Keep
  // findModuleExport as a fallback for older Steam module layouts where the
  // generated client service was a public module export.
  const foundModule =
    findVar((variable: any) => isSleepManagerModule(variable)) ??
    findModuleExport((exp: any) => isSleepManagerModule(exp));
  if (isSleepManagerModule(foundModule)) {
    return foundModule;
  }

  console.warn("[MagicBlack] SleepManager module not found");
  return null;
};

//use in console test searching window.__MagicBlackTestSleepManager()
if (!(window as any).__MagicBlackTestSleepManager) {
  (window as any).__MagicBlackTestSleepManager = () => {
    const module = getSleepManagerModule();
    const status = module ? "found" : "missing";
    console.info(`[MagicBlack] SleepManager discovery test -> ${status}`);
    return module;
  };
}
