import AddStoryPage from "../views/pages/create-story.js";
import storyRepository from "../services/story-data.js";
import authRepository from "../services/user-session.js";
import webPushHelper from "../utils/web-push-helper.js";
import { applyCustomAnimation } from "../utils/transition-util.js";
import Swal from "sweetalert2";

class AddStoryPresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._container = document.querySelector("#pageContent");
    this._isLoading = false;

    this._handleSubmit = this._handleSubmit.bind(this);
  }

  async init() {
    if (!authRepository.isAuthenticated()) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please login to add a new story",
        icon: "warning",
        confirmButtonColor: "#EB4231",
      }).then(() => {
        window.location.hash = "#/login";
      });
      return;
    }

    applyCustomAnimation("#pageContent", {
      name: "add-story-transition",
      duration: 400,
    });

    this._renderView();
  }

  _renderView() {
    this._view = new AddStoryPage({
      isLoading: this._isLoading,
      container: this._container,
    });

    this._view.render();
    this._view.setSubmitHandler(this._handleSubmit);
  }

  /**
   * Handle form submission
   * @param {Object} storyData
   */
  async _handleSubmit(storyData) {
    if (this._isLoading) {
      return;
    }

    try {
      this._isLoading = true;

      if (this._view) {
        this._view.setLoading(true);
      }

      const isAuthenticated = authRepository.isAuthenticated();

      const response = await storyRepository.addStory(
        storyData,
        isAuthenticated
      );

      if (this._view) {
        this._view.showSuccessMessage();
      }

      Swal.fire({
        title: "Story Posted!",
        text: "Your story has been successfully shared",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      this._triggerPushNotification(storyData.description);

      setTimeout(() => {
        window.location.hash = "#/";
      }, 2000);
    } catch (error) {
      console.error("Failed to submit story:", error);

      Swal.fire({
        title: "Failed to Post Story",
        text: error.message || "An error occurred while posting your story",
        icon: "error",
        confirmButtonColor: "#EB4231",
      });

      this._isLoading = false;

      if (this._view) {
        this._view.setLoading(false);
      }
    }
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

        // Notification will be triggered from server
        console.log('Story created, server will send push notification');
      }
    } catch (error) {
      console.error('Failed to handle push notification:', error);
    }
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default AddStoryPresenter;
