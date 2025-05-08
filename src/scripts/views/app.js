import authRepository from '../services/user-session.js';

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const route = routes[url];

    if (!route) {
      // Handle 404
      return;
    }

    if (route.requireAuth && !authRepository.isAuthenticated()) {
      // Redirect to login
      window.location.hash = '#/login';
      return;
    }

    const page = new route.component({
      container: this._content,
    });

    await page.render();
  }
}

export default App;