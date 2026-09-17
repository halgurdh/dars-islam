import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('civics-community');
export type { LangMode } from '@shared/locale';
