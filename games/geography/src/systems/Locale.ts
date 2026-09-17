import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('geography');
export type { LangMode } from '@shared/locale';
