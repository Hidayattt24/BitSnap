// sign-in.js
import createLoginTemplate from "../template/login-template.js";
import Swal from "sweetalert2";

class LoginPage {
  constructor({ error = null, isLoading = false }) {
    this._error = error;
    this._isLoading = isLoading;
    this._loginHandler = null;
    this._container = document.querySelector("#pageContent");
  }

  render() {
    this._container.innerHTML = createLoginTemplate({
      error: this._error,
      isLoading: this._isLoading,
    });

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const form = document.getElementById("loginForm");

    if (form && !this._isLoading) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (this._loginHandler) {
          this._loginHandler({ email, password });
        }
      });
    }
  }

  setLoginHandler(handler) {
    this._loginHandler = handler;
  }

  setLoading(isLoading) {
    this._isLoading = isLoading;

    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.disabled = isLoading;
      loginButton.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Logging in...'
        : '<i class="fas fa-sign-in-alt"></i> Login';
    }

    const formFields = this._container.querySelectorAll(".form-input");
    formFields.forEach((field) => {
      field.disabled = isLoading;
    });
  }

  showLoginSuccess(onConfirmCallback) {
    Swal.fire({
      title: "Login Berhasil!",
      text: "Anda berhasil masuk.",
      icon: "success",
      confirmButtonColor: "#EB4231",
      confirmButtonText: "Lanjutkan",
    }).then(() => {
      if (typeof onConfirmCallback === "function") {
        onConfirmCallback();
      }
    });
  }

  cleanup() {
    // Optional: remove listeners
  }
}

export default LoginPage;
