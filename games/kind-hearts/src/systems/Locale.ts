import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('kind-hearts');
export type { LangMode } from '@shared/locale';
