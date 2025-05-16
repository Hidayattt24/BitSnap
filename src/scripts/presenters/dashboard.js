import HomePage from "../views/pages/home-screen.js";
import storyRepository from "../services/story-data.js";
import authRepository from "../services/user-session.js";
import { applyCustomAnimation } from "../utils/transition-util.js";

class HomePresenter {
  constructor(params = {}) {
    this._view = new HomePage(params.container);
    this._isLoading = false;
    this._error = null;
    this._stories = [];

    this._fetchStories = this._fetchStories.bind(this);
    this._handleRetry = this._handleRetry.bind(this);
    this._handleAuthRedirect = this._handleAuthRedirect.bind(this);
  }

  async init() {
    this._renderLoading();

    applyCustomAnimation("#pageContent", {
      name: "home-transition",
      duration: 400,
    });

    await this._fetchStories();
  }

  async _fetchStories() {
    try {
      this._isLoading = true;
      this._error = null;

      this._renderLoading();

      const isAuthenticated = authRepository.isAuthenticated();

      if (!isAuthenticated) {
        this._stories = [];
        this._isLoading = false;
        this._renderView();
        
        this._view.showAuthenticationPrompt(this._handleAuthRedirect);
        return;
      }

      const response = await storyRepository.getStories({ location: 1 });

      this._stories = response.listStory || [];
      this._isLoading = false;

      this._renderView();
    } catch (error) {
      console.error("Failed to fetch stories:", error);

      this._isLoading = false;
      this._error =
        error.message || "Failed to load stories. Please try again.";

      this._renderError();
    }
  }

  _renderLoading() {
    this._view.render({
      isLoading: true,
      stories: [],
      error: null
    });
  }

  _renderError() {
    this._view.render({
      isLoading: false,
      stories: [],
      error: this._error
    });
    this._view.setRetryHandler(this._handleRetry);
  }

  _renderView() {
    this._view.render({
      isLoading: this._isLoading,
      stories: this._stories,
      error: this._error
    });

    if (this._error) {
      this._view.setRetryHandler(this._handleRetry);
    }
  }

  _handleAuthRedirect() {
    window.location.hash = "#/login";
  }

  _handleRetry() {
    this._fetchStories();
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default HomePresenter;
