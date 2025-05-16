// auth-login.js
import LoginPage from "../views/pages/sign-in.js";
import authRepository from "../services/user-session.js";
import webPushHelper from "../utils/web-push-helper.js";
import { applyCustomAnimation } from "../utils/transition-util.js";

class LoginPresenter {
  constructor(params = {}) {
    this._params = params;
    this._view = null;
    this._error = null;
    this._isLoading = false;

    this._handleLogin = this._handleLogin.bind(this);
  }

  async init() {
    if (authRepository.isAuthenticated()) {
      window.location.hash = "#/";
      return;
    }

    applyCustomAnimation("#pageContent", {
      name: "login-transition",
      duration: 400,
    });

    this._renderView();
  }

  _renderView() {
    this._view = new LoginPage({
      error: this._error,
      isLoading: this._isLoading,
    });

    this._view.render();
    this._view.setLoginHandler(this._handleLogin);
  }

  async _handleLogin(credentials) {
    if (this._isLoading) return;

    this._isLoading = true;
    this._error = null;
    this._view.setLoading(true);

    try {
      await authRepository.login(credentials);

      // Delegasi ke View untuk menampilkan sukses
      this._view.showLoginSuccess(() => {
        this._initializeWebPush();
        window.location.hash = "#/";
      });
    } catch (error) {
      console.error("Login failed:", error);
      this._error =
        error?.message || "Login gagal. Periksa kredensial Anda dan coba lagi.";
      this._renderView();
    } finally {
      this._isLoading = false;
      this._view.setLoading(false);
    }
  }

  async _initializeWebPush() {
    try {
      const isSupported = await webPushHelper.init();
      if (isSupported) {
        if (Notification.permission === "default") {
          await webPushHelper.requestPermission();
        }
        if (Notification.permission === "granted" && !webPushHelper.isSubscribed()) {
          await webPushHelper.subscribe();
        }
      }
    } catch (error) {
      console.warn("Push notification init failed:", error);
    }
  }

  cleanup() {
    if (this._view) {
      this._view.cleanup();
    }
  }
}

export default LoginPresenter;
