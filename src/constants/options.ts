import type { LanguageCode } from "@/types/saved";
import type { LocaleKey } from "@/locales";

// 介面語言選項（固定，顯示各語言的母語名稱）
export const LOCALE_OPTIONS: { value: LocaleKey; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "th", label: "ไทย" },
  { value: "ja", label: "日本語" },
];

// 翻譯目標語言的 key 順序（label 由 t.languages 提供）
export const LANGUAGE_KEYS: LanguageCode[] = ["en", "zh", "th", "ja"];
