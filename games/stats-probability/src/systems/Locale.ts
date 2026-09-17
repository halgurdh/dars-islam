import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('stats-probability');
export type { LangMode } from '@shared/locale';
