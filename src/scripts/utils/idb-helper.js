const DATABASE_NAME = 'bitsnap-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const SavedStoriesIdb = {
  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  },

  async getStories() {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    return store.getAll();
  },

  async saveStory(story) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    return store.put(story);
  },

  async deleteStory(id) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    return store.delete(id);
  },

  async getStory(id) {
    const db = await this.openDB();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    return store.get(id);
  }
};

export default SavedStoriesIdb;