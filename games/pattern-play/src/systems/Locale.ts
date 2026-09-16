import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('pattern-play');
export type { LangMode } from '@shared/locale';
