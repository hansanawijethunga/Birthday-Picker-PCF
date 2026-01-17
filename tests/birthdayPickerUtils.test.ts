import * as assert from "node:assert/strict";
import {
    buildMonthOptions,
    buildYearOptions,
    filterMonthOptions,
    filterNumberOptions,
    filterYearOptions,
    getAvailableDays,
    getAvailableMonths,
    getDaysInMonth,
    getMaxDayForSelection,
    getMaxMonthForYear,
    isLeapYear,
} from "../BirthdayPicker/birthdayPickerUtils";

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const tests: Array<{ name: string; run: () => void }> = [
    {
        name: "isLeapYear follows Gregorian rules",
        run: () => {
            assert.equal(isLeapYear(2000), true);
            assert.equal(isLeapYear(1900), false);
            assert.equal(isLeapYear(2024), true);
            assert.equal(isLeapYear(2023), false);
        },
    },
    {
        name: "getDaysInMonth returns correct counts",
        run: () => {
            assert.equal(getDaysInMonth(2024, 2), 29);
            assert.equal(getDaysInMonth(2023, 2), 28);
            assert.equal(getDaysInMonth(2023, 4), 30);
            assert.equal(getDaysInMonth(2023, 1), 31);
        },
    },
    {
        name: "current-year restrictions clamp months and days",
        run: () => {
            const today = { year: 2024, month: 6, day: 10 };
            const months = buildMonthOptions("en-AU", monthNames);
            const restrictedMonths = getAvailableMonths(months, 2024, today);
            assert.equal(restrictedMonths[restrictedMonths.length - 1]?.value, 6);

            const unrestrictedMonths = getAvailableMonths(months, 2023, today);
            assert.equal(unrestrictedMonths[unrestrictedMonths.length - 1]?.value, 12);

            const restrictedDays = getAvailableDays(2024, 6, today);
            assert.equal(restrictedDays[restrictedDays.length - 1], 10);

            const unrestrictedDays = getAvailableDays(2024, 5, today);
            assert.equal(unrestrictedDays[unrestrictedDays.length - 1], 31);
        },
    },
    {
        name: "getMaxMonthForYear and getMaxDayForSelection are consistent",
        run: () => {
            const today = { year: 2024, month: 6, day: 10 };
            assert.equal(getMaxMonthForYear(2024, today), 6);
            assert.equal(getMaxMonthForYear(2023, today), 12);
            assert.equal(getMaxDayForSelection(2024, 6, today), 10);
            assert.equal(getMaxDayForSelection(2024, 2, today), 29);
        },
    },
    {
        name: "filtering behavior for day, month, and year options",
        run: () => {
            const days = Array.from({ length: 31 }, (_, index) => index + 1);
            assert.deepEqual(filterNumberOptions(days, "3"), [3, 13, 23, 30, 31]);

            const months = buildMonthOptions("en-AU", monthNames);
            const filteredMonths = filterMonthOptions(months, "Ma").map((option) => option.label);
            assert.deepEqual(filteredMonths, ["March", "May"]);

            const years = buildYearOptions(1901, 1905);
            assert.deepEqual(filterYearOptions(years, "19"), [1905, 1904, 1903, 1902, 1901]);
        },
    },
];

let failures = 0;
tests.forEach((item) => {
    try {
        item.run();
        console.log(`✓ ${item.name}`);
    } catch (error) {
        failures += 1;
        console.error(`✗ ${item.name}`);
        console.error(error);
    }
});

if (failures > 0) {
    process.exitCode = 1;
}
