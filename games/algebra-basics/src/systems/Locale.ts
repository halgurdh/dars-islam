import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('algebra-basics');
export type { LangMode } from '@shared/locale';
