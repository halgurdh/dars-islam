import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('asma-match');
export type { LangMode } from '@shared/locale';
