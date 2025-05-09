import API_CONFIG from "../config/endpoint.js";
import storyRepository from "../services/story-data.js";
import Swal from "sweetalert2";

class WebPushHelper {
  constructor() {
    this._swRegistration = null;
    this._isSubscribed = false;
  }

  /**
   * Initialize web push functionality
   * @returns {Promise<boolean>} Whether push is supported and initialized
   */
  async init() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported");
      return false;
    }

    try {
      // Register service worker explicitly
      const registration = await navigator.serviceWorker.register('/sw-handler.js');
      this._swRegistration = registration;
      console.log('Service Worker registered with scope:', registration.scope);

      this._isSubscribed = await this._checkSubscription();
      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   * @returns {Promise<Object>} Subscription details
   */
  async subscribe() {
    if (!this._swRegistration) {
      throw new Error('Service worker not registered. Call init() first.');
    }

    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const subscription = await this._swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(
          API_CONFIG.WEB_PUSH.VAPID_PUBLIC_KEY
        ),
      });

      const subscriptionData = this._formatSubscriptionForApi(subscription);

      // Send subscription to server
      await storyRepository.subscribeToPushNotifications(subscriptionData);
      
      this._isSubscribed = true;
      
      Swal.fire({
        title: 'Notifikasi Aktif!',
        text: 'Anda akan menerima notifikasi saat ada story baru.',
        icon: 'success',
        confirmButtonColor: '#EB4231',
      });

      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<boolean>} Whether unsubscription was successful
   */
  async unsubscribe() {
    if (!this._swRegistration) {
      throw new Error('Service worker not registered');
    }

    try {
      const subscription = await this._swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        return true;
      }

      // Unsubscribe locally
      await subscription.unsubscribe();

      // Unsubscribe from server
      await storyRepository.unsubscribeFromPushNotifications(subscription.endpoint);
      
      this._isSubscribed = false;

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * Check if notifications are already subscribed
   * @returns {Promise<boolean>} Whether user is subscribed
   * @private
   */
  async _checkSubscription() {
    if (!this._swRegistration) {
      return false;
    }

    const subscription =
      await this._swRegistration.pushManager.getSubscription();
    return !!subscription;
  }

  /**
   * Format subscription data for API
   * @param {PushSubscription} subscription - Push subscription
   * @returns {Object} Formatted subscription data
   * @private
   */
  _formatSubscriptionForApi(subscription) {
    const subscriptionJson = subscription.toJSON();

    return {
      endpoint: subscriptionJson.endpoint,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      },
    };
  }

  /**
   * Convert base64 string to Uint8Array for applicationServerKey
   * @param {string} base64String - Base64 encoded string
   * @returns {Uint8Array} Converted array
   * @private
   */
  _urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Check if user is subscribed to push notifications
   * @returns {boolean} Whether user is subscribed
   */
  isSubscribed() {
    return this._isSubscribed;
  }

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission status
   */
  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    Swal.fire({
      title: "Aktifkan Notifikasi?",
      text: "Kami akan memberi tahu Anda saat ada story baru.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EB4231",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, aktifkan!",
      cancelButtonText: "Nanti saja",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          this.subscribe();
        } else {
          Swal.fire({
            title: "Notifikasi Tidak Diizinkan",
            text: "Anda dapat mengaktifkannya nanti melalui pengaturan browser.",
            icon: "info",
            confirmButtonColor: "#EB4231",
          });
        }

        return permission;
      }
    });
  }
}

const webPushHelper = new WebPushHelper();
export default webPushHelper;
