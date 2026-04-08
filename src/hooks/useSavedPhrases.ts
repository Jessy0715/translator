"use client";

import { useLocalStorage } from "./useLocalStorage";
import type { SavedPhrase } from "@/types/saved";

const SAVED_KEY = "translator_saved";

export function useSavedPhrases() {
  const [savedPhrases, setSavedPhrases] = useLocalStorage<SavedPhrase[]>(SAVED_KEY, []);

  const savePhrase = (phrase: SavedPhrase) => {
    setSavedPhrases((prev) => {
      // 避免重複收藏同一個 id
      if (prev.some((p) => p.id === phrase.id)) return prev;
      return [phrase, ...prev];
    });
  };

  const removePhrase = (id: string) => {
    setSavedPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const isSaved = (id: string): boolean => {
    return savedPhrases.some((p) => p.id === id);
  };

  return { savedPhrases, savePhrase, removePhrase, isSaved };
}
