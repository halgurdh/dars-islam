import { createLocale } from '@shared/locale';

export const { getLang, setLang, toggleLang, detectDefaultLang } = createLocale('times-table-dojo');
export type { LangMode } from '@shared/locale';
