import Database from "../../services/database.js";

class SavedStoriesPage {
  constructor({ container }) {
    this._container = container;
    this._stories = [];
  }

  async render() {
    this._stories = await Database.getAllReports();
    
    this._container.innerHTML = `
      <section class="saved-stories">
        <div class="saved-stories__header">
          <h2 class="saved-stories__title">Saved Stories</h2>
        </div>
        
        ${this._generateStoriesList()}
      </section>
    `;
  }

  _generateStoriesList() {
    if (this._stories.length === 0) {
      return `
        <div class="stories-empty">
          <i class="fas fa-bookmark stories-empty__icon"></i>
          <p>No saved stories yet</p>
        </div>
      `;
    }

    return `
      <div class="stories-list">
        ${this._stories.map(story => `
          <article class="story-item">
            <img src="${story.photoUrl}" alt="${story.description}" class="story-item__image">
            <div class="story-item__content">
              <h3 class="story-item__title">${story.description}</h3>
              <p class="story-item__meta">
                <span class="story-item__author">
                  <i class="fas fa-user"></i> ${story.name}
                </span>
                <span class="story-item__date">
                  <i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
}

export default SavedStoriesPage;