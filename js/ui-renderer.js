/**
 * ui-renderer.js - Complete UI Rendering System
 * Handles all DOM manipulation and content rendering
 */

class UIRenderer {
  constructor() {
    this.loadingHTML = `
      <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid crimson; 
                    border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;">
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }

  /* ========== NEWS TICKER ========== */

  /**
   * Render scrolling news ticker
   */
  renderNewsTicker(headlines) {
    const tickerContent = document.getElementById('ticker-content');
    if (!tickerContent || !headlines || headlines.length === 0) {
      console.warn('⚠️ Ticker element not found or no headlines');
      return;
    }

    const tickerText = headlines
      .map(article => article.title)
      .join(' | ');

    tickerContent.textContent = tickerText;
    console.log(`✓ Ticker updated with ${headlines.length} headlines`);
  }

  /* ========== TRENDING SECTION ========== */

  /**
   * Render trending articles sidebar
   */
  renderTrendingSection(articles) {
    const trendingList = document.querySelector('.trending-list');
    if (!trendingList) {
      console.warn('⚠️ Trending list element not found');
      return;
    }

    if (!articles || articles.length === 0) {
      trendingList.innerHTML = '<li>No trending articles available</li>';
      return;
    }

    trendingList.innerHTML = articles.slice(0, 5).map(article => {
      const articleId = article.id || this._generateArticleId(article);
      this._storeArticle(articleId, article);
      
      return `
        <li>
          <img src="${article.image || article.urlToImage || this._getFallbackImage()}" 
               alt="${this._escapeHtml(article.title)}" 
               class="trend-img"
               onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100'">
          <a href="article.html?id=${articleId}">${this._escapeHtml(article.title)}</a>
        </li>
      `;
    }).join('');

    console.log(`✓ Rendered ${articles.length} trending articles`);
  }

  /* ========== TOP STORIES CAROUSEL ========== */

  /**
   * Render top stories carousel
   */
  renderTopStories(articles) {
    const storiesContainer = document.querySelector('.top-stories');
    if (!storiesContainer) {
      console.warn('⚠️ Top stories container not found');
      return;
    }

    if (!articles || articles.length === 0) {
      storiesContainer.innerHTML = '<div class="story">No stories available</div>';
      return;
    }

    storiesContainer.innerHTML = articles.map(article => {
      const articleId = article.id || this._generateArticleId(article);
      this._storeArticle(articleId, article);
      
      return `
        <div class="story">
          <img src="${article.image || article.urlToImage || this._getFallbackImage()}" 
               alt="${this._escapeHtml(article.title)}" 
               class="story-img"
               loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640'">
          <a href="article.html?id=${articleId}">${this._escapeHtml(article.title)}</a>
        </div>
      `;
    }).join('');

    console.log(`✓ Rendered ${articles.length} top stories`);
  }

  /* ========== EDITOR'S PICKS ========== */

  /**
   * Render Editor's Picks section (3 articles with images and captions)
   */
  renderEditorsPicksAPI(articles) {
    if (!articles || articles.length < 3) {
      console.warn('⚠️ Need at least 3 articles for Editor\'s Picks');
      return;
    }

    // Pick 1
    this._renderEditorPick(articles[0], '.editors-pick-1', '.editor-pick-caption-1');
    
    // Pick 2
    this._renderEditorPick(articles[1], '.editors-pick-2', '.editor-pick-caption-2');
    
    // Pick 3
    this._renderEditorPick(articles[2], '.editors-pick-3', '.editor-pick-caption-3');

    console.log('✓ Editor\'s picks updated');
  }

  /**
   * Helper to render single editor pick
   */
  _renderEditorPick(article, containerSelector, linkSelector) {
    const container = document.querySelector(containerSelector);
    const link = document.querySelector(linkSelector);
    const img = container?.querySelector('.editor-img');
    
    if (!container || !link || !img) {
      console.warn(`⚠️ Editor pick elements not found: ${containerSelector}`);
      return;
    }

    const articleId = article.id || this._generateArticleId(article);
    this._storeArticle(articleId, article);

    img.src = article.image || article.urlToImage || this._getFallbackImage();
    img.alt = article.title;
    img.onerror = () => {
      img.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=640';
    };

    link.textContent = article.title;
    link.href = `article.html?id=${articleId}`;
  }

  /* ========== HERO ARTICLE ========== */

  /**
   * Render main hero article
   */
  renderHeroArticle(article) {
    const heroContainer = document.querySelector('.main-content');
    if (!heroContainer) {
      console.warn('⚠️ Hero container not found');
      return;
    }

    const articleId = article.id || this._generateArticleId(article);
    this._storeArticle(articleId, article);

    heroContainer.innerHTML = `
      <img src="${article.image || article.urlToImage || this._getFallbackImage()}" 
           alt="${this._escapeHtml(article.title)}" 
           class="main-img"
           onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'">
      <a href="article.html?id=${articleId}">${this._escapeHtml(article.title)}</a>
      <div class="text-container">
        <p class="author">
          ${this._escapeHtml(article.author || 'Staff Writer')}<br>
          ${this._escapeHtml(article.source?.name || 'The Financial Frontier')}
        </p>
        <p class="description">
          ${this._escapeHtml(article.description || '')}
        </p>
      </div>
    `;

    console.log('✓ Hero article rendered');
  }

  /* ========== FULL ARTICLE PAGE ========== */

  /**
   * Render complete article page
   */
  renderFullArticle(article) {
    // Update title
    const titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = article.title;

    // Update meta information
    const authorEl = document.getElementById('article-author');
    if (authorEl) authorEl.textContent = article.author || 'Staff Writer';

    const dateEl = document.getElementById('article-date');
    if (dateEl) dateEl.textContent = this.formatDate(article.publishedAt);

    const sourceEl = document.getElementById('article-source');
    if (sourceEl) sourceEl.textContent = article.source?.name || 'The Financial Frontier';

    // Update excerpt
    const excerptEl = document.getElementById('article-excerpt');
    if (excerptEl) excerptEl.textContent = article.description || '';

    // Update image
    const imageEl = document.getElementById('article-image');
    if (imageEl) {
      imageEl.src = article.image || article.urlToImage || this._getFallbackImage();
      imageEl.alt = article.title;
      imageEl.onerror = () => {
        imageEl.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
      };
    }

    // Update image caption
    const captionEl = document.getElementById('image-caption');
    if (captionEl) {
      captionEl.textContent = article.source?.name 
        ? `Image source: ${article.source.name}` 
        : '';
    }

    // Render article body
    this._renderArticleBody(article);

    // Set up share buttons
    this._setupShareButtons(article);

    console.log('✓ Full article rendered');
  }

  /**
   * Render article body content
   */
  _renderArticleBody(article) {
    const bodyEl = document.getElementById('article-body');
    if (!bodyEl) return;

    // Generate article content from available data
    let content = '';

    if (article.content) {
      // Remove NewsAPI's character limit marker
      content = article.content.replace(/\[\+\d+ chars\]$/, '');
      content = this._formatArticleContent(content);
    } else if (article.description) {
      content = `<p>${this._escapeHtml(article.description)}</p>`;
    } else {
      content = '<p>Full article content is available at the source.</p>';
    }

    // Add read more link
    if (article.url && article.url !== '#') {
      content += `
        <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Read the full article at source:</p>
          <a href="${article.url}" 
             target="_blank" 
             rel="noopener noreferrer"
             style="color: crimson; text-decoration: none; font-size: 16px;">
            ${article.source?.name || 'View Original Article'} →
          </a>
        </div>
      `;
    }

    // Add video if available
    if (article.videoId) {
      content += `
        <div style="margin-top: 30px;">
          <h3>Related Video</h3>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <iframe 
              src="https://www.youtube.com/embed/${article.videoId}" 
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </div>
      `;
    }

    bodyEl.innerHTML = content;
  }

  /**
   * Format article content with proper paragraphs
   */
  _formatArticleContent(content) {
    if (!content) return '';
    
    // Split into paragraphs and wrap each in <p> tags
    return content
      .split(/\n\n+/)
      .filter(para => para.trim().length > 0)
      .map(para => `<p>${this._escapeHtml(para.trim())}</p>`)
      .join('\n');
  }

  /**
   * Set up article share buttons
   */
  _setupShareButtons(article) {
    const shareButtons = document.querySelectorAll('[data-share]');
    const articleUrl = window.location.href;
    const articleTitle = article.title;

    shareButtons.forEach(button => {
      const platform = button.getAttribute('data-share');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this._shareArticle(platform, articleUrl, articleTitle);
      });
    });
  }

  /**
   * Handle article sharing
   */
  _shareArticle(platform, url, title) {
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  }

  /* ========== RELATED ARTICLES ========== */

  /**
   * Render related articles grid
   */
  renderRelatedArticles(articles) {
    const relatedGrid = document.getElementById('related-grid');
    if (!relatedGrid) return;

    if (!articles || articles.length === 0) {
      relatedGrid.innerHTML = '<p>No related articles found</p>';
      return;
    }

    relatedGrid.innerHTML = articles.slice(0, 3).map(article => {
      const articleId = article.id || this._generateArticleId(article);
      this._storeArticle(articleId, article);

      return `
        <a href="article.html?id=${articleId}" class="related-card">
          <img src="${article.image || article.urlToImage || this._getFallbackImage()}" 
               alt="${this._escapeHtml(article.title)}"
               class="related-card-image"
               loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'">
          <div class="related-card-content">
            <h4 class="related-card-title">${this._escapeHtml(article.title)}</h4>
            <p class="related-card-excerpt">${this._truncateText(article.description, 100)}</p>
            <span class="related-card-date">${this.formatDate(article.publishedAt)}</span>
          </div>
        </a>
      `;
    }).join('');

    console.log(`✓ Rendered ${articles.length} related articles`);
  }

  /* ========== UTILITY METHODS ========== */

  /**
   * Show loading indicator
   */
  showLoading(container) {
    if (container) {
      container.innerHTML = this.loadingHTML;
    }
  }

  /**
   * Show error message
   */
  showError(container, message) {
    if (container) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: crimson; max-width: 600px; margin: 0 auto;">
          <h3 style="margin-bottom: 10px;">⚠️ ${this._escapeHtml(message)}</h3>
          <p style="color: #666;">Please try refreshing the page or check back later.</p>
          <button onclick="window.location.reload()" 
                  style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Refresh Page
          </button>
        </div>
      `;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Date unknown';
    
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Date unknown';
    }
  }

  /**
   * Truncate text to specified length
   */
  _truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return this._escapeHtml(text);
    return this._escapeHtml(text.substring(0, maxLength).trim()) + '...';
  }

  /**
   * Escape HTML to prevent XSS
   */
  _escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate article ID from URL or title
   */
  _generateArticleId(article) {
    try {
      const source = article.url || article.title || Date.now().toString();
      return btoa(source)
        .slice(0, 16)
        .replace(/[/+=]/g, match => ({ '/': '-', '+': '_', '=': '' }[match] || ''));
    } catch {
      return 'article_' + Date.now();
    }
  }

  /**
   * Store article in sessionStorage for article page
   */
  _storeArticle(articleId, article) {
    try {
      sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));
    } catch (error) {
      console.warn('Failed to store article:', error);
    }
  }

  /**
   * Get fallback image
   */
  _getFallbackImage() {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
  }

  /**
   * Update page meta tags
   */
  updatePageMeta(title, description) {
    if (title) {
      document.title = `${title} - The Financial Frontier`;
      
      let metaTitle = document.querySelector('meta[property="og:title"]');
      if (!metaTitle) {
        metaTitle = document.createElement('meta');
        metaTitle.setAttribute('property', 'og:title');
        document.head.appendChild(metaTitle);
      }
      metaTitle.setAttribute('content', title);
    }

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }

  /**
   * Clear container content
   */
  clearContainer(container) {
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
}