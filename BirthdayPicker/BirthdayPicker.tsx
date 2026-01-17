import * as React from "react";
import {
  Button,
  Field,
  FluentProvider,
  Input,
  makeStyles,
  mergeClasses,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  tokens,
  webDarkTheme,
  webLightTheme,
  type Theme,
} from "@fluentui/react-components";
import {
  buildMonthOptions,
  buildYearOptions,
  filterMonthOptions,
  filterNumberOptions,
  filterYearOptions,
  formatIsoDate,
  getAvailableDays,
  getAvailableMonths,
  getMaxDayForSelection,
  getMaxMonthForYear,
  parseIsoDate,
  type DateParts,
  type MonthOption,
} from "./birthdayPickerUtils";

export interface BirthdayPickerComponentProps {
  value: string | null;
  minYear: number;
  locale: string;
  monthNames?: string[];
  disabled: boolean;
  today: DateParts;
  theme?: Theme;
  isDarkTheme?: boolean;
  isRTL: boolean;
  onValueChange: (value: string | null) => void;
}

const useStyles = makeStyles({
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalS,
    // backgroundColor: "green",
  },

  row: {
    display: "flex",
    flexDirection: "row", // ensure horizontal layout
    flexWrap: "nowrap", // keep items on a single line
    columnGap: tokens.spacingHorizontalM,
    alignItems: "start",
    width: "100%",
    // overflowX: "auto",          // OPTIONAL: show horizontal scroll when space is tight
    overflow: "hidden", // Alternative: hide overflow instead of scroll
  },

  field: {
    flex: "1 1 0", // allow shrinking before wrap
    minWidth: 0, // IMPORTANT: enables flexbox shrink (was "10px")
    // border: "1px solid #ff3b30",
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalXS,
  },

  combobox: {
    width: "100%",
    minWidth: 0, // IMPORTANT: lets input shrink within flex item (was "10px")
  },

  fieldSmall: {
    flex: "1 1 0", // Day, Year
  },

  fieldLarge: {
    flex: "2 1 0", // Month (larger to fit month names)
  },

  input: {
    width: "100%",
    minWidth: 0,
  },

  popoverSurface: {
    width: "auto",
    minWidth: "220px",
    maxWidth: "380px",
  },

  grid: {
    display: "grid",
    gap: tokens.spacingHorizontalS,
    width: "100%",
  },

  gridScroll: {
    maxHeight: `calc(6 * 32px + 5 * ${tokens.spacingHorizontalS})`,
    overflowY: "auto",
  },

  gridDays: {
    gridTemplateColumns: "repeat(7, minmax(32px, 1fr))",
  },

  gridMonths: {
    gridTemplateColumns: "repeat(3, minmax(84px, 1fr))",
  },

  gridYears: {
    gridTemplateColumns: "repeat(5, minmax(52px, 1fr))",
  },

  tile: {
    width: "100%",
    minHeight: "32px",
    borderRadius: tokens.borderRadiusSmall,
    color: tokens.colorNeutralForeground1,
  },

  tileSelected: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorNeutralForeground1,
  },
});

const getMonthLabelMap = (options: MonthOption[]): Map<number, string> => {
  const map = new Map<number, string>();
  options.forEach((option) => {
    map.set(option.value, option.label);
  });
  return map;
};

