import AddStoryPage from "../views/pages/create-story.js";
import storyRepository from "../services/story-data.js";
import authRepository from "../services/user-session.js";
import webPushHelper from "../utils/web-push-helper.js";
import Swal from "sweetalert2";

class AddStoryPresenter {
  constructor({ container }) {
    this._container = container;
    this._view = null;
    this._isLoading = false;
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  async init() {
    if (!authRepository.isAuthenticated()) {
      await this._showAuthenticationRequired();
      return;
    }

    this._renderView();
  }

  _renderView() {
    this._view = new AddStoryPage({
      isLoading: this._isLoading,
      container: this._container,
      onSubmit: this._handleSubmit,
    });

    this._view.render();
  }

  async _showAuthenticationRequired() {
    await Swal.fire({
      title: "Authentication Required",
      text: "Please login to add a new story",
      icon: "warning",
      confirmButtonColor: "#EB4231",
    });
    window.location.hash = "#/login";
  }

  /**
   * Handle form submission
   * @param {Object} storyData
   */
  async _handleSubmit(storyData) {
    if (this._isLoading) return;

    try {
      this._isLoading = true;
      this._view.setLoading(true);

      const isAuthenticated = authRepository.isAuthenticated();
      await storyRepository.addStory(storyData, isAuthenticated);

      await this._handleSuccessfulSubmission(storyData.description);
    } catch (error) {
      await this._handleSubmissionError(error);
    }
  }

  async _handleSuccessfulSubmission(description) {
    this._view.showSuccessMessage();

    await Swal.fire({
      title: "Story Posted!",
      text: "Your story has been successfully shared",
      icon: "success",
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    await this._triggerPushNotification(description);

    setTimeout(() => {
      window.location.hash = "#/";
    }, 2000);
  }

  async _handleSubmissionError(error) {
    console.error("Failed to submit story:", error);

    await Swal.fire({
      title: "Failed to Post Story",
      text: error.message || "An error occurred while posting your story",
      icon: "error",
      confirmButtonColor: "#EB4231",
    });

    this._isLoading = false;
    this._view.setLoading(false);
  }

  /**
   * Trigger push notification for new story
   * @param {string} description - Story description
   */
  async _triggerPushNotification(description) {
    try {
      if (webPushHelper.isSubscribed()) {
        const notificationData = {
          title: 'Story berhasil dibuat',
          options: {
            body: `Anda telah membuat story baru dengan deskripsi: ${description.substring(0, 50)}...`,
            icon: '/icon/icon-192x192.png',
            badge: '/icon/icon-72x72.png',
            vibrate: [200, 100, 200],
            tag: 'new-story',
            renotify: true
          }
        };

        console.log('Story created, server will send push notification');
      }
    } catch (error) {
      console.error('Failed to handle push notification:', error);
    }
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
      this._view = null;
    }
  }
}

export default AddStoryPresenter;
