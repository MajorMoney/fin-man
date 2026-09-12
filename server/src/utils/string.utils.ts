export class StringUtils {
  /**
   * Convert a string to camelCase using an efficient regex method.
   */
  static toCamelCase(str: string): string {
    const [first, ...rest] = str.toLowerCase().split(/[-_\s]+/);

    return first + rest.map((s) => s[0].toUpperCase() + s.slice(1)).join('');
  }

  static parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
}
