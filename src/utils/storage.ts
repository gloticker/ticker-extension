const isDevelopment = typeof chrome === "undefined" || !chrome.storage;

const localStorageWrapper = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        // 값이 JSON이 아닌 경우 원래 값을 반환
        return value as unknown as T;
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      const stringValue = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
      localStorage.setItem(key, stringValue);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  setMultiple: async <T extends Record<string, unknown>>(items: T): Promise<void> => {
    try {
      Object.entries(items).forEach(([key, value]) => {
        const stringValue =
          typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
      });
    } catch (error) {
      console.error("Error writing multiple items to localStorage:", error);
    }
  },

  getMultiple: async <T>(keys: string[]): Promise<Record<string, T>> => {
    const result: Record<string, T> = {};
    try {
      keys.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            // 값이 JSON이 아닌 경우 원래 값을 반환
            result[key] = value as unknown as T;
          }
        }
      });
    } catch (error) {
      console.error("Error reading multiple items from localStorage:", error);
    }
    return result;
  },
};

const chromeStorageWrapper = {
  get: async <T>(key: string): Promise<T | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  },

  remove: async (key: string): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  },

  setMultiple: async <T extends Record<string, unknown>>(items: T): Promise<void> => {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, () => {
        resolve();
      });
    });
  },

  getMultiple: async <T>(keys: string[]): Promise<Record<string, T>> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result as Record<string, T>);
      });
    });
  },
};

export const storage = isDevelopment ? localStorageWrapper : chromeStorageWrapper;

// 개발 환경인지 로그로 확인
console.log(
  "Storage mode:",
  isDevelopment ? "localStorage (Development)" : "chrome.storage (Production)"
);
