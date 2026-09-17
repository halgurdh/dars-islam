import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('world-history');
export type { LangMode } from '@shared/locale';
