import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('mental-math-sprint');
export type { LangMode } from '@shared/locale';
