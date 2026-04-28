import type { Locale } from "date-fns";
import * as dateFnsLocales from "date-fns/locale";

const dateFnsLocaleMap: Record<string, Locale> = {
  en: dateFnsLocales.enUS,
  "en-us": dateFnsLocales.enUS,
  es: dateFnsLocales.es,
  "es-es": dateFnsLocales.es,
};

function normalizeLocale(locale: string) {
  return locale.toLowerCase();
}

export function getDateFnsLocale(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const languageCode = normalizedLocale.split("-")[0];

  return (
    dateFnsLocaleMap[normalizedLocale] ??
    dateFnsLocaleMap[languageCode] ??
    dateFnsLocales.enUS
  );
}

export function getIntlLocale(locale: string) {
  const normalizedLocale = normalizeLocale(locale);

  if (normalizedLocale === "en") {
    return "en-US";
  }

  if (normalizedLocale === "es") {
    return "es-ES";
  }

  return locale;
}

export function formatLocalizedWeekday(
  date: Date,
  locale: string,
  format: "short" | "narrow" = "short"
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    weekday: format,
  }).format(date);
}

export function formatLocalizedMonth(
  date: Date,
  locale: string,
  format: "short" | "long" = "long"
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: format,
  }).format(date);
}
