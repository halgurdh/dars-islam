import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('pillars-builder');
export type { LangMode } from '@shared/locale';
