export interface DateParts {
    year: number;
    month: number;
    day: number;
}

export interface MonthOption {
    value: number;
    label: string;
}

export const DEFAULT_MIN_YEAR = 1901;

export const toTwoDigit = (value: number): string => value.toString().padStart(2, "0");

export const formatIsoDate = (year: number, month: number, day: number): string => {
    return `${year}-${toTwoDigit(month)}-${toTwoDigit(day)}`;
};

export const parseIsoDate = (value?: string | null): DateParts | null => {
    if (!value) {
        return null;
    }
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    return { year, month, day };
};

export const dateToIso = (value?: Date | null): string | null => {
    if (!value) {
        return null;
    }
    return formatIsoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
};

export const getTodayParts = (value: Date): DateParts => {
    return {
        year: value.getFullYear(),
        month: value.getMonth() + 1,
        day: value.getDate(),
    };
};

export const isLeapYear = (year: number): boolean => {
    if (year % 400 === 0) {
        return true;
    }
    if (year % 100 === 0) {
        return false;
    }
    return year % 4 === 0;
};

export const getDaysInMonth = (year: number, month: number): number => {
    switch (month) {
        case 2:
            return isLeapYear(year) ? 29 : 28;
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
        default:
            return 31;
    }
};

export const getMaxMonthForYear = (selectedYear: number | undefined, today: DateParts): number => {
    if (!selectedYear) {
        return 12;
    }
    return selectedYear === today.year ? today.month : 12;
};

const FALLBACK_YEAR = 2001;

export const getMaxDayForSelection = (
    selectedYear: number | undefined,
    selectedMonth: number | undefined,
    today: DateParts
): number => {
    if (!selectedMonth) {
        return 31;
    }
    const year = selectedYear ?? FALLBACK_YEAR;
    const maxByMonth = getDaysInMonth(year, selectedMonth);
    if (selectedYear === today.year && selectedMonth === today.month) {
        return Math.min(today.day, maxByMonth);
    }
    return maxByMonth;
};

export const buildYearOptions = (minYear: number, maxYear: number): number[] => {
    const start = Math.min(minYear, maxYear);
    const years: number[] = [];
    for (let year = maxYear; year >= start; year -= 1) {
        years.push(year);
    }
    return years;
};

export const buildMonthOptions = (locale: string, monthNames?: string[]): MonthOption[] => {
    let resolvedLocale = locale;
    try {
        new Intl.DateTimeFormat(locale);
    } catch {
        resolvedLocale = "en-AU";
    }
    const formatter = new Intl.DateTimeFormat(resolvedLocale, { month: "long", timeZone: "UTC" });
    const names =
        monthNames && monthNames.length >= 12
            ? monthNames
                  .slice(0, 12)
                  .map((name, index) =>
                      name && name.trim().length > 0
                          ? name
                          : formatter.format(new Date(Date.UTC(2020, index, 1)))
                  )
            : Array.from({ length: 12 }, (_, index) => formatter.format(new Date(Date.UTC(2020, index, 1))));
    return names.map((label, index) => ({ value: index + 1, label }));
};

export const getAvailableMonths = (
    options: MonthOption[],
    selectedYear: number | undefined,
    today: DateParts
): MonthOption[] => {
    const maxMonth = getMaxMonthForYear(selectedYear, today);
    return options.filter((option) => option.value <= maxMonth);
};

export const getAvailableDays = (
    selectedYear: number | undefined,
    selectedMonth: number | undefined,
    today: DateParts
): number[] => {
    if (!selectedMonth) {
        return Array.from({ length: 31 }, (_, index) => index + 1);
    }
    const maxDay = getMaxDayForSelection(selectedYear, selectedMonth, today);
    return Array.from({ length: maxDay }, (_, index) => index + 1);
};

const normalizeFilterText = (value: string): string => value.trim().toLowerCase();

export const filterMonthOptions = (options: MonthOption[], input: string): MonthOption[] => {
    const filter = normalizeFilterText(input);
    if (!filter) {
        return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(filter));
};

export const filterNumberOptions = (options: number[], input: string): number[] => {
    const filter = normalizeFilterText(input);
    if (!filter) {
        return options;
    }
    return options.filter((value) => value.toString().includes(filter));
};

export const filterYearOptions = (options: number[], input: string): number[] => {
    const filter = normalizeFilterText(input);
    if (!filter) {
        return options;
    }
    return options.filter((value) => value.toString().startsWith(filter));
};
