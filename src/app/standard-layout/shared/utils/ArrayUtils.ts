/**
 * Get the first element of an array.
 *
 * @param array The array where the element come from.
 * @returns Returns the first element of the array.
 */
export const first = (array: Array<any>) => array[0];

/**
 * Get the last element of an array.
 *
 * @param array The array where the element come from.
 * @returns Returns the last element of the array.
 */
export const last = (array: Array<any>) => array[array.length - 1];

/**
 * Checks if the length of the array is greater than zero.
 *
 * @param array The array where the length will be checked.
 * @returns Returns true when the array is not empty, otherwise false.
 */
export const notEmpty = (array: Array<any>) => array.length > 0;

/**
 * Remove the element with the specified index on the given array.
 *
 * @param index The index where the element should be removed.
 * @param array The array that will be changed.
 * @returns Returns the array without the removed element.
 */
export const removeIndex = (index: number, array: any[]) =>
    array.splice(index, 1);
