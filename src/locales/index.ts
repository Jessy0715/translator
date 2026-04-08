import { zh } from './zh';
import { en } from './en';
import { th } from './th';
import { ja } from './ja';

export type LocaleKey = 'zh' | 'en' | 'th' | 'ja';

export const locales = {
  zh,
  en,
  th,
  ja
};

export type Translations = typeof zh;

export const defaultLocale: LocaleKey = 'zh';