export class StringUtil {
  /**
   * Checks whether the given value is a non-empty, non-whitespace string.
   *
   * @param {*} value - Value to validate
   * @returns {boolean} 
   * true  → value is a string and contains non-whitespace characters  
   * false → value is null, undefined, not a string, or only whitespace
   *
   * @example
   * StringUtil.isNotNullOrWhiteSpace('ABC');   // true
   * StringUtil.isNotNullOrWhiteSpace('   ');   // false
   * StringUtil.isNotNullOrWhiteSpace(null);    // false
   * StringUtil.isNotNullOrWhiteSpace(123);     // false
   */
  static isNotNullOrWhiteSpace(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
