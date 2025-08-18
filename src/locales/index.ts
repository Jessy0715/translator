import { zh } from './zh';
import { en } from './en';
import { th } from './th';

export type LocaleKey = 'zh' | 'en' | 'th';

export const locales = {
  zh,
  en,
  th
};

export type Translations = typeof zh;

export const defaultLocale: LocaleKey = 'zh';