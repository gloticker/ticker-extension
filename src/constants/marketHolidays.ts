import { format } from "date-fns-tz";

export const US_MARKET_HOLIDAYS_2025 = [
  "2025-01-01", // New Year's Day
  "2025-01-20", // Martin Luther King Jr. Day
  "2025-02-17", // Washington's Birthday
  "2025-04-18", // Good Friday
  "2025-05-26", // Memorial Day
  "2025-06-19", // Juneteenth National Independence Day
  "2025-07-04", // Independence Day
  "2025-09-01", // Labor Day
  "2025-11-27", // Thanksgiving Day
  "2025-12-25", // Christmas Day
];

export const US_MARKET_HOLIDAYS_2026 = [
  "2026-01-01", // New Year's Day
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-02-16", // Washington's Birthday
  "2026-04-03", // Good Friday
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth National Independence Day
  "2026-07-03", // Independence Day (Observed)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving Day
  "2026-12-25", // Christmas Day
];

export const US_MARKET_HOLIDAYS_2027 = [
  "2027-01-01", // New Year's Day
  "2027-01-18", // Martin Luther King Jr. Day
  "2027-02-15", // Washington's Birthday
  "2027-03-26", // Good Friday
  "2027-05-31", // Memorial Day
  "2027-06-18", // Juneteenth National Independence Day (Observed)
  "2027-07-05", // Independence Day (Observed)
  "2027-09-06", // Labor Day
  "2027-11-25", // Thanksgiving Day
  "2027-12-24", // Christmas Day (Observed)
];

export const isMarketHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const dateStr = format(date, "yyyy-MM-dd");

  if (year >= 2025 && year <= 2027) {
    switch (year) {
      case 2025:
        return US_MARKET_HOLIDAYS_2025.includes(dateStr);
      case 2026:
        return US_MARKET_HOLIDAYS_2026.includes(dateStr);
      case 2027:
        return US_MARKET_HOLIDAYS_2027.includes(dateStr);
    }
  }

  return false;
};
