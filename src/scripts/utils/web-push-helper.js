import API_CONFIG from "../config/endpoint.js";
import storyRepository from "../services/story-data.js";
import Swal from "sweetalert2";

class WebPushHelper {
  constructor() {
    this._swRegistration = null;
    this._isSubscribed = false;
    this._initializePromise = null;
  }

  /**
   * Initialize web push functionality
   * @returns {Promise<boolean>} Whether push is supported and initialized
   */
  async init() {
    if (this._initializePromise) {
      return this._initializePromise;
    }

    this._initializePromise = (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications are not supported");
        return false;
      }

      try {
        // Check if service worker is already registered
        this._swRegistration = await navigator.serviceWorker.getRegistration();
        
        if (!this._swRegistration) {
          // Register new service worker only if not already registered
          this._swRegistration = await navigator.serviceWorker.register('/sw.js');
        }
        
        // Wait for the service worker to be ready
        await navigator.serviceWorker.ready;
        
        console.log('Service Worker registered with scope:', this._swRegistration.scope);

        // Check existing subscription
        await this._updateSubscriptionState();
        
        return true;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return false;
      }
    })();

    return this._initializePromise;
  }

  /**
   * Subscribe to push notifications
   * @returns {Promise<Object>} Subscription details
   */
  async subscribe() {
    if (!this._swRegistration) {
      await this.init();
    }

    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check for existing subscription
      const existingSubscription = await this._swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        // If already subscribed, update state and return existing subscription
        await this._updateSubscriptionState();
        return this._formatSubscriptionForApi(existingSubscription);
      }

      // Convert VAPID key
      const applicationServerKey = this._urlBase64ToUint8Array(
        API_CONFIG.WEB_PUSH.VAPID_PUBLIC_KEY
      );

      // Subscribe to push with vapid key
      const subscription = await this._swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log('Push Subscription successful:', subscription);

      const subscriptionData = this._formatSubscriptionForApi(subscription);

      // Send subscription to server
      await storyRepository.subscribeToPushNotifications(subscriptionData);
      
      // Update subscription state after successful server registration
      await this._updateSubscriptionState();

      Swal.fire({
        title: 'Notifikasi Aktif!',
        text: 'Anda akan menerima notifikasi saat ada story baru.',
        icon: 'success',
        confirmButtonColor: '#EB4231',
      });

      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      
      Swal.fire({
        title: 'Gagal Mengaktifkan Notifikasi',
        text: 'Pastikan Anda menggunakan browser yang mendukung notifikasi dan koneksi internet stabil.',
        icon: 'error',
        confirmButtonColor: '#EB4231',
      });
      
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<boolean>} Whether unsubscription was successful
   */
  async unsubscribe() {
    if (!this._swRegistration) {
      await this.init();
    }

    try {
      const subscription = await this._swRegistration.pushManager.getSubscription();
      
      if (!subscription) {
        await this._updateSubscriptionState();
        return true;
      }

      const endpoint = subscription.endpoint;

      // Unsubscribe locally
      await subscription.unsubscribe();

      // Unsubscribe from server
      await storyRepository.unsubscribeFromPushNotifications(endpoint);
      
      // Update subscription state after successful unsubscription
      await this._updateSubscriptionState();

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      throw error;
    }
  }

  /**
   * Update subscription state and dispatch event
   * @returns {Promise<void>}
   * @private
   */
  async _updateSubscriptionState() {
    if (!this._swRegistration) {
      this._isSubscribed = false;
    } else {
      const subscription = await this._swRegistration.pushManager.getSubscription();
      this._isSubscribed = !!subscription;
    }

    this._dispatchSubscriptionChange(this._isSubscribed);
  }

  /**
   * Dispatch subscription change event
   * @param {boolean} isSubscribed - Current subscription state
   * @private
   */
  _dispatchSubscriptionChange(isSubscribed) {
    window.dispatchEvent(new CustomEvent('subscription-changed', {
      detail: { isSubscribed }
    }));
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
    try {
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
    } catch (error) {
      console.error('Error converting VAPID key:', error);
      throw new Error('Invalid VAPID key format');
    }
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

    const result = await Swal.fire({
      title: "Aktifkan Notifikasi?",
      text: "Kami akan memberi tahu Anda saat ada story baru.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#EB4231",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, aktifkan!",
      cancelButtonText: "Nanti saja",
    });

    if (result.isConfirmed) {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await this.subscribe();
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
  }
}

const webPushHelper = new WebPushHelper();
export default webPushHelper;
