import createDetailTemplate from "../template/detail-template.js";
import MapHelper from "../../utils/location-util.js";
import Database from "../../services/database.js";
import Swal from "sweetalert2";

class DetailPage {
  constructor({ container }) {
    this._container = container;
    this._mapHelper = new MapHelper();
    this._mapInitialized = false;
    this._story = null;
    this._isLoading = false;
    this._error = null;
    this._retryHandler = null;

    this._initSaveButton = this._initSaveButton.bind(this);
    this._handleSaveClick = this._handleSaveClick.bind(this);
    this._handleCancelClick = this._handleCancelClick.bind(this);
    this._handleRemoveClick = this._handleRemoveClick.bind(this);
  }

  render({ story, isLoading, error }) {
    this._story = story;
    this._isLoading = isLoading;
    this._error = error;

    this._container.innerHTML = createDetailTemplate({
      isLoading: this._isLoading,
      error: this._error,
      story: this._story,
    });

    if (this._story && !this._isLoading && !this._error) {
      this._initMap();
      this._initSaveButton();
    }

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  _initMap() {
    if (!this._story) return;
    
    const { lat, lon } = this._story;
    if (!lat || !lon || isNaN(lat) || isNaN(lon) || this._mapInitialized) {
      return;
    }

    const mapContainer = this._container.querySelector("#detailMap");
    if (!mapContainer) {
      return;
    }

    const map = this._mapHelper.initMap(mapContainer, {
      center: [lat, lon],
      zoom: 15,
    });

    const marker = L.marker([lat, lon]).addTo(map);
    marker
      .bindPopup(
        `
      <div class="map-popup">
        <strong>${this._story.name}</strong>
        <p>Posted this story from here</p>
      </div>
    `
      )
      .openPopup();

    this._mapInitialized = true;
  }

  async _initSaveButton() {
    if (!this._story) return;

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    try {
      const isSaved = await Database.isStorySaved(this._story.id);
      this._updateSaveButtonState(saveButton, cancelButton, removeButton, isSaved);

      saveButton.addEventListener("click", this._handleSaveClick);
      cancelButton.addEventListener("click", this._handleCancelClick);
      removeButton.addEventListener("click", this._handleRemoveClick);
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  }

  async _handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    // Show cancel button first
    saveButton.style.display = "none";
    cancelButton.style.display = "block";

    try {
      const result = await Swal.fire({
        title: "Save Story",
        text: "Do you want to save this story?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#EB4231",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        await Database.saveStory(this._story);
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, true);

        await Swal.fire({
          title: "Saved!",
          text: "Story saved successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
      }
    } catch (error) {
      console.error("Error saving story:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
      this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
    }
  }

  _handleCancelClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);
  }

  async _handleRemoveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    try {
      const result = await Swal.fire({
        title: "Remove Story",
        text: "Are you sure you want to remove this story from saved stories?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#EB4231",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, remove it!",
      });

      if (result.isConfirmed) {
        await Database.removeReport(this._story.id);
        this._updateSaveButtonState(saveButton, cancelButton, removeButton, false);

        await Swal.fire({
          title: "Removed!",
          text: "Story removed from saved stories",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error removing story:", error);
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  }

  _updateSaveButtonState(saveButton, cancelButton, removeButton, isSaved) {
    if (!saveButton || !cancelButton || !removeButton) return;

    if (isSaved) {
      saveButton.style.display = "none";
      cancelButton.style.display = "none";
      removeButton.style.display = "block";
    } else {
      saveButton.style.display = "block";
      cancelButton.style.display = "none";
      removeButton.style.display = "none";
    }
  }

  _attachRetryHandler() {
    const retryButton = this._container.querySelector("#retryButton");
    if (retryButton && this._retryHandler) {
      retryButton.addEventListener("click", this._retryHandler);
    }
  }

  setRetryHandler(handler) {
    this._retryHandler = handler;

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  cleanup() {
    // Remove event listeners
    const saveButton = this._container.querySelector("#saveStoryButton");
    const cancelButton = this._container.querySelector("#cancelSaveButton");
    const removeButton = this._container.querySelector("#removeStoryButton");
    const retryButton = this._container.querySelector("#retryButton");

    if (saveButton) saveButton.removeEventListener("click", this._handleSaveClick);
    if (cancelButton) cancelButton.removeEventListener("click", this._handleCancelClick);
    if (removeButton) removeButton.removeEventListener("click", this._handleRemoveClick);
    if (retryButton && this._retryHandler) {
      retryButton.removeEventListener("click", this._retryHandler);
    }

    // Cleanup map if initialized
    if (this._mapInitialized && this._mapHelper) {
      this._mapHelper.clearMarkers();
    }
  }
}

export default DetailPage;
