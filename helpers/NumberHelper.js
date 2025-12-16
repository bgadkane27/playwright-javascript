export default class NumberHelper {

  /**
   * Checks if number is NOT null, NOT undefined, NOT NaN
   * Allows 0 if explicitly permitted
   */
  static isValid(value, allowZero = false) {
    if (value === null || value === undefined) return false;
    if (typeof value !== 'number') return false;
    if (Number.isNaN(value)) return false;
    if (!allowZero && value === 0) return false;
    return true;
  }

  /**
   * Checks if number is greater than zero
   * (most common ERP use case)
   */
  static isGreaterThanZero(value) {
    return this.isValid(value) && value > 0;
  }

  /**
   * Checks if number is zero or greater (>= 0)
   */
  static isZeroOrPositive(value) {
    return this.isValid(value, true) && value >= 0;
  }
}
