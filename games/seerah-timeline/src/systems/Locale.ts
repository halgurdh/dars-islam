import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('seerah-timeline');
export type { LangMode } from '@shared/locale';
