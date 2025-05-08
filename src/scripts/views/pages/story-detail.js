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
    const saveButton = document.getElementById('saveStoryButton');
    if (!saveButton) return;

    try {
      const isSaved = await Database.isStorySaved(this._story.id);
      
      this._updateSaveButtonState(saveButton, isSaved);

      saveButton.addEventListener('click', async () => {
        try {
          if (isSaved) {
            // Remove story from saved
            await Database.removeReport(this._story.id);
            this._updateSaveButtonState(saveButton, false);
            
            Swal.fire({
              title: 'Removed!',
              text: 'Story removed from saved stories',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            // Save story
            await Database.saveStory(this._story);
            this._updateSaveButtonState(saveButton, true);
            
            Swal.fire({
              title: 'Saved!',
              text: 'Story saved successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error'
          });
        }
      });
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }

  _updateSaveButtonState(button, isSaved) {
    if (isSaved) {
      button.innerHTML = '<i class="fas fa-bookmark"></i> Remove from Saved';
      button.classList.add('button--saved');
    } else {
      button.innerHTML = '<i class="far fa-bookmark"></i> Save Story';
      button.classList.remove('button--saved');
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
