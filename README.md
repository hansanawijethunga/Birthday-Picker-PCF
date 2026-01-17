# Birthday Picker PCF Control

## Overview
The Birthday Picker is a Power Platform Component Framework (PCF) control that renders three Fluent UI v9 comboboxes (Day, Month, Year) in a single row with typed search, leap-year logic, and current-year future-date restrictions. It emits a date-only value in ISO format (`YYYY-MM-DD`) for Dataverse DateOnly columns.

## Build and Run
- Install dependencies: `npm install`
- Build the control: `npm run build`
- Run tests: `npm run test`

## Deploy (pac CLI)
1. Create or open a solution:
   - `pac solution init --publisher-name "Publisher" --publisher-prefix "pub"`
2. Add the PCF project reference:
   - `pac solution add-reference --path "./"`
3. Build the solution:
   - `msbuild /t:restore`
4. Import the solution into Dataverse (Solution Zip output).

For local testing, use `pac pcf push` against a connected environment.

## Usage (Model-Driven & Canvas)
1. Add the control to a form and bind the `dateValue` property to a Dataverse DateOnly column.
2. Optional inputs:
   - `minYear` (default 1901)
   - `dayLabel`, `monthLabel`, `yearLabel`
3. The control outputs a DateOnly value as an ISO string (`YYYY-MM-DD`) and avoids time zone offsets.

## Localization
- Labels and messages are in `BirthdayPicker/strings/BirthdayPicker.1033.resx`.
- Add new `.resx` files for additional locales and reference them in `BirthdayPicker/ControlManifest.Input.xml`.
- Month names are sourced from `context.userSettings.dateFormattingInfo.monthNames` when available; otherwise, the control falls back to `Intl.DateTimeFormat` using the locale (default `en-AU`).

## Accessibility Notes
- Comboboxes use Fluent UI v9 semantics with keyboard navigation (Arrow keys, Enter, Esc, Tab).
- Required/invalid states set `aria-invalid` and `aria-describedby` with a single error message.
- RTL layouts are supported through the Power Platform user settings.

## Known Edge Cases
- Changing month/year auto-clamps invalid days (e.g., 31 -> 30 or Feb 29 -> Feb 28).
- Selecting the current year limits months to the current month; selecting the current month limits days to the current day.
- When month is not selected, the Day combobox is disabled to avoid invalid day counts.
