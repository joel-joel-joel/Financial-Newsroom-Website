/**
 * article.js - Article Page Handler
 * Loads and displays individual article pages with related content
 */

// Global instances
let apiService = null;
let uiRenderer = null;
let currentArticle = null;

/**
 * Initialize article page
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 Article page initializing...');

  try {
    // Initialize services
    apiService = new APIService(API_CONFIG);
    uiRenderer = new UIRenderer();

    // Display current date
    displayCurrentDate();

    // Get article ID from URL
    const articleId = getArticleIdFromURL();
    
    if (!articleId) {
      throw new Error('No article ID provided');
    }

    // Load and display article
    await loadArticle(articleId);

    // Load related articles
    await loadRelatedArticles();

    console.log('✅ Article page loaded successfully');

  } catch (error) {
    console.error('❌ Article page error:', error);
    const container = document.querySelector('.article-container') || document.body;
    uiRenderer.showError(container, error.message || 'Failed to load article');
  }
});

/**
 * Get article ID from URL parameter
 */
function getArticleIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  console.log('Article ID from URL:', id);
  return id;
}

/**
 * Load and display article
 */
async function loadArticle(articleId) {
  const container = document.querySelector('.article-container');
  
  try {
    console.log(`🔍 Loading article: ${articleId}`);
    
    // Show loading state
    if (container) {
      uiRenderer.showLoading(container);
    }

    // Try to load from cache first
    let article = loadArticleFromCache(articleId);

    // If not in cache, fetch from API
    if (!article) {
      console.log('Article not in cache, fetching from API...');
      article = await fetchArticleFromAPI(articleId);
      
      if (!article) {
        throw new Error('Article not found');
      }
      
      // Store in cache for future use
      cacheArticle(articleId, article);
    } else {
      console.log('✓ Article loaded from cache');
    }

    // Enrich article with additional data
    currentArticle = await apiService.getEnrichedArticle(article, true);

    // Render the article
    uiRenderer.renderFullArticle(currentArticle);

    // Update page meta tags
    uiRenderer.updatePageMeta(currentArticle.title, currentArticle.description);

    console.log('✓ Article rendered successfully');

  } catch (error) {
    console.error('Error loading article:', error);
    
    if (container) {
      uiRenderer.showError(
        container,
        'Unable to load article. Please try again or return to homepage.'
      );
    }
    
    throw error;
  }
}

/**
 * Load article from sessionStorage cache
 */
function loadArticleFromCache(articleId) {
  try {
    const cached = sessionStorage.getItem(`art_${articleId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Error reading from cache:', error);
  }
  return null;
}

/**
 * Store article in sessionStorage cache
 */
function cacheArticle(articleId, article) {
  try {
    sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));
    console.log('💾 Article cached');
  } catch (error) {
    console.warn('Error caching article:', error);
  }
}

/**
 * Fetch article from API
 * Since we can't get articles by ID directly from NewsAPI,
 * we search for recent articles and try to match
 */
async function fetchArticleFromAPI(articleId) {
  try {
    console.log('Fetching article from API...');
    
    // Try a general business/finance search
    const results = await apiService.searchArticles('finance business', 50, 1);
    
    if (results.articles && results.articles.length > 0) {
      // For demo purposes, return first relevant article
      // In production, you'd match by a proper identifier
      console.log(`Found ${results.articles.length} articles`);
      return results.articles[0];
    }

    return null;
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}

/**
 * Load and display related articles
 */
async function loadRelatedArticles() {
  try {
    if (!currentArticle) {
      console.warn('No current article to find related content');
      return;
    }

    console.log('🔗 Loading related articles...');

    // Extract topic from current article
    const topic = apiService.extractMainTopic(currentArticle.title);
    console.log('Searching related articles for topic:', topic);

    // Search for related articles
    const results = await apiService.searchArticles(topic, 6, 1);

    if (results.articles && results.articles.length > 0) {
      // Filter out current article and enrich the rest
      const relatedArticles = results.articles
        .filter(article => article.url !== currentArticle.url)
        .slice(0, 3);

      const enriched = await Promise.all(
        relatedArticles.map(article => apiService.getEnrichedArticle(article))
      );

      // Render related articles
      uiRenderer.renderRelatedArticles(enriched);
      
      console.log(`✓ Loaded ${enriched.length} related articles`);
    } else {
      console.log('No related articles found');
    }

  } catch (error) {
    console.error('Error loading related articles:', error);
    // Don't throw - related articles are not critical
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
 * Navigate back to previous page or homepage
 */
function goBack() {
  if (document.referrer && 
      (document.referrer.includes('index.html') || 
       document.referrer.includes(window.location.hostname))) {
    window.history.back();
  } else {
    window.location.href = 'index.html';
  }
}

// Make goBack available globally for back button
window.goBack = goBack;