export class UploadAction {
  constructor(page) {
    this.page = page;
  }

  async uploadFile(filePath) {
    const fileInput = this.page.getByLabel('', { exact: true });
    await fileInput.setInputFiles(filePath);
  }
}
