import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('math-mastery');
export type { LangMode } from '@shared/locale';
