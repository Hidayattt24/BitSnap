const createHomeTemplate = ({
  isLoading = false,
  error = null,
  stories = [],
}) => {
  if (isLoading) {
    return `
      <section class="home">
        <h2 class="home__title">Recent Stories</h2>
        
        <div class="loading-indicator">
          <div class="loading-spinner"></div>
          <p>Loading stories...</p>
        </div>
      </section>
    `;
  }

  if (error) {
    return `
      <section class="home">
        <h2 class="home__title">Recent Stories</h2>
        
        <div class="error-container">
          <i class="fas fa-exclamation-circle error-icon"></i>
          <p class="error-message">${error}</p>
          <button class="button" id="retryButton">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      </section>
    `;
  }

  const mapTemplate = `
    <div class="map-container">
      <h3 class="map-title">
        <i class="fas fa-map-marked-alt"></i>
        Story Locations
      </h3>
      <div id="storyMap" class="story-map"></div>
    </div>
  `;

  const emptyTemplate = `
  <div class="welcome-section">
    <div class="welcome-content">
      <img src="/favicon.png" alt="Welcome to BitSnap" class="welcome-image">
      <h2 class="welcome-title">Welcome to BitSnap!</h2>
      <p class="welcome-description">
        Share your learning journey with the Dicoding community. Capture moments, mark locations, and inspire others.
      </p>
      <div class="welcome-features">
        <div class="welcome-feature">
          <i class="fas fa-camera-retro"></i>
          <span>Share Visual Stories</span>
        </div>
        <div class="welcome-feature">
          <i class="fas fa-map-marker-alt"></i>
          <span>Mark Locations</span>
        </div>
        <div class="welcome-feature">
          <i class="fas fa-users"></i>
          <span>Learn</span>
        </div>
      </div>
      <a href="#/add" class="welcome-button">
        <i class="fas fa-plus-circle"></i>
        Share Your First Story
      </a>
    </div>
  </div>
`;

  const storiesTemplate =
    stories.length > 0
      ? `<div class="stories-list" id="storiesList"></div>`
      : emptyTemplate;

  return `
    <section class="home">
      <h2 class="home__title">Recent Stories</h2>
      
      ${stories.some((story) => story.lat && story.lon) ? mapTemplate : ""}
      
      <div class="home__content">
        ${storiesTemplate}
      </div>
    </section>
  `;
};

export default createHomeTemplate;
