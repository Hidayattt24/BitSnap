import webPushHelper from "../../utils/web-push-helper.js";

class NotificationToggle extends HTMLElement {
  constructor() {
    super();
    this._isSubscribed = false;
  }

  async connectedCallback() {
    await this._initialize();
    this.render();
    this._attachEventListeners();
  }

  async _initialize() {
    await webPushHelper.init();
    this._isSubscribed = webPushHelper.isSubscribed();
  }

  render() {
    this.innerHTML = `
      <button class="notification-toggle ${this._isSubscribed ? "active" : ""}" 
              aria-label="Pengaturan notifikasi">
        <i class="fas ${this._isSubscribed ? "fa-bell" : "fa-bell-slash"}"></i>
        <span>${
          this._isSubscribed ? "Notifikasi Aktif" : "Aktifkan Notifikasi"
        }</span>
      </button>
    `;
  }

  async _attachEventListeners() {
    const button = this.querySelector(".notification-toggle");
    button.addEventListener("click", async () => {
      try {
        if (this._isSubscribed) {
          await webPushHelper.unsubscribe();
        } else {
          await webPushHelper.requestPermission();
        }
        this._isSubscribed = webPushHelper.isSubscribed();
        this.render();
      } catch (error) {
        console.error("Gagal mengubah status notifikasi:", error);
      }
    });
  }
}

customElements.define("notification-toggle", NotificationToggle);
export default NotificationToggle;
