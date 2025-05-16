import RegisterPage from "../views/pages/sign-up.js";
import authRepository from "../services/user-session.js";
import { applyCustomAnimation } from "../utils/transition-util.js";

class RegisterPresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._error = null;
    this._isLoading = false;

    this._handleRegister = this._handleRegister.bind(this);
    this._redirectToHome = this._redirectToHome.bind(this);
    this._redirectToLogin = this._redirectToLogin.bind(this);
  }

  async init() {
    applyCustomAnimation("#pageContent", {
      name: "register-transition",
      duration: 400,
    });

    this._view = new RegisterPage({
      error: this._error,
      isLoading: this._isLoading,
    });

    this._view.setRegisterHandler(this._handleRegister);

    if (authRepository.isAuthenticated()) {
      this._view.showAlreadyLoggedInWarning(this._redirectToHome);
      return;
    }

    this._view.render();
  }

  async _handleRegister(userData) {
    if (this._isLoading) return;

    this._isLoading = true;
    this._view.setLoading(true);

    try {
      await authRepository.register(userData);

      this._view.setLoading(false);
      this._view.showSuccessMessage();
      this._view.showRegistrationSuccess(this._redirectToLogin);
    } catch (error) {
      this._error = error.message || "Registration failed. Please try again.";
      this._view.setError(this._error);
      this._view.render(); // re-render with error
    } finally {
      this._isLoading = false;
      this._view.setLoading(false);
    }
  }

  _redirectToHome() {
    window.location.hash = "#/";
  }

  _redirectToLogin() {
    window.location.hash = "#/login";
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default RegisterPresenter;
