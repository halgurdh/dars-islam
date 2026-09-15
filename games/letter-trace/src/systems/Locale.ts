import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('letter-trace');
export type { LangMode } from '@shared/locale';
