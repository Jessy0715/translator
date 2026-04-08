"use client";

import { useState, useEffect } from "react";

// 底層泛型 hook，所有讀取皆在 useEffect 中執行，避免 SSR hydration mismatch
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 只在客戶端掛載後才讀取 localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`useLocalStorage: 讀取 "${key}" 失敗`, error);
    }
  }, [key]);

  const setValue = (val: T | ((prev: T) => T)) => {
    try {
      const valueToStore = val instanceof Function ? val(storedValue) : val;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`useLocalStorage: 寫入 "${key}" 失敗`, error);
    }
  };

  return [storedValue, setValue];
}
