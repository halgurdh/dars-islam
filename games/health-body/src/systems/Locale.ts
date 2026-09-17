import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('health-body');
export type { LangMode } from '@shared/locale';
