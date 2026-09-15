import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('salah-builder');
export type { LangMode } from '@shared/locale';
