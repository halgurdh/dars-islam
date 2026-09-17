import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('fiqh-essentials');
export type { LangMode } from '@shared/locale';
