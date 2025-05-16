import DetailPage from "../views/pages/story-detail.js";
import storyRepository from "../services/story-data.js";
import { applyCustomAnimation } from "../utils/transition-util.js";

class DetailPresenter {
  constructor(params = {}) {
    this._params = params;
    this._storyId = params.id;
    this._view = new DetailPage({
      container: params.container
    });
    this._isLoading = false;
    this._error = null;
    this._story = null;

    this._fetchStory = this._fetchStory.bind(this);
    this._handleRetry = this._handleRetry.bind(this);
  }

  async init() {
    if (!this._storyId) {
      this._error = "Story ID is required";
      this._renderError();
      return;
    }

    this._renderLoading();

    applyCustomAnimation("#pageContent", {
      name: "detail-transition",
      duration: 400,
    });

    await this._fetchStory();
  }

  async _fetchStory() {
    try {
      this._isLoading = true;
      this._error = null;

      this._renderLoading();

      const response = await storyRepository.getStoryById(this._storyId);

      this._story = response.story;
      this._isLoading = false;

      this._renderView();
    } catch (error) {
      console.error(`Failed to fetch story with ID ${this._storyId}:`, error);

      this._isLoading = false;
      this._error =
        error.message || "Failed to load story details. Please try again.";

      this._renderError();
    }
  }

  _renderLoading() {
    this._view.render({
      isLoading: true,
      story: null,
      error: null
    });
  }

  _renderError() {
    this._view.render({
      isLoading: false,
      story: null,
      error: this._error
    });
    this._view.setRetryHandler(this._handleRetry);
  }

  _renderView() {
    this._view.render({
      isLoading: false,
      story: this._story,
      error: null
    });
  }

  _handleRetry() {
    this._fetchStory();
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default DetailPresenter;
