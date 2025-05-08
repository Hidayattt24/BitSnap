import SavedStoriesIdb from '../../utils/idb-helper.js';

class SavedStories extends HTMLElement {
  constructor() {
    super();
    this._stories = [];
  }

  async connectedCallback() {
    await this._fetchSavedStories();
    this.render();
  }

  async _fetchSavedStories() {
    this._stories = await SavedStoriesIdb.getStories();
  }

  render() {
    this.innerHTML = `
      <section class="saved-stories">
        <h2 class="saved-stories__title">Saved Stories</h2>
        ${this._generateStoriesList()}
      </section>
    `;

    this._attachEventListeners();
  }

  _generateStoriesList() {
    if (this._stories.length === 0) {
      return `
        <div class="saved-stories__empty">
          <i class="fas fa-bookmark"></i>
          <p>No saved stories yet</p>
        </div>
      `;
    }

    return `
      <div class="saved-stories__list">
        ${this._stories.map(story => `
          <article class="saved-story-item">
            <img src="${story.photoUrl}" alt="${story.name}'s story" class="saved-story-item__image">
            <div class="saved-story-item__content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
              <div class="saved-story-item__actions">
                <button class="delete-btn" data-id="${story.id}">
                  <i class="fas fa-trash"></i> Remove
                </button>
                <a href="#/detail/${story.id}" class="view-btn">
                  <i class="fas fa-eye"></i> View
                </a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  _attachEventListeners() {
    const deleteButtons = this.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await SavedStoriesIdb.deleteStory(id);
        await this._fetchSavedStories();
        this.render();
      });
    });
  }
}

customElements.define('saved-stories', SavedStories);

export default SavedStories;