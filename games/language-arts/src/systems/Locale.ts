import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('language-arts');
export type { LangMode } from '@shared/locale';
