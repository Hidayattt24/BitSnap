import DBHelper from '../utils/db-helper.js';
import SavedStoriesIdb from '../utils/idb-helper.js';

class OfflineStories extends HTMLElement {
  constructor() {
    super();
    this._stories = [];
  }

  async connectedCallback() {
    await this._loadStories();
    this.render();
  }

  async _loadStories() {
    this._stories = await DBHelper.getStories();
  }

  render() {
    this.innerHTML = `
      <div class="offline-stories">
        <h2>Cerita Tersimpan Offline</h2>
        <div class="stories-list">
          ${this._stories.map(story => `
            <div class="story-item">
              <img src="${story.photoUrl}" alt="${story.description}">
              <p>${story.description}</p>
              <button class="delete-btn" data-id="${story.id}">Hapus</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this._initializeListeners();
  }

  _initializeListeners() {
    const deleteButtons = this.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await DBHelper.deleteStory(id);
        await this._loadStories();
        this.render();
      });
    });
  }
}

customElements.define('offline-stories', OfflineStories);

class SavedPage {
  constructor() {
    this._stories = [];
  }

  async render() {
    const content = document.querySelector('#pageContent');
    content.innerHTML = `
      <div class="saved-stories">
        <h2>Saved Stories</h2>
        <div id="savedStoriesList" class="stories-list"></div>
      </div>
    `;

    await this._displaySavedStories();
  }

  async _displaySavedStories() {
    const container = document.querySelector('#savedStoriesList');
    this._stories = await SavedStoriesIdb.getSavedStories();

    if (this._stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-bookmark"></i>
          <p>No saved stories yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this._stories.forEach((story) => {
      const storyItem = document.createElement('story-item');
      storyItem.story = story;
      container.appendChild(storyItem);
    });
  }
}

export default SavedPage;