/**
 * Creates a new date object that complies with the german time.
 *
 * @returns Returns a new date object.
 */
export const newDate = () => fromLocaleDateString(toLocalDateString(new Date()));

/**
 * Creates a new local date string.
 *
 * @param date The date that should be formatted.
 * @returns a local date string for with the german timezone.
 */
export const toLocalDateString = (date: Date) =>
    new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });

/**
 * Creates a date object from a locale date string.
 *
 * @param localDateStr The locale date that should be transformed into a date
 * object.
 * @returns A date object from the locale date string e.g. "2.4.2021, 08:43:01"
 */
export const fromLocaleDateString = (localDateStr: string) => {
    const parts = localDateStr.split(',');
    const partsDate = parts[0].trim().split('.');
    const partsTime = parts[1].trim().split(':');

    const day = +partsDate[0];
    const month = +partsDate[1] - 1; // january is on index 0 and so on
    const year = +partsDate[2];

    const hours = +partsTime[0];
    const minutes = +partsTime[1];
    const seconds = +partsTime[2];

    return new Date(year, month, day, hours, minutes, seconds);
};

/**
 * Checks if a given date object starts at the current day.
 *
 * @returns Returns true in case the given date is today, otherwise false.
 */
export const isToday = (date: Date) => {
    const start: Date = new Date(date);
    const today: Date = new Date();

    return (
        start.getDate() === today.getDate() &&
        start.getMonth() === today.getMonth() &&
        start.getFullYear() === today.getFullYear()
    );
};

/**
 * Checks if the given date is valid.
 *
 * @param date The date object to be checked.
 * @returns Returns true in case the date object is valid, otherwise false.
 */
export const isValid = (date: Date) => date !== null || date !== undefined;

/**
 * Get the day of the week by number.
 *
 * @param index The index of the day starting with 0 (sunday).
 * @returns Returns a day of the week in string representation.
 */
export const getDayOfTheWeek = (index: number) =>
    [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ][index];

/**
 * Calculates the current week number from todays date.
 *
 * @returns Returns the week number of todays date as integer value.
 */
export const calculateCurrentWeekNumber = () => {
    const now = newDate();
    const firstOfJanuary = new Date(now.getFullYear(), 0, 1);

    return Math.ceil(
        ((now.getTime() - firstOfJanuary.getTime()) / 86400000 +
            firstOfJanuary.getDay() +
            1) /
            7
    );
};

/**
 * Calculates the week number from a given date.
 *
 * @param date The given date of type date.
 * @returns Returns the week number of the given date as integer value.
 */
export const calculateWeekNumber = (date: Date) => {
    const d = new Date(date);
    const firstOfJanuary = new Date(d.getFullYear(), 0, 1);

    return Math.ceil(
        ((d.getTime() - firstOfJanuary.getTime()) / 86400000 +
            firstOfJanuary.getDay() +
            1) /
            7
    );
};

/**
 * Calculate the difference between the given date and the current
 * date.
 *
 * @param date The date to be calculate the difference from.
 * @returns Return the difference between those dates in milliseconds.
 */
export const calculateDiffToCurrentTime = (date: Date) =>
    new Date(date).getTime() - newDate().getTime();

/**
 * Format a given milliseconds number into the format hh:mm:ss.
 *
 * @param num The given integer number in milliseconds that will be formatted.
 * @returns Returns a string representation in format hh:mm:ss.
 */
export const formatToHms = (num: number) => {
    let seconds: any = Math.floor((num / 1000) % 60);
    let minutes: any = Math.floor((num / (1000 * 60)) % 60);
    let hours: any = Math.floor(num / (1000 * 60 * 60));
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${hours}:${minutes}:${seconds}`;
};

/**
 * Create a displayable date string from a date object.
 *
 * @param date The date that will be formatted.
 * @returns Returns the locale string representation of its date.
 */
export const formatLocaleDateStr = (date: Date) =>
    new Date(date).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
