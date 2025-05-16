import webPushHelper from "../../utils/web-push-helper.js";
import Swal from "sweetalert2";

class NotificationToggle extends HTMLElement {
  constructor() {
    super();
    this._isSubscribed = false;
    this._handleSubscriptionChange = this._handleSubscriptionChange.bind(this);
    this._handleClick = this._handleClick.bind(this);
  }

  async connectedCallback() {
    // Add loading state
    this.innerHTML = this._createButtonHTML(true);
    
    // Initialize and setup listeners
    await this._initialize();
    this._attachEventListeners();
  }

  disconnectedCallback() {
    this._removeEventListeners();
  }

  async _initialize() {
    try {
      const initialized = await webPushHelper.init();
      if (!initialized) {
        console.warn('Push notifications not supported');
        return;
      }
      
      this._isSubscribed = webPushHelper.isSubscribed();
      this.render();

      // Listen for subscription changes
      window.addEventListener('subscription-changed', this._handleSubscriptionChange);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      this.render(false); // Render without loading state
    }
  }

  _handleSubscriptionChange(event) {
    this._isSubscribed = event.detail.isSubscribed;
    this.render();
  }

  _createButtonHTML(isLoading = false) {
    const buttonClass = `notification-toggle ${this._isSubscribed ? "active" : ""} ${isLoading ? "loading" : ""}`;
    const icon = this._isSubscribed ? "fa-bell" : "fa-bell-slash";
    const text = this._isSubscribed ? "Unsubscribe" : "Subscribe";

    return `
      <button class="${buttonClass}" 
              aria-label="Push notification subscription"
              ${isLoading ? 'disabled' : ''}>
        <i class="fas ${icon}"></i>
        <span>${isLoading ? 'Loading...' : text}</span>
      </button>
    `;
  }

  render(isLoading = false) {
    this.innerHTML = this._createButtonHTML(isLoading);
    this._attachEventListeners();
  }

  _attachEventListeners() {
    const button = this.querySelector(".notification-toggle");
    if (button) {
      button.addEventListener("click", this._handleClick);
    }
  }

  _removeEventListeners() {
    const button = this.querySelector(".notification-toggle");
    if (button) {
      button.removeEventListener("click", this._handleClick);
    }
    window.removeEventListener('subscription-changed', this._handleSubscriptionChange);
  }

  async _handleClick() {
    try {
      this.render(true); // Show loading state

      if (this._isSubscribed) {
        const result = await Swal.fire({
          title: 'Nonaktifkan Notifikasi?',
          text: 'Anda tidak akan menerima notifikasi story baru.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#EB4231',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Ya, nonaktifkan',
          cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
          await webPushHelper.unsubscribe();
          
          await Swal.fire({
            title: 'Notifikasi Dinonaktifkan',
            text: 'Anda tidak akan menerima notifikasi story baru.',
            icon: 'info',
            confirmButtonColor: '#EB4231'
          });
        }
      } else {
        await webPushHelper.init();
        await webPushHelper.requestPermission();
      }
    } catch (error) {
      console.error("Failed to change subscription status:", error);
      Swal.fire({
        title: 'Terjadi Kesalahan',
        text: 'Gagal mengubah status notifikasi. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#EB4231'
      });
    } finally {
      this.render(false); // Remove loading state
    }
  }
}

customElements.define("notification-toggle", NotificationToggle);
export default NotificationToggle;
