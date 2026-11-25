// Maps an app locale (svelte-i18n code, e.g. "en", "de", "zh-TW") to a hunspell
// dictionary key, or null when the language isn't spellcheckable. Only
// Latin-script locales Milo ships dictionaries for are mapped; the three
// zh-* locales and vi return null (CJK has no Latin-style per-word spelling;
// vi has no bundled dictionary yet).
const APP_TO_DICT: Record<string, string> = {
  en: 'en',
  cs: 'cs',
  de: 'de',
  fr: 'fr',
  it: 'it',
  nb: 'nb',
  tr: 'tr',
}

// Dictionaries bundled as static assets under /spellcheck/<key>.{aff,dic}.
export const SPELLCHECK_DICTS = ['en', 'en-gb', 'cs', 'de', 'fr', 'it', 'nb', 'nl', 'tr'] as const

// Native names of the bundled dictionaries.
export const DICT_NAMES: Record<typeof SPELLCHECK_DICTS[number], string> = {
  en: 'English (US)',
  'en-gb': 'English (UK)',
  cs: 'Čeština',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  nb: 'Norsk Bokmål',
  nl: 'Nederlands',
  tr: 'Türkçe',
}

export function appLocaleToDict(locale: string | null | undefined): string | null {
  if (!locale) return null
  const lower = locale.toLowerCase()
  // Already a dictionary key (the settings toggles store these) — return it
  // as-is. Base-splitting first would collapse 'en-gb' to the 'en' (US)
  // dictionary and spellcheck the wrong variant.
  if ((SPELLCHECK_DICTS as readonly string[]).includes(lower)) return lower
  const base = lower.split('-')[0]
  return APP_TO_DICT[base] ?? null
}
