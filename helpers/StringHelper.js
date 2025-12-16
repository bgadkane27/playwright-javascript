export default class StringHelper {
  static isNotNullOrWhiteSpace(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }
}