export class DeleteHelper {

    /**
     * Delete single master record
     */
    static async deletePaymentTerm(page, name, {
        listingAction,
        masterDeleteAction,
        toastHelper
    }) {
        await listingAction.filterMasterByName(name);

        const recordExists = await page
            .locator(`text=${name}`)
            .first()
            .isVisible({ timeout: 3000 })
            .catch(() => false);

        if (!recordExists) {
            throw new Error(`Record not found: ${name}`);
        }

        await masterDeleteAction.deleteMasterByName('Payment Term', name);
        await toastHelper.assertByText('PaymentTerm', 'Delete');
        await listingAction.clearMasterNameColumnFilter();
    }

    /**
     * Retry failed deletes
     */
    static async retryFailedDeletes(page, failedRecords, dependencies) {
        const retryFailed = [];

        for (const name of failedRecords) {
            try {
                await this.deletePaymentTerm(page, name, dependencies);
            } catch (error) {
                retryFailed.push(name);
            }
        }

        return retryFailed;
    }
}