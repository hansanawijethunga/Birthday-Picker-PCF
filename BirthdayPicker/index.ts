import { IInputs, IOutputs } from "./generated/ManifestTypes";
import { BirthdayPickerComponent, BirthdayPickerComponentProps } from "./BirthdayPicker";
import * as React from "react";
import { DEFAULT_MIN_YEAR, dateToIso, getTodayParts, parseIsoDate } from "./birthdayPickerUtils";
import type { Theme } from "@fluentui/react-components";

export class BirthdayPicker implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private currentValue: string | null = null;
    private context: ComponentFramework.Context<IInputs>;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        this.context = context;
		// this.context.mode.trackContainerResize(true);
        
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const isoValue = dateToIso(context.parameters.dateValue.raw);
        if (this.currentValue !== isoValue) {
            this.currentValue = isoValue;
        }

        const now = getTodayParts(new Date());
        const minYearRaw = context.parameters.minYear?.raw;
        const minYearParsed =
            typeof minYearRaw === "number" && !Number.isNaN(minYearRaw) ? Math.trunc(minYearRaw) : DEFAULT_MIN_YEAR;
        const minYear = Math.min(Math.max(minYearParsed, DEFAULT_MIN_YEAR), now.year);

        const isDisabled = context.mode.isControlDisabled;

        const localeRaw = context.formatting.formatLanguage(context.userSettings.languageId);
        const locale = localeRaw && localeRaw.trim().length > 0 ? localeRaw : "en-AU";

        const fluentTheme = context.fluentDesignLanguage?.tokenTheme as Theme | undefined;

        const props: BirthdayPickerComponentProps = {
            value: this.currentValue,
            minYear,
            locale,
            monthNames: context.userSettings.dateFormattingInfo?.monthNames,
            disabled: isDisabled,
            today: now,
            theme: fluentTheme,
            isDarkTheme: context.fluentDesignLanguage?.isDarkTheme,
            isRTL: context.userSettings.isRTL,
            onValueChange: this.handleValueChange,
        };

        return React.createElement(BirthdayPickerComponent, props);
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return { dateValue: this.toDateValue(this.currentValue) };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }

    private handleValueChange = (value: string | null): void => {
        if (value === this.currentValue) {
            return;
        }
        this.currentValue = value;
        this.notifyOutputChanged();
    };

    private toDateValue(value: string | null): Date | undefined {
        if (!value) {
            return undefined;
        }
        const parsed = parseIsoDate(value);
        if (!parsed) {
            return undefined;
        }
        return new Date(parsed.year, parsed.month - 1, parsed.day);
    }
}
