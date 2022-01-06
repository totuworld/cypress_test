export function isEmpty<T>(value?: T | undefined | null): value is null | undefined {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'number' && Number.isNaN(value)) {
    return true;
  }

  if (typeof value === 'string' && value === '') {
    return true;
  }

  if (typeof value === 'object' && Array.isArray(value) && value.length < 1) {
    return true;
  }

  if (typeof value === 'object' && !(value instanceof Date) && Object.keys(value).length < 1) {
    return true;
  }

  return false;
}

export function isNotEmpty<T>(value?: T | null | undefined): value is T {
  return !isEmpty<T>(value);
}
