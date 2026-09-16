import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('duas-builder');
export type { LangMode } from '@shared/locale';
