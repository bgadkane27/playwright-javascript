export class ChargePage {
    constructor(page){
        this.page= page;

        this.defaultValue = page.getByLabel('Default Value');
    }

    async fillDefaultValue(value){
        await this.defaultValue.fill(value);
    }
}