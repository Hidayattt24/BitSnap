import createAboutTemplate from "../template/about-template.js";

class AboutPage {
  constructor() {
    this._container = document.querySelector("#pageContent");
  }

  render() {
    this._container.innerHTML = `
      <section class="about">
        <div class="about__header">
          <h2 class="about__title">About BitSnap</h2>
        </div>
        
        <div class="about__content">
          <div class="about__description">
            <p>BitSnap adalah platform berbagi cerita visual dan lokasi yang didedikasikan untuk komunitas pembelajar di Dicoding.</p>
            
            <div class="about__features">
              <div class="feature-card">
                <i class="fas fa-camera feature-card__icon"></i>
                <h3>Visual Stories</h3>
                <p>Bagikan momen pembelajaran Anda melalui foto berkualitas tinggi</p>
              </div>
              
              <div class="feature-card">
                <i class="fas fa-map-marker-alt feature-card__icon"></i>
                <h3>Location Sharing</h3>
                <p>Tandai dan bagikan lokasi di mana Anda belajar atau berkolaborasi</p>
              </div>
              
              <div class="feature-card">
                <i class="fas fa-users feature-card__icon"></i>
                <h3>Tech Community</h3>
                <p>Terhubung dengan sesama pembelajar teknologi di Dicoding</p>
              </div>
            </div>
            
            <div class="about__tech">
              <h3>Technologies Used</h3>
              <div class="tech-stack">
                <span class="tech-badge">JavaScript</span>
                <span class="tech-badge">Web Components</span>
                <span class="tech-badge">PWA</span>
                <span class="tech-badge">Leaflet Maps</span>
                <span class="tech-badge">Responsive Design</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async init() {
    this.render();
  }

  cleanup() {
    // Cleanup if needed
  }
}

export default AboutPage;
