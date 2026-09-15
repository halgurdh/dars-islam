import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('huruf-builder');
export type { LangMode } from '@shared/locale';
