import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('shapes-colors');
export type { LangMode } from '@shared/locale';
