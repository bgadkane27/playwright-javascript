export class ValidationUtil {

  /* =========================
     STRING VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a non-empty, non-whitespace string.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isNotNullOrWhiteSpace(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Checks whether the value is a valid string.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isString(value) {
    return typeof value === 'string';
  }

  /* =========================
     NUMBER VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a valid number.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  /**
   * Checks whether the value is a positive number.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isPositiveNumber(value) {
    return this.isNumber(value) && value > 0;
  }

  /* =========================
     DATE VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a valid Date object.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isValidDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Checks whether the value is a valid date string.
   *
   * @param {string} value
   * @returns {boolean}
   */
  static isValidDateString(value) {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }

  /* =========================
     BOOLEAN VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a boolean.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isBoolean(value) {
    return typeof value === 'boolean';
  }

  /* =========================
     ARRAY VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a non-empty array.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isNonEmptyArray(value) {
    return Array.isArray(value) && value.length > 0;
  }

  /* =========================
     OBJECT VALIDATIONS
  ========================== */

  /**
   * Checks whether the value is a non-null object.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Checks whether the object has at least one property.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static hasProperties(value) {
    return this.isObject(value) && Object.keys(value).length > 0;
  }

  /* =========================
     GENERIC UTILITIES
  ========================== */

  /**
   * Checks whether the value is not null or undefined.
   *
   * @param {*} value
   * @returns {boolean}
   */
  static isDefined(value) {
    return value !== null && value !== undefined;
  }
}
