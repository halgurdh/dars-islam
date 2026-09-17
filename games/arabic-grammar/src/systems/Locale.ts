import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('arabic-grammar');
export type { LangMode } from '@shared/locale';
