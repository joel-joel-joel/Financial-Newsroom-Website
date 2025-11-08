/**
 * UIRenderer Class
 * Handles all DOM manipulation and rendering
 */
class UIRenderer {
  constructor() {
    this.loadingHTML = `
      <div style="display: flex; justify-content: center; align-items: center; padding: 40px;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid crimson; 
                    border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;">
        </div>
      </div>
    `;
  }

  /**
   * Render news ticker with headlines
   */
  renderNewsTicker(headlines) {
    const tickerContent = document.getElementById('ticker-content');
    if (!tickerContent || !headlines || headlines.length === 0) return;

    const tickerText = headlines
      .map(article => article.title)
      .join(' • ');

    tickerContent.textContent = tickerText;
  }

  /**
   * Render trending section with articles
   */
  renderTrendingSection(articles) {
    const trendingList = document.querySelector('.trending-list');
    if (!trendingList || !articles || articles.length === 0) return;

    trendingList.innerHTML = articles.slice(0, 5).map(article => {
      const articleId = btoa(article.url).slice(0, 12).replace(/\//g, '-');
      // Store article data for article page
      sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));
      return `
        <li>
          <img src="${article.image || article.urlToImage || 'https://via.placeholder.com/100'}" 
               alt="${article.title}" 
               class="trend-img">
          <a href="article.html?id=${articleId}">${article.title}</a>
        </li>
      `;
    }).join('');
  }

  /**
   * Render top stories carousel
   */
  renderTopStories(articles) {
    const storiesContainer = document.querySelector('.top-stories');
    if (!storiesContainer || !articles || articles.length === 0) return;

    storiesContainer.innerHTML = articles.map(article => {
      const articleId = btoa(article.url).slice(0, 12).replace(/\//g, '-');
      return `
        <div class="story">
          <img src="${article.image || article.urlToImage || 'https://via.placeholder.com/640x400'}" 
               alt="${article.title}" 
               class="story-img">
          <a href="article.html?id=${articleId}">${article.title}</a>
        </div>
      `;
    }).join('');
  }

  /**
   * Render Editor's Picks section from API data
   * This matches your existing CSS structure exactly
   */
  renderEditorsPicksAPI(articles) {
    if (!articles || articles.length < 3) {
      console.warn('Need at least 3 articles for Editor\'s Picks');
      return;
    }

    // Pick 1 - comment below
    const pick1 = articles[0];
    const id1 = btoa(pick1.url).slice(0, 12).replace(/\//g, '-');
    const pick1Container = document.querySelector('.editors-pick-1');
    const pick1Link = pick1Container?.querySelector('.editor-pick-caption-1');
    const pick1Img = pick1Container?.querySelector('.editor-img');
    
    if (pick1Img) {
      pick1Img.src = pick1.image || pick1.urlToImage || 'https://via.placeholder.com/640x400';
      pick1Img.alt = pick1.title;
    }
    if (pick1Link) {
      pick1Link.textContent = pick1.title;
      pick1Link.href = `article.html?id=${id1}`;
      // Store article data for article page
      sessionStorage.setItem(`art_${id1}`, JSON.stringify(pick1));
    }

    // Pick 2 - comment above
    const pick2 = articles[1];
    const id2 = btoa(pick2.url).slice(0, 12).replace(/\//g, '-');
    const pick2Container = document.querySelector('.editors-pick-2');
    const pick2Link = pick2Container?.querySelector('.editor-pick-caption-2');
    const pick2Img = pick2Container?.querySelector('.editor-img');
    
    if (pick2Img) {
      pick2Img.src = pick2.image || pick2.urlToImage || 'https://via.placeholder.com/640x400';
      pick2Img.alt = pick2.title;
    }
    if (pick2Link) {
      pick2Link.textContent = pick2.title;
      pick2Link.href = `article.html?id=${id2}`;
      // Store article data for article page
      sessionStorage.setItem(`art_${id2}`, JSON.stringify(pick2));
    }

    // Pick 3 - comment below
    const pick3 = articles[2];
    const id3 = btoa(pick3.url).slice(0, 12).replace(/\//g, '-');
    const pick3Container = document.querySelector('.editors-pick-3');
    const pick3Link = pick3Container?.querySelector('.editor-pick-caption-3');
    const pick3Img = pick3Container?.querySelector('.editor-img');
    
    if (pick3Img) {
      pick3Img.src = pick3.image || pick3.urlToImage || 'https://via.placeholder.com/640x400';
      pick3Img.alt = pick3.title;
    }
    if (pick3Link) {
      pick3Link.textContent = pick3.title;
      pick3Link.href = `article.html?id=${id3}`;
      // Store article data for article page
      sessionStorage.setItem(`art_${id3}`, JSON.stringify(pick3));
    }

    console.log('✓ Editor\'s picks updated from API');
    console.log('Pick 1:', pick1.title);
    console.log('Pick 2:', pick2.title);
    console.log('Pick 3:', pick3.title);
  }

  /**
   * Render Editor's Picks (legacy method - keeping for compatibility)
   */
  renderEditorsPicks(articles) {
    // This method is kept for backward compatibility
    // The new renderEditorsPicksAPI should be used instead
    console.log('Using legacy renderEditorsPicks - consider using renderEditorsPicksAPI');
  }

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
        <div style="padding: 40px; text-align: center; color: crimson;">
          <h3>⚠️ ${message}</h3>
          <p>Please try refreshing the page or check back later.</p>
        </div>
      `;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Generate article card HTML
   */
  generateArticleCard(article, size = 'medium') {
    const articleId = btoa(article.url).slice(0, 12).replace(/\//g, '-');
    const imageUrl = article.image || article.urlToImage || 'https://via.placeholder.com/640x400';
    
    return `
      <div class="article-card ${size}">
        <img src="${imageUrl}" alt="${article.title}">
        <div class="article-content">
          <h3><a href="article.html?id=${articleId}">${article.title}</a></h3>
          <p class="article-description">${this.truncateText(article.description, 150)}</p>
          <p class="article-meta">
            <span class="author">${article.author || 'Staff Writer'}</span>
            <span class="date">${this.formatDate(article.publishedAt)}</span>
          </p>
        </div>
      </div>
    `;
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

// Make UIRenderer available globally
if (typeof window !== 'undefined') {
  window.UIRenderer = UIRenderer;
}