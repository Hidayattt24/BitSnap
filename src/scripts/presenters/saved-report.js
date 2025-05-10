export default class SavedReportPresenter {
  #reportId;
  #view;
  #apiModel;
  #dbModel;

  constructor(reportId, { view, apiModel, dbModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  /* ...kode lainnya disembunyikan... */

  async saveReport() {
    try {
      const report = await this.#apiModel.getReportById(this.#reportId);
      await this.#dbModel.putReport(report.data);
      this.#view.saveToBookmarkSuccessfully("Success to save to bookmark");
    } catch (error) {
      console.error("saveReport: error:", error);
      this.#view.saveToBookmarkFailed(error.message);
    }
  }

  showSaveButton() {
    if (this.#isReportSaved()) {
      this.#view.renderRemoveButton();
      return;
    }

    this.#view.renderSaveButton();
  }

  #isReportSaved() {
    return false;
  }
}
