import SavedStoriesIdb from '../../utils/idb-helper.js';

class StoryItem extends HTMLElement {
  /**
   * Set the story data to display
   * @param {Object} story - Story data object
   */
  set story(story) {
    this._story = story;
    this.render();
  }

  /**
   * Format date to localized string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  _formatDate(dateString) {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  _truncateText(text, maxLength = 150) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength) + "...";
  }

  async render() {
    if (!this._story) {
      this.innerHTML =
        '<div class="story-item__error">No story data available</div>';
      return;
    }

    const { id, name, description, photoUrl, createdAt, lat, lon } =
      this._story;
    const hasLocation = lat && lon && !isNaN(lat) && !isNaN(lon);
    const isSaved = await SavedStoriesIdb.getStory(id);

    const tags = ["Tech", "Learning", "Project", "BitSnap"]
      .map(
        (tag) => `
      <span class="story-item__tag">#${tag}</span>
    `
      )
      .join("");

    this.innerHTML = `
        <article class="story-item">
          <div class="story-item__image-container">
            <img 
              src="${photoUrl}" 
              alt="Story by ${name}"
              class="story-item__image"
              loading="lazy"
            />
          </div>
          
          <div class="story-item__content">
            <div class="story-item__meta">
              <span class="story-item__author">
                <i class="fas fa-user"></i>
                ${name}
              </span>
              <span class="story-item__date">
                <i class="fas fa-calendar-alt"></i>
                ${this._formatDate(createdAt)}
              </span>
              ${
                hasLocation
                  ? `
                <span class="story-item__location">
                  <i class="fas fa-map-marker-alt"></i>
                  Location Available
                </span>
              `
                  : ""
              }
            </div>
            
            <h3 class="story-item__title">
              <a href="#/detail/${id}" class="story-item__link">
                Story by ${name}
              </a>
            </h3>
            
            <p class="story-item__description">
              ${this._truncateText(description)}
            </p>
            
         
            <div class="story-item__tags">
              ${tags}
            </div>
            
            <div class="story-item__actions">
              <button class="story-item__save-btn" data-id="${id}">
                <i class="fas ${isSaved ? 'fa-bookmark' : 'fa-bookmark-o'}"></i>
                ${isSaved ? 'Saved' : 'Save'}
              </button>
              <a href="#/detail/${id}" class="story-item__button">
                Read More
                <i class="fas fa-arrow-right"></i>
              </a>
            </div>
          </div>
        </article>
      `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const saveButton = this.querySelector('.story-item__save-btn');
    saveButton?.addEventListener('click', async (e) => {
      const id = e.target.closest('.story-item__save-btn').dataset.id;
      const isSaved = await SavedStoriesIdb.getStory(id);
      
      if (isSaved) {
        await SavedStoriesIdb.deleteStory(id);
        alert('Story removed from saved items');
      } else {
        await SavedStoriesIdb.saveStory(this._story);
        alert('Story saved successfully');
      }
      
      this.render();
    });
  }
}

customElements.define("story-item", StoryItem);

export default StoryItem;
