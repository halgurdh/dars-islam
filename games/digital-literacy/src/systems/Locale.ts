import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('digital-literacy');
export type { LangMode } from '@shared/locale';
