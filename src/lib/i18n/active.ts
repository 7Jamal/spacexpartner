/**
 * The locale currently shown to the user. Kept in a tiny standalone module so
 * non-React formatters (dates, currency) can read it without importing React.
 */
let activeLocale = "en";

export function setActiveLocale(code: string) {
  activeLocale = code;
}

export function getActiveLocale() {
  return activeLocale;
}