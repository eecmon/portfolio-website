export type { UILang } from "./translations";
export { translations } from "./translations";

import type { UILang } from "./translations";
import { translations } from "./translations";

/**
 * Translate a UI key into the given language.
 * Falls back to English, then to the raw key if no match is found.
 */
export function t(lang: UILang | string, key: string): string {
  const safeLang = (lang === "de" ? "de" : "en") as UILang;
  return translations[safeLang]?.[key] ?? translations.en[key] ?? key;
}
