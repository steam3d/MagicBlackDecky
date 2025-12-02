import { call } from "@decky/api";

export const parseBooleanSetting = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return fallback;
};

export const saveSetting = async (key: string, value: any): Promise<boolean> => {
  try {
    const response = await call<[key: string, value: any], boolean>("save_setting", key, value);
    return response;
  } catch (error) {
    console.error(`[MagicBlack] Backend: Exception while saving setting: ${key}`, error);
    return false;
  }
};

export const loadBooleanSetting = async (key: string, fallback = false): Promise<boolean> => {
  try {
    const response = await call<[string], string | boolean | null>("load_setting", key);
    return parseBooleanSetting(response, fallback);
  } catch (error) {
    console.error(`[MagicBlack] Failed to load ${key} setting`, error);
    return fallback;
  }
};

export const loadNumberSetting = async (key: string): Promise<number | null> => {
  try {
    const value = await call<[string], string | number | null>("load_setting", key);
    const parsed = Number(value);
    if (isNaN(parsed)) {
      console.error("[MagicBlack] Backend: Invalid number in setting:", key, value);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error(`[MagicBlack] Failed to load ${key} number setting`, error);
    return null;
  }
};
