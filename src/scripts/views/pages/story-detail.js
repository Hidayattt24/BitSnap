import createDetailTemplate from "../template/detail-template.js";
import MapHelper from "../../utils/location-util.js";
import Database from "../../services/database.js";
import Swal from "sweetalert2";

class DetailPage {
  constructor({ story = null, isLoading = false, error = null, container }) {
    this._story = story;
    this._isLoading = isLoading;
    this._error = error;
    this._container = container;
    this._mapHelper = new MapHelper();
    this._mapInitialized = false;
    this._initSaveButton = this._initSaveButton.bind(this);
  }

  async render() {
    this._container.innerHTML = createDetailTemplate({
      isLoading: this._isLoading,
      error: this._error,
      story: this._story,
    });

    if (this._story && !this._isLoading && !this._error) {
      this._initMap();
      await this._initSaveButton();
    }

    if (this._error) {
      this._attachRetryHandler();
    }
  }

  _initMap() {
    const { lat, lon } = this._story;

    if (!lat || !lon || isNaN(lat) || isNaN(lon) || this._mapInitialized) {
      return;
    }

    const mapContainer = document.getElementById("detailMap");
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
    const saveButton = document.getElementById("saveStoryButton");
    const cancelButton = document.getElementById("cancelSaveButton");
    const removeButton = document.getElementById("removeStoryButton");

    if (!saveButton || !cancelButton || !removeButton) return;

    try {
      const isSaved = await Database.isStorySaved(this._story.id);
      this._updateSaveButtonState(
        saveButton,
        cancelButton,
        removeButton,
        isSaved
      );

      // Save button handler
      saveButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Show cancel button first
        saveButton.style.display = "none";
        cancelButton.style.display = "block";

        // Only show confirmation if user hasn't clicked cancel
        const confirmSave = async () => {
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
              this._updateSaveButtonState(
                saveButton,
                cancelButton,
                removeButton,
                true
              );

              Swal.fire({
                title: "Saved!",
                text: "Story saved successfully",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
              });
            } else {
              this._updateSaveButtonState(
                saveButton,
                cancelButton,
                removeButton,
                false
              );
            }
          } catch (error) {
            console.error("Error saving story:", error);
            Swal.fire({
              title: "Error",
              text: error.message,
              icon: "error",
            });
            this._updateSaveButtonState(
              saveButton,
              cancelButton,
              removeButton,
              false
            );
          }
        };

        confirmSave();
      });

      // Cancel button handler
      cancelButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Directly update UI state without any async operations
        this._updateSaveButtonState(
          saveButton,
          cancelButton,
          removeButton,
          false
        );
      });

      // Remove button handler
      removeButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
            this._updateSaveButtonState(
              saveButton,
              cancelButton,
              removeButton,
              false
            );

            Swal.fire({
              title: "Removed!",
              text: "Story removed from saved stories",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        } catch (error) {
          console.error("Error removing story:", error);
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
          });
        }
      });
    } catch (error) {
      console.error("Error checking saved status:", error);
    }
  }

  _updateSaveButtonState(saveButton, cancelButton, removeButton, isSaved) {
    // Make sure all buttons exist before updating
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
    const retryButton = document.getElementById("retryButton");
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

  cleanup() {
    if (this._mapInitialized && this._mapHelper) {
      this._mapHelper.clearMarkers();
    }
  }
}

export default DetailPage;
