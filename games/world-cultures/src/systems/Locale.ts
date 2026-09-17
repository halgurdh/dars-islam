import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('world-cultures');
export type { LangMode } from '@shared/locale';
