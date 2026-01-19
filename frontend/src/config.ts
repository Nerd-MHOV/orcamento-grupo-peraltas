// Runtime config from window.ENV (set by config.js)
const getRuntimeEnv = (key: string, fallback: string) => {
  if (typeof window !== 'undefined' && (window as any).ENV) {
    const value = (window as any).ENV[key];
    if (value && !value.startsWith('__')) {
      return value;
    }
  }
  return import.meta.env[key] || fallback;
};

export const API_URL = getRuntimeEnv('VITE_API_URL', "http://192.168.10.87:3335");
export const PATH_IMAGES_BUDGET = getRuntimeEnv('VITE_PATH_IMAGES_BUDGET', "http://192.168.10.87:83/budgetCorpImages/");
export const PATH_IMAGES = getRuntimeEnv('VITE_PATH_IMAGES', "http://192.168.10.87:83/");
