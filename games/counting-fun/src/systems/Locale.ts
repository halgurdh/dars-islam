import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('counting-fun');
export type { LangMode } from '@shared/locale';
