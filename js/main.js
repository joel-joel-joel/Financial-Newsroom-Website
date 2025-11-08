// Global instances (will be initialized on page load)
let apiService = null;
let uiRenderer = null;

/**
 * Initialize application on DOM ready
 */
document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Financial Frontier initializing...');

  // Create service instances
  apiService = new APIService(API_CONFIG);
  uiRenderer = new UIRenderer();

  // Display current date
  displayCurrentDate();

  // Load homepage data
  await loadHomepageData();

  // Initialize carousel
  await initializeCarousel();

  // Set up auto-refresh (optional)
  setUpAutoRefresh();

  console.log('✅ Application fully loaded');
});

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
 * Load all homepage data from APIs
 */
async function loadHomepageData() {
  try {
    console.log('📰 Loading homepage data...');

    // ----- Hero Article -----
    const hero = await apiService.searchArticles('global market crash', 1, 1);
    if (hero.articles?.length) {
      const [enriched] = await Promise.all(
        hero.articles.map(a => apiService.getEnrichedArticle(a))
      );
      renderHeroArticle(enriched);
      console.log('✓ Hero article loaded');
    }

    // ----- Editor's Picks (3 articles) -----
    const picks = await apiService.searchArticles('market analysis', 3, 1);
    if (picks.articles && picks.articles.length >= 3) {
      const enriched = await Promise.all(
        picks.articles.map(a => apiService.getEnrichedArticle(a, false))
      );
      uiRenderer.renderEditorsPicksAPI(enriched);
      console.log('✓ Editor's picks loaded from API');
    }

    // ----- News Ticker -----
    const headlines = await apiService.getTopHeadlines('business', 15);
    if (headlines.length > 0) {
      uiRenderer.renderNewsTicker(headlines);
      console.log(`✓ News ticker updated with ${headlines.length} headlines`);
    }

    // ----- Trending Section -----
    const trendingArticles = await apiService.searchArticles('stock market', 10, 1);
    if (trendingArticles.articles && trendingArticles.articles.length > 0) {
      const enrichedTrending = await Promise.all(
        trendingArticles.articles.map(article => apiService.getEnrichedArticle(article))
      );
      uiRenderer.renderTrendingSection(enrichedTrending);
      console.log(`✓ Trending section updated with ${enrichedTrending.length} articles`);
    }

    // ----- Top Stories Carousel -----
    const topStories = await apiService.searchArticles('finance technology', 15, 1);
    if (topStories.articles && topStories.articles.length > 0) {
      const enrichedStories = await Promise.all(
        topStories.articles.map(article => apiService.getEnrichedArticle(article, false))
      );
      uiRenderer.renderTopStories(enrichedStories);
      console.log(`✓ Top stories loaded: ${enrichedStories.length} articles`);
    }

  } catch (error) {
    console.error('❌ Error loading homepage data:', error);
    uiRenderer.showError(
      document.querySelector('.main-container'),
      'Unable to load news. Please check your API configuration.'
    );
  }
}

/**
 * Render the hero article at the top of the page
 */
function renderHeroArticle(article) {
  const box = document.querySelector('.main-content');
  if (!box) return;
  
  const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  
  // Store article data for article page
  sessionStorage.setItem(`art_${id}`, JSON.stringify(article));
  
  box.innerHTML = `
    <img src="${article.image || article.urlToImage}" alt="${article.title}" class="main-img">
    <a href="article.html?id=${id}">${article.title}</a>
    <div class="text-container">
      <p class="author">${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}</p>
      <p class="description">${article.description || ''}</p>
    </div>
  `;
}

/**
 * Initialize carousel with infinite scroll
 */
async function initializeCarousel() {
  try {
    const storiesContainer = document.querySelector(".top-stories");

    if (!storiesContainer) {
      console.warn('⚠️  Stories container not found');
      return;
    }

    const stories = Array.from(document.querySelectorAll(".story"));
    const storiesPerView = 5;
    const totalStories = stories.length;

    if (totalStories === 0) {
      console.warn('⚠️  No stories to carousel');
      return;
    }

    console.log(`🎠 Initializing carousel with ${totalStories} stories`);

    // Duplicate stories for infinite scroll effect
    stories.forEach(story => {
      const clone = story.cloneNode(true);
      storiesContainer.appendChild(clone);
    });

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

    // Start carousel
    let carouselInterval = setInterval(slideStories, 3000);
    console.log('✓ Carousel started');

    // Pause/resume on hover
    const wrapper = document.querySelector(".top-stories-wrapper");
    if (wrapper) {
      wrapper.addEventListener('mouseenter', function() {
        clearInterval(carouselInterval);
        console.log('⏸️  Carousel paused');
      });

      wrapper.addEventListener('mouseleave', function() {
        carouselInterval = setInterval(slideStories, 3000);
        console.log('▶️  Carousel resumed');
      });
    }

  } catch (error) {
    console.error('❌ Error initializing carousel:', error);
  }
}

/**
 * Auto-refresh data every 10 minutes
 */
function setUpAutoRefresh() {
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  setInterval(() => {
    console.log('🔄 Auto-refreshing data...');
    apiService.clearCache();
    loadHomepageData();
  }, REFRESH_INTERVAL);

  console.log('✓ Auto-refresh enabled (10 minutes)');
}

/**
 * Global function to navigate to article
 * Called from article links
 */
function navigateToArticle(article) {
  const hash = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  sessionStorage.setItem(`art_${hash}`, JSON.stringify(article));
  location.href = `article.html?id=${hash}`;
}

/**
 * Global function to search articles
 * Can be called from search form
 */
async function searchArticles(query) {
  if (!query || query.trim().length === 0) {
    alert('Please enter a search term');
    return;
  }

  try {
    uiRenderer.showLoading(document.querySelector('.main-container'));

    const results = await apiService.searchArticles(query, 20, 1);
    if (results.articles && results.articles.length > 0) {
      const enriched = await Promise.all(
        results.articles.map(article => apiService.getEnrichedArticle(article))
      );
      uiRenderer.renderTopStories(enriched);
      console.log(`✓ Search results: ${enriched.length} articles found`);
    } else {
      uiRenderer.showError(
        document.querySelector('.main-container'),
        `No articles found for "${query}"`
      );
    }
  } catch (error) {
    console.error('Search error:', error);
    uiRenderer.showError(
      document.querySelector('.main-container'),
      'Search failed. Please try again.'
    );
  }
}

/**
 * Global function to handle errors gracefully
 */
function handleAPIError(error, context = 'API') {
  console.error(`${context} Error:`, error);

  if (API_CONFIG.app.enableLogging) {
    // Could send to error tracking service
    console.error(`[${new Date().toISOString()}] ${context}: ${error.message}`);
  }

  // Optionally show user-friendly message
  const message = error.message?.includes('API') 
    ? 'API Error - Please check your configuration' 
    : 'An error occurred. Please try again.';

  return message;
}