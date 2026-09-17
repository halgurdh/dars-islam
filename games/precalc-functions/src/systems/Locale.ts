import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('precalc-functions');
export type { LangMode } from '@shared/locale';
