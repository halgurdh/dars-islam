import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('math-tricks-lab');
export type { LangMode } from '@shared/locale';
