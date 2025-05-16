import createAddStoryTemplate from "../template/create-template.js";
import MapHelper from "../../utils/location-util.js";
import CameraHelper from "../../utils/camera-util.js";
import { applyCustomAnimation } from "../../utils/transition-util.js";

class AddStoryPage {
  constructor({ isLoading = false, container, onSubmit }) {
    this._isLoading = isLoading;
    this._container = container;
    this._onSubmit = onSubmit;
    this._mapHelper = new MapHelper();
    this._cameraHelper = new CameraHelper();
    this._selectedLocation = null;
    this._photoFile = null;
    this._isCameraActive = false;

    // Bind methods
    this._initCamera = this._initCamera.bind(this);
    this._stopCamera = this._stopCamera.bind(this);
    this._takePhoto = this._takePhoto.bind(this);
    this._switchCamera = this._switchCamera.bind(this);
    this._onLocationSelected = this._onLocationSelected.bind(this);
    this._getUserLocation = this._getUserLocation.bind(this);
    this._resetPhoto = this._resetPhoto.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }

  render() {
    // Apply transition animation directly with container element
    applyCustomAnimation(this._container, {
      name: "add-story-transition",
      duration: 400,
    });

    this._container.innerHTML = createAddStoryTemplate({
      isLoading: this._isLoading,
    });

    this._initMap();
    this._attachEventListeners();
    this._initializePhotoUpload();
  }

  _initMap() {
    const mapContainer = document.getElementById("locationMap");
    if (!mapContainer) {
      return;
    }

    const map = this._mapHelper.initMap(mapContainer);

    this._mapHelper.setupLocationSelector(this._onLocationSelected);
  }

  _attachEventListeners() {
    // Camera controls
    const startCameraButton = document.getElementById("startCameraButton");
    const takePictureButton = document.getElementById("takePictureButton");
    const switchCameraButton = document.getElementById("switchCameraButton");
    const resetPhotoButton = document.getElementById("resetPhotoButton");

    if (startCameraButton) {
      startCameraButton.addEventListener("click", this._initCamera);
    }

    if (takePictureButton) {
      takePictureButton.addEventListener("click", this._takePhoto);
    }

    if (switchCameraButton) {
      switchCameraButton.addEventListener("click", this._switchCamera);
    }

    if (resetPhotoButton) {
      resetPhotoButton.addEventListener("click", this._resetPhoto);
    }

    // Location controls
    const getUserLocationButton = document.getElementById("getUserLocationButton");
    if (getUserLocationButton) {
      getUserLocationButton.addEventListener("click", this._getUserLocation);
    }

    // Photo input
    const photoInput = document.getElementById("photoInput");
    if (photoInput) {
      photoInput.addEventListener("change", this._handleFileInput.bind(this));
    }

    // Form submission
    const form = document.getElementById("addStoryForm");
    if (form) {
      form.addEventListener("submit", this._handleSubmit);
    }
  }

  async _initCamera() {
    if (this._isCameraActive) {
      return;
    }

    try {
      const videoElement = document.getElementById("cameraPreview");
      if (!videoElement) {
        return;
      }

      await this._cameraHelper.initCamera(videoElement);

      this._isCameraActive = true;
      this._updateCameraUI(true);

      this._showVideoPreview();
    } catch (error) {
      console.error("Failed to initialize camera:", error);
      alert(`Could not access camera: ${error.message}`);
    }
  }

  _stopCamera() {
    if (!this._isCameraActive) {
      return;
    }

    this._cameraHelper.stopCamera();
    this._isCameraActive = false;
    this._updateCameraUI(false);
  }

  async _takePhoto() {
    if (!this._isCameraActive) {
      return;
    }

    try {
      const canvasElement = document.getElementById("photoCanvas");
      if (!canvasElement) {
        return;
      }

      this._cameraHelper.takePhoto(canvasElement);

      this._photoFile = await this._cameraHelper.getPhotoFile();

      this._showPhotoPreview();

      this._updatePhotoUI(true);

      this._stopCamera();
    } catch (error) {
      console.error("Failed to take photo:", error);
      alert(`Could not take photo: ${error.message}`);
    }
  }

