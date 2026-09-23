import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('wrapper');
export type { LangMode } from '@shared/locale';