export const BirthdayPickerComponent: React.FC<BirthdayPickerComponentProps> = (
  props
) => {
  const {
    value,
    minYear,
    locale,
    monthNames,
    disabled,
    today,
    theme,
    isDarkTheme,
    isRTL,
    onValueChange,
  } = props;
  const styles = useStyles();
  const lastEmittedRef = React.useRef<string | null>(value ?? null);
  const lastChangeWasInternalRef = React.useRef(false);

  const fluentTheme = theme ?? (isDarkTheme ? webDarkTheme : webLightTheme);

  const yearOptions = React.useMemo(
    () => buildYearOptions(minYear, today.year),
    [minYear, today.year]
  );
  const monthOptions = React.useMemo(
    () => buildMonthOptions(locale, monthNames),
    [locale, monthNames]
  );
  const monthLabelMap = React.useMemo(
    () => getMonthLabelMap(monthOptions),
    [monthOptions]
  );

  const [selectedYear, setSelectedYear] = React.useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = React.useState<
    number | undefined
  >();
  const [selectedDay, setSelectedDay] = React.useState<number | undefined>();
  const [yearInput, setYearInput] = React.useState<string>("");
  const [monthInput, setMonthInput] = React.useState<string>("");
  const [dayInput, setDayInput] = React.useState<string>("");
  const [yearFilter, setYearFilter] = React.useState<string>("");
  const [monthFilter, setMonthFilter] = React.useState<string>("");
  const [dayFilter, setDayFilter] = React.useState<string>("");
  const [isYearOpen, setIsYearOpen] = React.useState(false);
  const [isMonthOpen, setIsMonthOpen] = React.useState(false);
  const [isDayOpen, setIsDayOpen] = React.useState(false);

  const parseNumericInput = React.useCallback((value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }, []);

  const setYearSelection = React.useCallback((year?: number) => {
    setSelectedYear(year);
    setYearInput(year ? year.toString() : "");
    setYearFilter("");
  }, []);

  const setMonthSelection = React.useCallback(
    (month?: number) => {
      setSelectedMonth(month);
      setMonthInput(month ? monthLabelMap.get(month) ?? month.toString() : "");
      setMonthFilter("");
    },
    [monthLabelMap]
  );

  const setDaySelection = React.useCallback((day?: number) => {
    setSelectedDay(day);
    setDayInput(day ? day.toString() : "");
    setDayFilter("");
  }, []);

  React.useEffect(() => {
    if (lastChangeWasInternalRef.current && value === lastEmittedRef.current) {
      lastChangeWasInternalRef.current = false;
      return;
    }
    lastChangeWasInternalRef.current = false;
    lastEmittedRef.current = value ?? null;
    if (!value) {
      setSelectedYear(undefined);
      setSelectedMonth(undefined);
      setSelectedDay(undefined);
      setYearInput("");
      setMonthInput("");
      setDayInput("");
      setYearFilter("");
      setMonthFilter("");
      setDayFilter("");
      return;
    }
    const parsed = parseIsoDate(value);
    if (!parsed) {
      setSelectedYear(undefined);
      setSelectedMonth(undefined);
      setSelectedDay(undefined);
      setYearInput("");
      setMonthInput("");
      setDayInput("");
      setYearFilter("");
      setMonthFilter("");
      setDayFilter("");
      return;
    }
    setSelectedYear(parsed.year);
    setSelectedMonth(parsed.month);
    setSelectedDay(parsed.day);
    setYearInput(parsed.year.toString());
    setMonthInput(monthLabelMap.get(parsed.month) ?? parsed.month.toString());
    setDayInput(parsed.day.toString());
  }, [value, monthLabelMap]);

  React.useEffect(() => {
    if (!selectedMonth) {
      return;
    }
    const label = monthLabelMap.get(selectedMonth);
    if (label && label !== monthInput) {
      setMonthInput(label);
    }
  }, [monthLabelMap, monthInput, selectedMonth]);

  React.useEffect(() => {
    if (selectedYear == null) {
      return;
    }
    if (selectedMonth == null) {
      return;
    }
    const maxMonth = getMaxMonthForYear(selectedYear, today);
    if (selectedMonth > maxMonth) {
      setMonthSelection(maxMonth);
    }
  }, [selectedYear, selectedMonth, today, setMonthSelection]);

  React.useEffect(() => {
    if (selectedMonth == null || selectedDay == null) {
      return;
    }
    const maxDay = getMaxDayForSelection(selectedYear, selectedMonth, today);
    if (selectedDay > maxDay) {
      setDaySelection(undefined);
    }
  }, [selectedYear, selectedMonth, selectedDay, today, setDaySelection]);

  const availableMonths = React.useMemo(
    () => getAvailableMonths(monthOptions, selectedYear, today),
    [monthOptions, selectedYear, today]
  );
  const availableDays = React.useMemo(
    () => getAvailableDays(selectedYear, selectedMonth, today),
    [selectedYear, selectedMonth, today]
  );

  const filteredMonths = React.useMemo(
    () => filterMonthOptions(availableMonths, monthFilter),
    [availableMonths, monthFilter]
  );
  const filteredDays = React.useMemo(
    () => filterNumberOptions(availableDays, dayFilter),
    [availableDays, dayFilter]
  );
  const filteredYears = React.useMemo(
    () => filterYearOptions(yearOptions, yearFilter),
    [yearOptions, yearFilter]
  );

  const dayDisabled = disabled;

  const computedIso = React.useMemo(() => {
    if (selectedYear && selectedMonth && selectedDay) {
      return formatIsoDate(selectedYear, selectedMonth, selectedDay);
    }
    return null;
  }, [selectedYear, selectedMonth, selectedDay]);

  React.useEffect(() => {
    if (computedIso !== lastEmittedRef.current) {
      lastEmittedRef.current = computedIso;
      lastChangeWasInternalRef.current = true;
      onValueChange(computedIso);
    }
  }, [computedIso, onValueChange]);

  const onYearInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setYearInput(nextValue);
      setYearFilter(nextValue);
      if (!nextValue) {
        setSelectedYear(undefined);
      }
    },
    []
  );

  const onMonthInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setMonthInput(nextValue);
      setMonthFilter(nextValue);
      if (!nextValue) {
        setSelectedMonth(undefined);
      }
    },
    []
  );

  const onDayInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setDayInput(nextValue);
      setDayFilter(nextValue);
      if (!nextValue) {
        setSelectedDay(undefined);
      }
    },
    []
  );

  const onYearOptionSelect = React.useCallback(
    (year?: number) => {
      setYearSelection(year);
      setIsYearOpen(false);
    },
    [setYearSelection]
  );

  const onMonthOptionSelect = React.useCallback(
    (month?: number) => {
      setMonthSelection(month);
      setIsMonthOpen(false);
    },
    [setMonthSelection]
  );

  const onDayOptionSelect = React.useCallback(
    (day?: number) => {
      setDaySelection(day);
      setIsDayOpen(false);
    },
    [setDaySelection]
  );

  const commitYearInput = React.useCallback(
    (inputValue: string) => {
      const parsed = parseNumericInput(inputValue);
      if (parsed == null) {
        setYearSelection(undefined);
        return;
      }
      if (parsed < minYear || parsed > today.year) {
        setYearSelection(undefined);
        return;
      }
      setYearSelection(parsed);
    },
    [minYear, parseNumericInput, setYearSelection, today.year]
  );

  const handleMonthBlur = React.useCallback(() => {
    if (selectedMonth) {
      setMonthInput(
        monthLabelMap.get(selectedMonth) ?? selectedMonth.toString()
      );
    } else {
      setMonthInput("");
    }
    setMonthFilter("");
  }, [selectedMonth, monthLabelMap]);

  const commitDayInput = React.useCallback(
    (inputValue: string) => {
      const parsed = parseNumericInput(inputValue);
      if (parsed == null) {
        setDaySelection(undefined);
        return;
      }
      const maxDay = selectedMonth
        ? getMaxDayForSelection(selectedYear, selectedMonth, today)
        : 31;
      if (parsed < 1 || parsed > maxDay) {
        setDaySelection(undefined);
        return;
      }
      setDaySelection(parsed);
    },
    [parseNumericInput, selectedMonth, selectedYear, setDaySelection, today]
  );

  const handleYearBlur = React.useCallback(() => {
    commitYearInput(yearInput);
  }, [commitYearInput, yearInput]);

  const handleDayBlur = React.useCallback(() => {
    commitDayInput(dayInput);
  }, [commitDayInput, dayInput]);

  const onYearOpenChange = React.useCallback((open: boolean) => {
    setIsYearOpen(open);
    if (open) {
      setYearFilter("");
    }
  }, []);

  const onMonthOpenChange = React.useCallback((open: boolean) => {
    setIsMonthOpen(open);
    if (open) {
      setMonthFilter("");
    }
  }, []);

  const onDayOpenChange = React.useCallback((open: boolean) => {
    setIsDayOpen(open);
    if (open) {
      setDayFilter("");
    }
  }, []);

  return (
    <FluentProvider theme={fluentTheme} dir={isRTL ? "rtl" : "ltr"}>
      <>
        
        <div
        
          style={{ display: "block", width: "100%", boxSizing: "border-box" }}
        
        >
       
        <div
          className={styles.container}         
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className={styles.row}>
            <Field className={mergeClasses(styles.field, styles.fieldSmall)}>
              <Popover
                open={isDayOpen}
                onOpenChange={(_, data) => onDayOpenChange(data.open)}
                positioning="below-start"
              >
                <PopoverTrigger>
                  <Input
                    className={styles.input}
                    aria-label="Day"
                    appearance="filled-darker"
                    placeholder="Day"
                    value={dayInput}
                    aria-haspopup="grid"
                    aria-expanded={isDayOpen}
                    onClick={() => onDayOpenChange(true)}
                    onChange={onDayInputChange}
                    onBlur={handleDayBlur}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        commitDayInput(dayInput);
                        setIsDayOpen(false);
                      }
                    }}
                    disabled={dayDisabled}
                  />
                </PopoverTrigger>
                <PopoverSurface
                  aria-label="Day picker"
                  className={styles.popoverSurface}
                >
                  <div
                    className={mergeClasses(
                      styles.grid,
                      styles.gridDays,
                      styles.gridScroll
                    )}
                    role="grid"
                  >
                    {filteredDays.map((day) => {
                      const isSelected = selectedDay === day;
                      return (
                        <Button
                          key={day}
                          className={mergeClasses(
                            styles.tile,
                            isSelected && styles.tileSelected
                          )}
                          appearance="subtle"
                          size="small"
                          aria-pressed={isSelected}
                          onClick={() => onDayOptionSelect(day)}
                        >
                          {day}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverSurface>
              </Popover>
            </Field>

            <Field className={mergeClasses(styles.field, styles.fieldLarge)}>
              <Popover
                open={isMonthOpen}
                onOpenChange={(_, data) => onMonthOpenChange(data.open)}
                positioning="below-start"
              >
                <PopoverTrigger>
                  <Input
                    className={styles.input}
                    aria-label="Month"
                    appearance="filled-darker"
                    placeholder="Month"
                    value={monthInput}
                    aria-haspopup="grid"
                    aria-expanded={isMonthOpen}
                    onClick={() => onMonthOpenChange(true)}
                    onChange={onMonthInputChange}
                    onBlur={handleMonthBlur}
                    disabled={disabled}
                  />
                </PopoverTrigger>
                <PopoverSurface
                  aria-label="Month picker"
                  className={styles.popoverSurface}
                >
                  <div
                    className={mergeClasses(
                      styles.grid,
                      styles.gridMonths,
                      styles.gridScroll
                    )}
                    role="grid"
                  >
                    {filteredMonths.map((month) => {
                      const isSelected = selectedMonth === month.value;
                      return (
                        <Button
                          key={month.value}
                          className={mergeClasses(
                            styles.tile,
                            isSelected && styles.tileSelected
                          )}
                          appearance="subtle"
                          size="small"
                          aria-pressed={isSelected}
                          onClick={() => onMonthOptionSelect(month.value)}
                        >
                          {month.label}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverSurface>
              </Popover>
            </Field>

            <Field className={mergeClasses(styles.field, styles.fieldSmall)}>
              <Popover
                open={isYearOpen}
                onOpenChange={(_, data) => onYearOpenChange(data.open)}
                positioning="below-start"
              >
                <PopoverTrigger>
                  <Input
                    className={styles.input}
                    aria-label="Year"
                    appearance="filled-darker"
                    placeholder="Year"
                    value={yearInput}
                    aria-haspopup="grid"
                    aria-expanded={isYearOpen}
                    onClick={() => onYearOpenChange(true)}
                    onChange={onYearInputChange}
                    onBlur={handleYearBlur}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        commitYearInput(yearInput);
                        setIsYearOpen(false);
                      }
                    }}
                    disabled={disabled}
                  />
                </PopoverTrigger>
                <PopoverSurface
                  aria-label="Year picker"
                  className={styles.popoverSurface}
                >
                  <div
                    className={mergeClasses(
                      styles.grid,
                      styles.gridYears,
                      styles.gridScroll
                    )}
                    role="grid"
                  >
                    {filteredYears.map((year) => {
                      const isSelected = selectedYear === year;
                      return (
                        <Button
                          key={year}
                          className={mergeClasses(
                            styles.tile,
                            isSelected && styles.tileSelected
                          )}
                          appearance="subtle"
                          size="small"
                          aria-pressed={isSelected}
                          onClick={() => onYearOptionSelect(year)}
                        >
                          {year}
                        </Button>
                      );
                    })}
                  </div>
                </PopoverSurface>
              </Popover>
            </Field>
          </div>
        </div>
        
        </div>
       
      </>
    </FluentProvider>
  );
};

BirthdayPickerComponent.displayName = "BirthdayPickerComponent";