  async _switchCamera() {
    if (!this._isCameraActive) {
      return;
    }

    try {
      await this._cameraHelper.switchCamera();
    } catch (error) {
      console.error("Failed to switch camera:", error);
      alert(`Could not switch camera: ${error.message}`);
    }
  }

  /**
   * Handle location selection from map
   * @param {Object} location - { lat, lon } coordinates
   */
  _onLocationSelected(location) {
    this._selectedLocation = location;
    this._updateLocationUI();
  }

  async _getUserLocation() {
    try {
      const location = await this._mapHelper.getUserLocation();
      this._selectedLocation = location;
      this._updateLocationUI();
    } catch (error) {
      console.error("Failed to get user location:", error);
      alert(`Could not get your location: ${error.message}`);
    }
  }

  _resetPhoto() {
    const photoPreview = document.getElementById("photoPreview");
    if (photoPreview) {
      photoPreview.style.backgroundImage = "none";
    }

    const canvas = document.getElementById("photoCanvas");
    if (canvas) {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this._photoFile = null;

    const fileInput = document.getElementById("photoInput");
    if (fileInput) {
      fileInput.value = "";
    }

    this._updatePhotoUI(false);
  }

  /**
   * Handle file selection from input
   * @param {Event} event - Change event
   */
  _handleFileInput(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      event.target.value = "";
      return;
    }

    this._photoFile = file;
    this._showFilePreview(file);
  }

  _showFilePreview(file) {
    const reader = new FileReader();
    const photoPreview = document.getElementById("photoPreview");
    const videoElement = document.getElementById("cameraPreview");
    const canvas = document.getElementById("photoCanvas");

    reader.onload = (e) => {
      if (photoPreview) {
        // Hide other elements
        if (videoElement) videoElement.style.display = "none";
        if (canvas) canvas.style.display = "none";

        // Show and update preview
        photoPreview.style.display = "block";
        photoPreview.style.backgroundImage = `url(${e.target.result})`;
        photoPreview.style.backgroundSize = "contain";
        photoPreview.style.backgroundPosition = "center";
        photoPreview.style.backgroundRepeat = "no-repeat";

        // Remove placeholder if exists
        const placeholder = document.querySelector(
          ".photo-capture__placeholder"
        );
        if (placeholder) {
          placeholder.style.display = "none";
        }
      }
      this._updatePhotoUI(true);
    };

    reader.readAsDataURL(file);
  }

  /**
   * Validate form before submission
   * @returns {boolean} Whether form is valid
   */
  _validateForm() {
    const description = document.getElementById("description");
    if (!description || !description.value.trim()) {
      alert("Please enter a description for your story");
      return false;
    }

    if (!this._photoFile) {
      alert("Please take or upload a photo for your story");
      return false;
    }

    return true;
  }

  /**
   * Get form data for submission
   * @returns {Object} Form data
   */
  _getFormData() {
    const description = document.getElementById("description").value.trim();

    const formData = {
      description,
      photo: this._photoFile,
    };

    if (this._selectedLocation) {
      formData.lat = this._selectedLocation.lat;
      formData.lon = this._selectedLocation.lon;
    }

    return formData;
  }

  _showVideoPreview() {
    const videoElement = document.getElementById("cameraPreview");
    const photoPreview = document.getElementById("photoPreview");
    const canvas = document.getElementById("photoCanvas");

    if (videoElement && photoPreview && canvas) {
      videoElement.style.display = "block";
      photoPreview.style.display = "none";
      canvas.style.display = "none";
    }
  }

  _showPhotoPreview() {
    const videoElement = document.getElementById("cameraPreview");
    const photoPreview = document.getElementById("photoPreview");
    const canvas = document.getElementById("photoCanvas");

    if (videoElement && photoPreview && canvas) {
      videoElement.style.display = "none";
      photoPreview.style.display = "block";

      const photoUrl = canvas.toDataURL("image/jpeg");
      photoPreview.style.backgroundImage = `url(${photoUrl})`;
    }
  }

