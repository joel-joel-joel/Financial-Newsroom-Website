/**
 * ui-renderer.js
 * Handles all DOM manipulation and rendering
 * Converts API data into HTML and inserts into page
 * Features: Template rendering, loading states, error messages
 */

class UIRenderer {
  constructor() {
    this.loadingTemplate = this.createLoadingTemplate();
  }

  /**
   * Create and return a loading spinner element
   */
  createLoadingTemplate() {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>Loading...</p>
        <div style="border: 3px solid #f3f3f3; border-top: 3px solid #0066cc; 
                    border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite;
                    margin: 10px auto;"></div>
      </div>
    `;
    return loader;
  }

  /**
   * Display loading state in container
   */
  showLoading(container) {
    if (container) {
      container.innerHTML = '';
      container.appendChild(this.loadingTemplate.cloneNode(true));
    }
  }

  /**
   * Display error message in container
   */
  showError(container, message = 'Failed to load content. Please try again.') {
    if (container) {
      container.innerHTML = `
        <div style="padding: 20px; background-color: #fff3cd; 
                    border: 1px solid #ffc107; border-radius: 4px; color: #856404;">
          <strong>Error:</strong> ${message}
        </div>
      `;
    }
  }

  // ==================== News Ticker ====================

  /**
   * Render news ticker with headlines
   * @param {Array} articles - Array of article objects
   * @param {string} containerSelector - CSS selector for ticker container
   */
    renderNewsTicker(articles, containerSelector = '.news-ticker') {
    const span = document.querySelector('#ticker-content');
    if (!span) return;
    span.textContent = articles.map(a => a.title).join(' | ');
  }

  // ==================== Trending Section ====================

  /**
   * Render trending articles
   * @param {Array} articles - Array of article objects
   * @param {string} containerSelector - CSS selector for trending list
   */
  renderTrendingSection(articles, containerSelector = '.trending-list') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    articles.slice(0, 5).forEach((article, index) => {
    const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
    const li = document.createElement('li');
    li.innerHTML = `
        <img src="${article.image || article.urlToImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcHBsZSBHYXJhbW9uZCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}" alt="${article.title}" class="trend-img" />
        <a href="article.html?id=${id}">${article.title}</a>
    `;
    container.appendChild(li);
    });
  }

  // ==================== Top Stories Grid ====================

  /**
   * Render top stories in grid/carousel
   * @param {Array} articles - Array of article objects
   * @param {string} containerSelector - CSS selector for stories container
   */
  renderTopStories(articles, containerSelector = '.top-stories') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = ''; // Clear existing stories

    articles.forEach((article, index) => {
  const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  const storyDiv = document.createElement('div');
  storyDiv.className = 'story';
  storyDiv.innerHTML = `
    <img src="${article.image || article.urlToImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcHBsZSBHYXJhbW9uZCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}" alt="${article.title}" class="story-img" />
    <a href="article.html?id=${id}" title="${article.title}">
      ${this.truncateText(article.title, 60)}
    </a>
  `;
  container.appendChild(storyDiv);
});

    // Reinitialize carousel after rendering new content
    this.reinitializeCarousel(containerSelector);
  }

  /**
   * Reinitialize carousel after DOM changes
   * Necessary because carousel script runs on page load
   */
  reinitializeCarousel(storiesSelector) {
    const storiesContainer = document.querySelector(storiesSelector);
    if (!storiesContainer) return;

    const stories = Array.from(document.querySelectorAll(".story"));
    const storiesPerView = 5;
    const totalStories = stories.length;

    if (totalStories === 0) return;

    // Clear any existing duplicates and reset
    storiesContainer.innerHTML = '';
    stories.forEach(story => storiesContainer.appendChild(story));

    // Re-duplicate stories for carousel
    stories.forEach(story => {
      const clone = story.cloneNode(true);
      storiesContainer.appendChild(clone);
    });

    // Reinitialize carousel animation
    let index = 0;
    const storyWidthPercent = 100 / storiesPerView;

    function slideStories() {
      index++;
      storiesContainer.style.transition = "transform 0.5s ease-in-out";
      storiesContainer.style.transform = `translateX(-${index * storyWidthPercent}%)`;

      if (index >= totalStories) {
        setTimeout(() => {
          storiesContainer.style.transition = "none";
          storiesContainer.style.transform = "translateX(0)";
          index = 0;
        }, 500);
      }
    }

    const carouselInterval = setInterval(slideStories, 3000);

    // Pause on hover
    const wrapper = document.querySelector(".top-stories-wrapper");
    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => clearInterval(carouselInterval));
      wrapper.addEventListener('mouseleave', () => setInterval(slideStories, 3000));
    }
  }

  // ==================== Full Article Page ====================

  /**
   * Render full article on article.html page
   * @param {Object} article - Article object with all details
   * @param {string} containerSelector - CSS selector for article container
   */
  renderFullArticle(article, containerSelector = '.article-container') {
    const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error('Article container not found');
      return;
    }

    const articleHTML = `
      <article class="article">
        <header class="article-header">
          <h1 class="article-title">${article.title}</h1>
          
          <div class="article-meta">
            <span class="article-date">${this.formatDate(article.publishedAt)}</span>
            <span class="article-author">${article.author || article.source?.name || 'Unknown Author'}</span>
            <span class="article-source">Source: ${article.source?.name || 'Unknown'}</span>
          </div>
        </header>

        <figure class="article-image">
          <img src="${article.image || article.urlToImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcHBsZSBHYXJhbW9uZCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}" />
          <figcaption>${article.title}</figcaption>
        </figure>

        <div class="article-content">
          <p class="article-description">${article.description || ''}</p>
          <p class="article-body">${article.content || 'Full content not available.'}</p>
        </div>

        <footer class="article-footer">
  <a href="article.html?id=${id}" class="read-more-btn">
    Continue reading on ${article.source?.name}
  </a>
  <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="read-more-btn external">
    Read original article →
  </a>
</footer>

        ${article.videoId ? this.renderVideoEmbed(article.videoId) : ''}
      </article>
    `;

    container.innerHTML = articleHTML;
  }

  /**
   * Render YouTube video embed
   * @param {string} videoId - YouTube video ID
   */
  renderVideoEmbed(videoId) {
    return `
      <section class="article-video">
        <h3>Related Video</h3>
        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </section>
    `;
  }

  // ==================== Editor's Picks ====================

  /**
   * Render editor's picks section
   * @param {Array} articles - Array of featured article objects
   * @param {string} containerSelector - CSS selector for picks container
   */
  renderEditorsPicks(articles, containerSelector = '.third-section') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    articles.slice(0, 3).forEach((article, index) => {
      const pickDiv = document.createElement('div');
      const isEven = index % 2 === 0;
      const commentClass = `comment-${index + 1}`;
      const captionClass = `editor-pick-caption-${index + 1}`;

      const html = `
        ${!isEven ? `
          <p class="${commentClass}">
            "${article.description?.substring(0, 100)}..."
            <br>
            <span class="comment-author-${index + 1}">— by Featured Editor</span>
          </p>
        ` : ''}

        <div class="editors-pick-${index + 1}">
          <img src="${article.image || article.urlToImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcHBsZSBHYXJhbW9uZCIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}">
            ${this.truncateText(article.title, 50)}
          </a>
        </div>

        ${isEven ? `
          <p class="${commentClass}">
            "${article.description?.substring(0, 100)}..."
            <br>
            <span class="comment-author-${index + 1}">— by Featured Editor</span>
          </p>
        ` : ''}
      `;

      pickDiv.innerHTML = html;
      container.appendChild(pickDiv);
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Truncate text to specified length with ellipsis
   */
  truncateText(text, length = 100) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }

  /**
   * Format date to readable format
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Create hash/ID from URL for article routing
   * Alternative: Use article URL directly
   */
  hashUrl(url) {
    return btoa(url).replace(/=/g, '').substring(0, 12);
  }

  /**
   * Decode hash back to URL
   */
  decodeHash(hash) {
    try {
      return atob(hash + '==');
    } catch {
      return null;
    }
  }

  /**
   * Update page title and meta description
   */
  updatePageMeta(title, description) {
    document.title = title + ' - The Financial Frontier';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIRenderer;
}