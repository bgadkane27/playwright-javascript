export class ValidationUtil {

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

  /**
  * Checks if number is NOT null, NOT undefined, NOT NaN.
  * Allows zero only if explicitly permitted.
  *
  * @param {number} value - Number to validate
  * @param {boolean} allowZero - Whether zero is considered valid
  * @returns {boolean}
  */
  static isNumberValid(value, allowZero = false) {
    if (value === null || value === undefined) return false;
    if (typeof value !== 'number') return false;
    if (Number.isNaN(value)) return false;
    if (!allowZero && value === 0) return false;
    return true;
  }

  /**
   * Checks if number is greater than zero.
   *
   * @param {number} value
   * @returns {boolean}
   */
  static isNumberGreaterThanZero(value) {
    return this.isNumberValid(value) && value > 0;
  }

  /**
   * Checks if number is zero or greater (>= 0).
   *
   * @param {number} value
   * @returns {boolean}
   */
  static isNumberZeroOrPositive(value) {
    return this.isNumberValid(value, true) && value >= 0;
  }

}
