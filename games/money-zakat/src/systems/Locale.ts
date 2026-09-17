import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('money-zakat');
export type { LangMode } from '@shared/locale';
