import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('number-basics');
export type { LangMode } from '@shared/locale';
