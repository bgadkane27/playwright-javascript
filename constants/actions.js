/**
 * ACTION
 * -------
 * Defines all supported CRUD and validation actions
 * used across the application for consistency.
 *
 * @readonly
 * @enum {string}
 *
 * - Validate - Used to validate data or business rules,
 * - Create   - Used when creating a new record,
 * - Update   - Used when updating an existing record,
 * - Delete   - Used when deleting a record
 */
export const ACTION = Object.freeze({
    VALIDATE: 'Validate',
    CREATE: 'Create',
    UPDATE: 'Update',
    DELETE: 'Delete',
});
