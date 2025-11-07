/**
 * article.js
 * Handles article.html page functionality
 * Dynamically loads article content based on URL parameter
 * Features: URL parameter parsing, related articles, sharing
 */

/* article.js – replace top-level query with: */
let articleContainer; // global


/**
 * Initialize article page on load
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 Article page initializing...');

  // Initialize services
  apiService = new APIService(API_CONFIG);
  uiRenderer = new UIRenderer();

  // Display current date
  displayCurrentDate();

  // Get article ID from URL parameter
  const articleId = getArticleIdFromURL();

  if (!articleId) {
    uiRenderer.showError(
      document.querySelector('.article-container') || document.body,
      'No article ID provided. Please go back to the homepage.'
    );
    return;
  }

  // Load and display the article
  await loadArticle(articleId);

  // Load related articles
  await loadRelatedArticles();

  console.log('✅ Article page loaded');
});

/**
 * Extract article ID from URL query parameter
 * URL format: article.html?id=articleId
 * @returns {string|null} Article ID or null
 */
function getArticleIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || null;
}

/**
 * Load article by ID and display it
 * @param {string} articleId - Article identifier
 */
async function loadArticle(articleId) {
  try {
    console.log(`🔍 Loading article: ${articleId}`);

    // Show loading state
    uiRenderer.showLoading(
      document.querySelector('.article-container') || document.body
    );

    // Try to load from cache first (stored in sessionStorage)
    let article = loadArticleFromCache(articleId);

    if (!article) {
      // If not in cache, fetch from API
      article = await fetchArticleFromAPI(articleId);

      if (!article) {
        throw new Error('Article not found');
      }

      // Store in cache
      cacheArticle(articleId, article);
    }

    // Enrich article with additional data (video, etc.)
    currentArticle = await apiService.getEnrichedArticle(article, true);

    // Render the article
    uiRenderer.renderFullArticle(currentArticle);

    // Update page meta
    uiRenderer.updatePageMeta(
      currentArticle.title,
      currentArticle.description
    );

    // Set up interactions
    setUpArticleInteractions();

    console.log('✓ Article loaded successfully');

  } catch (error) {
    console.error('❌ Error loading article:', error);
    uiRenderer.showError(
      document.querySelector('.article-container') || document.body,
      'Failed to load article. Please try again or return to homepage.'
    );
  }
}

/**
 * Try to load article from cache (sessionStorage)
 * @param {string} articleId - Article identifier
 * @returns {Object|null} Cached article or null
 */
function loadArticleFromCache(articleId) {
  try {
    const cached = sessionStorage.getItem(`article_${articleId}`);
    if (cached) {
      console.log('📦 Loading article from cache');
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('⚠️  Error reading cache:', error);
  }
  return null;
}

/**
 * Store article in cache (sessionStorage)
 * @param {string} articleId - Article identifier
 * @param {Object} article - Article object to cache
 */
function cacheArticle(articleId, article) {
  try {
    sessionStorage.setItem(`article_${articleId}`, JSON.stringify(article));
    console.log('💾 Article cached');
  } catch (error) {
    console.warn('⚠️  Error caching article:', error);
  }
}

/**
 * Fetch article from API by searching for it
 * Since NewsAPI doesn't provide direct article retrieval,
 * we search for articles matching the ID
 * @param {string} articleId - Article identifier
 * @returns {Promise<Object|null>} Article object or null
 */
async function fetchArticleFromAPI(articleId) {
  try {
    // If articleId is a URL hash, decode it
    let searchTerm = articleId;
    if (articleId.length < 20) {
      // Likely a hash, use a generic search
      searchTerm = 'finance';
    }

    // Try to search for article
    const results = await apiService.searchArticles(searchTerm, 50, 1);

    if (results.articles && results.articles.length > 0) {
      // For demo purposes, return first article
      // In production, match by URL hash or specific identifier
      return results.articles[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
}

/**
 * Load and display related articles
 */
async function loadRelatedArticles() {
  try {
    if (!currentArticle) return;

    console.log('🔗 Loading related articles...');

    // Extract topic from current article
    const topic = apiService.extractMainTopic(currentArticle.title);

    // Search for related articles
    const relatedResults = await apiService.searchArticles(topic, 5, 1);

    if (relatedResults.articles && relatedResults.articles.length > 0) {
      // Enrich articles
      const enriched = await Promise.all(
        relatedResults.articles
          .filter(article => article.url !== currentArticle.url) // Exclude current article
          .slice(0, 3)
          .map(article => apiService.getEnrichedArticle(article))
      );

      renderRelatedArticles(enriched);
      console.log(`✓ Loaded ${enriched.length} related articles`);
    }

  } catch (error) {
    console.error('Error loading related articles:', error);
  }
}

/**
 * Render related articles section
 * @param {Array} articles - Array of related article objects
 */
function renderRelatedArticles(articles) {
  // Create related articles section
  const container = document.querySelector('.article-container');
  if (!container) return;

  const relatedSection = document.createElement('section');
  relatedSection.className = 'related-articles';
  relatedSection.innerHTML = '<h3>Related Articles</h3><div class="related-articles-grid"></div>';

  const grid = relatedSection.querySelector('.related-articles-grid');

  articles.forEach(article => {
    const articleCard = document.createElement('div');
    articleCard.className = 'related-article-card';
    articleCard.innerHTML = `
      <img src="${article.image || article.urlToImage}" alt="${article.title}" />
      <h4><a href="article.html?id=${uiRenderer.hashUrl(article.url)}">${article.title}</a></h4>
      <p>${article.description?.substring(0, 100)}...</p>
      <small>${uiRenderer.formatDate(article.publishedAt)}</small>
    `;
    grid.appendChild(articleCard);
  });

  container.appendChild(relatedSection);
}

/**
 * Set up article interactions (sharing, etc.)
 */
function setUpArticleInteractions() {
  if (!currentArticle) return;

  // Share functionality
  const shareButtons = document.querySelectorAll('[data-share-action]');
  shareButtons.forEach(button => {
    button.addEventListener('click', function() {
      const action = this.getAttribute('data-share-action');
      shareArticle(action);
    });
  });

  // Print functionality
  const printBtn = document.querySelector('[data-action="print"]');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }
}

/**
 * Share article to social media or copy link
 * @param {string} platform - Platform to share to (twitter, facebook, copy, etc.)
 */
function shareArticle(platform) {
  const url = window.location.href;
  const title = currentArticle.title;
  const text = `${title} - The Financial Frontier`;

  switch(platform) {
    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        'twitter-share',
        'width=550,height=235'
      );
      break;

    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        'facebook-share',
        'width=550,height=235'
      );
      break;

    case 'linkedin':
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        'linkedin-share',
        'width=550,height=235'
      );
      break;

    case 'copy':
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
      break;

    case 'email':
      window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
      break;

    default:
      console.warn(`Unknown share platform: ${platform}`);
  }
}

/**
 * Display current date in header
 */
function displayCurrentDate() {
  const dateElement = document.querySelector(".date");
  if (dateElement) {
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = today.toLocaleDateString('en-US', options);
  }
}

/**
 * Go back to homepage or previous page
 */
function goBack() {
  if (document.referrer.includes('index.html') || document.referrer.includes(window.location.hostname)) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}

/* article.js – inside loadArticle */
let article = JSON.parse(sessionStorage.getItem(`art_${articleId}`));
if (!article) article = await fetchArticleFromAPI(articleId);
