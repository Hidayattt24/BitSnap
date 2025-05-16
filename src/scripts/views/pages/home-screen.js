import createHomeTemplate from "../template/home-template.js";
import "../components/story-card.js";
import MapHelper from "../../utils/location-util.js";
import Swal from "sweetalert2";

class HomePage {
  constructor(container) {
    this._container = container || document.querySelector("#pageContent");
    this._mapHelper = new MapHelper();
    this._mapInitialized = false;
    this._stories = [];
    this._isLoading = false;
    this._error = null;
  }

  render({ stories = [], isLoading = false, error = null }) {
    this._stories = stories;
    this._isLoading = isLoading;
    this._error = error;

    this._container.innerHTML = createHomeTemplate({
      isLoading: this._isLoading,
      error: this._error,
      stories: this._stories,
    });

    if (!this._isLoading && !this._error && this._stories.length > 0) {
      this._renderStories();
      this._initMap();
    }

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  _renderStories() {
    const storiesContainer = this._container.querySelector("#storiesList");
    if (!storiesContainer) return;

    storiesContainer.innerHTML = "";

    this._stories.forEach((story) => {
      const storyItemElement = document.createElement("story-item");
      storyItemElement.story = story;
      storiesContainer.appendChild(storyItemElement);
    });
  }

  _initMap() {
    const storiesWithLocation = this._stories.filter(
      (story) =>
        story.lat && story.lon && !isNaN(story.lat) && !isNaN(story.lon)
    );

    if (storiesWithLocation.length === 0) return;

    const mapContainer = this._container.querySelector("#storyMap");
    if (!mapContainer) return;

    this._mapHelper.initMap(mapContainer, {
      addSecondaryTileLayer: true,
    });

    this._mapHelper.addStoryMarkers(this._stories);

    this._mapInitialized = true;
  }

  _attachRetryHandler() {
    const retryButton = this._container.querySelector("#retryButton");
    if (retryButton && this._retryHandler) {
      retryButton.addEventListener("click", this._retryHandler);
    }
  }

  /**
   * Set retry handler function
   * @param {Function} handler - Retry handler function
   */
  setRetryHandler(handler) {
    this._retryHandler = handler;

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  showAuthenticationPrompt(onConfirm) {
    Swal.fire({
      title: "Welcome to BitSnap!",
      text: "Log in to see and share stories",
      icon: "warning",
      confirmButtonColor: "#EB4231",
      confirmButtonText: "Log In",
      showCancelButton: true,
      cancelButtonText: "Maybe Later",
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  }

  cleanup() {
    if (this._mapInitialized && this._mapHelper) {
      this._mapHelper.clearMarkers();
    }
  }
}

export default HomePage;
