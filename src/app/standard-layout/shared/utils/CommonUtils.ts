/* STRINGS */

/**
 * A given string can be separated with the specified separator.
 *
 * @param str The string that will be separated.
 * @param separator The separator that will be used.
 * @returns An string array that has all elements separated by the chosen
 * separator.
 */
export const splitWith = (str: string, separator: string) =>
    str.split(separator);

/* SORTING */

/**
 * Checks for two given numbers which number is lower.
 *
 * @param a The first number.
 * @param b The second number.
 * @returns Returns a negative value in case the first number is lower in
 * comparison, otherwise a positive number.
 */
export const sortNumerical = (a: number, b: number) => (a > b ? -1 : 1);

/**
 * Checks for two strings which of both should occur earlier on the letters of
 * both strings.
 *
 * @param a The first string.
 * @param b The second string.
 * @returns Returns a positive number in case the first string will be earlier
 * in a dictionary than the second string, otherwise a negative number.
 */
export const sortAlphabetical = (a: string, b: string) => (a > b ? 1 : -1);

/**
 * Can be used to filter an array distinct.
 *
 * @param value The value that the object has.
 * @param index The index of the object.
 * @param self The object that should be there once.
 * @returns Returns an array with distinct values.
 */
export const sortDistinct = (value: any, index: any, self: any) =>
    self.indexOf(value) === index;

/* NUMBERS */

/**
 * Format a given integer number to a two character string in case the number
 * is lower than 10.
 *
 * @param num The number that will be formatted.
 * @returns Returns a two digit string representation from a given number.
 */
export const formatToTwoDigits = (num: number) => (num < 10 ? `0${num}` : num);

/**
 * Checks if the given input is a number.
 *
 * @param input The value that should be checked.
 * @returns Returns true if the given value is a number, otherwise false.
 */
export const isNumber = (input: any) => !isNaN(Number(input));

/**
 * Return a random integer number within a given number span.
 *
 * @param min The min value that the random number could possibly have.
 * @param max The max value that the random number could possibly have.
 * @returns Returns a random integer value within a given interval.
 */
export const randomFromInterval = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1) + min);

/* OBJECTS */

/**
 * Checks if an object has the given property.
 *
 * @param object The object that should be checked for the property.
 * @param property The property that the object may have.
 * @returns Returns true in case the object has the given property,
 * otherwise false.
 */
export const objHasProperty = (object: any, property: string) =>
    object.hasOwnProperty(property) &&
    object[property] !== null &&
    object[property] !== undefined;
