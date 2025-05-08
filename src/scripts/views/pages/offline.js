class OfflinePage {
  async render() {
    return `
      <div class="offline-page">
        <h1>Data Offline</h1>
        <offline-stories></offline-stories>
      </div>
    `;
  }
}

export default OfflinePage;