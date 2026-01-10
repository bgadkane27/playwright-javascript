export class DateHelper {

    /**
     * Returns today's date in DD-MM-YYYY format.
     * Optionally adds days to the current date.
     *
     * @param {number} addDays - Number of days to add (default: 0)
     * @returns {string} Formatted date (DD-MM-YYYY)
     */
    static getDate(addDays = 0) {
        const date = new Date();
        date.setDate(date.getDate() + addDays);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

}
