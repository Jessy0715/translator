export type LanguageCode = 'zh' | 'en' | 'th' | 'ja';
export type SavedItemSource = 'translation' | 'phrasebook';

export interface SavedPhrase {
  id: string;
  source: SavedItemSource;
  savedAt: number;
  zh: string;
  en: string;
  th: string;
  ja: string;
  // 翻譯來源才有值
  sourceLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;
  // 常用語手冊來源才有值
  category?: string;
  subcategory?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  inputText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
}
