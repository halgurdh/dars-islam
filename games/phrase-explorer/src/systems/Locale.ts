import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('phrase-explorer');
export type { LangMode } from '@shared/locale';
