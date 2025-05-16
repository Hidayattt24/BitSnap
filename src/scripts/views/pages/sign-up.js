import createRegisterTemplate from "../template/register-template.js";
import Swal from "sweetalert2";

class RegisterPage {
  constructor({ error = null, isLoading = false }) {
    this._error = error;
    this._isLoading = isLoading;
    this._registerHandler = null;
    this._container = document.querySelector("#pageContent");
  }

  render() {
    this._container.innerHTML = createRegisterTemplate({
      error: this._error,
      isLoading: this._isLoading,
    });

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const form = document.getElementById("registerForm");

    if (form && !this._isLoading) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (this._validateForm()) {
          const name = document.getElementById("name").value.trim();
          const email = document.getElementById("email").value.trim();
          const password = document.getElementById("password").value;

          if (this._registerHandler) {
            this._registerHandler({ name, email, password });
          }
        }
      });
    }
  }

  _validateForm() {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    if (!name.value.trim()) {
      this._showFieldError(name, "Please enter your name");
      return false;
    }

    if (!email.validity.valid) {
      this._showFieldError(email, "Please enter a valid email address");
      return false;
    }

    if (password.value.length < 8) {
      this._showFieldError(password, "Password must be at least 8 characters long");
      return false;
    }

    if (password.value !== confirmPassword.value) {
      this._showFieldError(confirmPassword, "Passwords do not match");
      return false;
    }

    return true;
  }

  _showFieldError(field, message) {
    field.classList.add("form-input--error");

    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains("form-error")) {
      errorElement = document.createElement("p");
      errorElement.className = "form-error";
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = message;

    field.addEventListener(
      "input",
      () => {
        field.classList.remove("form-input--error");
        if (errorElement && errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      },
      { once: true }
    );
  }

  setRegisterHandler(handler) {
    this._registerHandler = handler;
  }

  setLoading(isLoading) {
    this._isLoading = isLoading;

    const registerButton = document.getElementById("registerButton");
    if (registerButton) {
      registerButton.disabled = isLoading;
      registerButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Registering...'
        : '<i class="fas fa-user-plus"></i> Register';
    }

    const formFields = this._container.querySelectorAll(".form-input");
    formFields.forEach((field) => {
      field.disabled = isLoading;
    });
  }

  setError(errorMessage) {
    this._error = errorMessage;
  }

  showSuccessMessage() {
    const formElement = document.getElementById("registerForm");
    if (!formElement) return;

    const successMessage = document.createElement("div");
    successMessage.className = "success-message";
    successMessage.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <p>Registration successful!</p>
      <p>Redirecting to login page...</p>
    `;

    formElement.innerHTML = "";
    formElement.appendChild(successMessage);
  }

  showAlreadyLoggedInWarning(onConfirmCallback) {
    Swal.fire({
      title: "Already Logged In",
      text: "You are already logged in. Please log out first to register a new account.",
      icon: "info",
      confirmButtonColor: "#EB4231",
    }).then(() => {
      if (typeof onConfirmCallback === "function") {
        onConfirmCallback();
      }
    });
  }

  showRegistrationSuccess(onConfirmCallback) {
    Swal.fire({
      title: "Registration Successful!",
      text: "Your account has been created. You can now log in.",
      icon: "success",
      confirmButtonColor: "#EB4231",
      confirmButtonText: "Login Now",
    }).then(() => {
      if (typeof onConfirmCallback === "function") {
        onConfirmCallback();
      }
    });
  }

  cleanup() {
    // Optional: remove listeners if needed
  }
}

export default RegisterPage;