  /**
   * Update camera UI based on active state
   * @param {boolean} isActive - Whether camera is active
   */
  _updateCameraUI(isActive) {
    const startCameraButton = document.getElementById("startCameraButton");
    const takePictureButton = document.getElementById("takePictureButton");
    const switchCameraButton = document.getElementById("switchCameraButton");

    if (startCameraButton && takePictureButton && switchCameraButton) {
      startCameraButton.disabled = isActive;
      takePictureButton.disabled = !isActive;
      switchCameraButton.disabled = !isActive;
    }
  }

  /**
   * Update photo UI based on whether photo is taken
   * @param {boolean} hasPhoto - Whether photo is taken
   */
  _updatePhotoUI(hasPhoto) {
    const resetPhotoButton = document.getElementById("resetPhotoButton");
    const startCameraButton = document.getElementById("startCameraButton");

    if (resetPhotoButton && startCameraButton) {
      resetPhotoButton.disabled = !hasPhoto;
      startCameraButton.disabled = hasPhoto;
    }
  }

  _updateLocationUI() {
    const selectedLocationElement = document.getElementById("selectedLocation");

    if (!selectedLocationElement) {
      return;
    }

    if (this._selectedLocation) {
      const { lat, lon } = this._selectedLocation;
      selectedLocationElement.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Location selected: <br>
        <strong>Latitude:</strong> ${lat.toFixed(6)}, 
        <strong>Longitude:</strong> ${lon.toFixed(6)}
      `;
      selectedLocationElement.classList.add(
        "location-picker__selected--active"
      );
    } else {
      selectedLocationElement.textContent = "No location selected";
      selectedLocationElement.classList.remove(
        "location-picker__selected--active"
      );
    }
  }

  showSuccessMessage() {
    const formElement = document.getElementById("addStoryForm");

    if (!formElement) {
      return;
    }

    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>Your story has been posted successfully!</p>
      <p>Redirecting to home page...</p>
    `;

    formElement.innerHTML = "";

    formElement.appendChild(successMessage);
  }

  _handleSubmit(event) {
    event.preventDefault();
    
    if (!this._validateForm()) {
      return;
    }

    const formData = this._getFormData();
    this._onSubmit(formData);
  }

  cleanup() {
    this._stopCamera();
    
    // Remove event listeners
    const elements = [
      "startCameraButton",
      "takePictureButton",
      "switchCameraButton",
      "resetPhotoButton",
      "getUserLocationButton",
      "photoInput",
      "addStoryForm"
    ];

    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.replaceWith(element.cloneNode(true));
      }
    });

    // Clear container
    if (this._container) {
      this._container.innerHTML = "";
    }
  }

  _initializePhotoUpload() {
    const fileWrapper = document.querySelector(".photo-capture__file-wrapper");
    const photoInput = document.querySelector("#photoInput");
    const photoPreview = document.querySelector("#photoPreview");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      fileWrapper.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      fileWrapper.addEventListener(eventName, () => {
        fileWrapper.classList.add("photo-capture__file-wrapper--active");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      fileWrapper.addEventListener(eventName, () => {
        fileWrapper.classList.remove("photo-capture__file-wrapper--active");
      });
    });

    fileWrapper.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        photoInput.files = e.dataTransfer.files;
        this._handlePhotoSelect(file);
      }
    });
  }

  _handlePhotoSelect(file) {
    const photoPreview = document.querySelector("#photoPreview");
    const reader = new FileReader();

    reader.onload = (e) => {
      photoPreview.style.backgroundImage = `url(${e.target.result})`;
      photoPreview.classList.add("active");
    };

    reader.readAsDataURL(file);
  }

  /**
   * Set loading state during submission
   * @param {boolean} isLoading - Whether form is submitting
   */
  setLoading(isLoading) {
    this._isLoading = isLoading;

    const submitButton = this._container.querySelector("#submitButton");
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Posting...'
        : '<i class="fas fa-paper-plane"></i> Post Story';
    }

    // Disable form elements during loading
    const formElements = this._container.querySelectorAll(
      "button, input, textarea"
    );
    formElements.forEach((el) => {
      if (
        el.id !== "takePictureButton" &&
        el.id !== "switchCameraButton" &&
        el.id !== "resetPhotoButton"
      ) {
        el.disabled = isLoading;
      }
    });
  }
}

export default AddStoryPage;
