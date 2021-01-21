export function first(array: Array<any>): any {
  return array[0];
}

export function last(array: Array<any>): any {
  return array[array.length - 1];
}

export function notEmpty(array: Array<any>): any {
  return array.length > 0;
}
