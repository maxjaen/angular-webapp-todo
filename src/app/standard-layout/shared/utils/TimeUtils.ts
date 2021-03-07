/**
 * Creates a new date object that complies with the german time.
 *
 * @returns Returns a new date object.
 */
export const newDate = () => {
    const date: Date = new Date();
    date.setHours(
        isDST(date) ? date.getUTCHours() + 1 : date.getUTCHours() + 2
    );

    return date;
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
 * Checks if a date is in the Daylight Saving Time (DST) in germany.
 * DST starts on Sunday 29 March 2020, 02:00
 * DST ends on Sunday 25 October 2020, 03:00
 *
 * @param date The date to be checked if in dst or not.
 * @returns Returns true if the given date is in the daylight saving time,
 * otherwise false.
 */
export const isDST = (date: Date) => {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();

    return Math.max(jan, jul) !== date.getTimezoneOffset();
};

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
