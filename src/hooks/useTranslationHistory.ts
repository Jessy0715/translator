"use client";

import { useLocalStorage } from "./useLocalStorage";
import type { HistoryEntry } from "@/types/saved";

const HISTORY_KEY = "translator_history";
const MAX_HISTORY = 50;

export function useTranslationHistory() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(HISTORY_KEY, []);

  const addToHistory = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    setHistory((prev) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      // 插入最前面，並裁切超過上限的舊紀錄
      return [newEntry, ...prev].slice(0, MAX_HISTORY);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
}
