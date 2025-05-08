import Database from "../../services/database.js";
import Swal from "sweetalert2";

class SavedStoriesPage {
  constructor(params = {}) {
    this._container = document.querySelector('#pageContent'); // Get container directly
    this._stories = [];
  }

  async init() {
    await this.render();
  }

  async render() {
    try {
      this._stories = await Database.getAllReports();
      
      if (!this._container) {
        throw new Error('Container element not found');
      }

      this._container.innerHTML = `
        <section class="saved-stories">
          <div class="saved-stories__header">
            <h2 class="saved-stories__title">Saved Stories</h2>
            <a href="#/" class="button secondary">
              <i class="fas fa-arrow-left"></i> Back to Home
            </a>
          </div>
          
          ${this._generateStoriesList()}
        </section>
      `;

      this._attachEventListeners();
    } catch (error) {
      console.error('Error rendering saved stories:', error);
      this._renderError(error.message);
    }
  }

  _renderError(message) {
    if (this._container) {
      this._container.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <h2>Error Loading Saved Stories</h2>
          <p class="error-message">${message}</p>
          <button class="button" onclick="window.location.reload()">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      `;
    }
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
          <article class="story-item" data-id="${story.id}">
            <div class="story-item__image-container">
              <img src="${story.photoUrl}" alt="${story.description}" class="story-item__image">
              <button class="story-item__remove-btn" data-id="${story.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
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
              <a href="#/detail/${story.id}" class="button secondary">
                <i class="fas fa-eye"></i> View Story
              </a>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  _attachEventListeners() {
    const removeButtons = this._container.querySelectorAll('.story-item__remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const storyId = e.currentTarget.dataset.id;
        
        try {
          const result = await Swal.fire({
            title: 'Remove Story',
            text: 'Are you sure you want to remove this story from saved stories?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
          });

          if (result.isConfirmed) {
            await Database.removeReport(storyId);
            const storyElement = document.querySelector(`.story-item[data-id="${storyId}"]`);
            if (storyElement) {
              storyElement.remove();
            }
            
            // Check if no stories left
            if (this._container.querySelectorAll('.story-item').length === 0) {
              this.render(); // Re-render to show empty state
            }

            Swal.fire(
              'Removed!',
              'Story has been removed from saved stories.',
              'success'
            );
          }
        } catch (error) {
          console.error('Error removing story:', error);
          Swal.fire(
            'Error!',
            'Failed to remove story. Please try again.',
            'error'
          );
        }
      });
    });
  }

  cleanup() {
    this._stories = [];
    if (this._container) {
      this._container.innerHTML = '';
    }
  }
}

export default SavedStoriesPage;