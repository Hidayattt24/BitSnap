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

    // Listen for subscription changes
    window.addEventListener('subscription-changed', (event) => {
      this._isSubscribed = event.detail.isSubscribed;
      this.render();
    });
  }

  disconnectedCallback() {
    window.removeEventListener('subscription-changed', this._handleSubscriptionChange);
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
          this._isSubscribed = false; // Update state setelah unsubscribe
        } else {
          await webPushHelper.requestPermission();
          // Tunggu sebentar untuk memastikan proses subscribe selesai
          setTimeout(async () => {
            this._isSubscribed = webPushHelper.isSubscribed();
            this.render(); // Render ulang komponen
          }, 1000);
        }
        this.render(); // Render ulang komponen
      } catch (error) {
        console.error("Gagal mengubah status notifikasi:", error);
      }
    });
  }
}

customElements.define("notification-toggle", NotificationToggle);
export default NotificationToggle;
