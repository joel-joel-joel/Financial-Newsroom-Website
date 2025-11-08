// Global instances
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

  // Set up auto-refresh
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

    // Load all sections in parallel for faster loading
    const [heroData, picksData, headlinesData, trendingData, topStoriesData] = await Promise.all([
      apiService.searchArticles('global market crash', 1, 1),
      apiService.searchArticles('market analysis', 3, 1),
      apiService.getTopHeadlines('business', 15),
      apiService.searchArticles('stock market', 10, 1),
      apiService.searchArticles('finance technology', 15, 1)
    ]);

    // ----- Hero Article -----
    if (heroData.articles?.length) {
      const enrichedHero = await apiService.getEnrichedArticle(heroData.articles[0]);
      renderHeroArticle(enrichedHero);
      console.log('✓ Hero article loaded');
    }

    // ----- Editor's Picks (3 articles) -----
    if (picksData.articles?.length >= 3) {
      const enrichedPicks = await Promise.all(
        picksData.articles.slice(0, 3).map(a => apiService.getEnrichedArticle(a, false))
      );
      uiRenderer.renderEditorsPicksAPI(enrichedPicks);
    }

    // ----- News Ticker -----
    if (headlinesData?.length) {
      uiRenderer.renderNewsTicker(headlinesData);
    }

    // ----- Trending Section -----
    if (trendingData.articles?.length) {
      const enrichedTrending = await Promise.all(
        trendingData.articles.map(a => apiService.getEnrichedArticle(a))
      );
      uiRenderer.renderTrendingSection(enrichedTrending);
    }

    // ----- Top Stories Carousel -----
    if (topStoriesData.articles?.length) {
      const enrichedStories = await Promise.all(
        topStoriesData.articles.map(a => apiService.getEnrichedArticle(a, false))
      );
      uiRenderer.renderTopStories(enrichedStories);
    }

    console.log('✅ All homepage data loaded successfully');

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
  if (!box) {
    console.warn('⚠️ Hero article: .main-content container not found');
    return;
  }
  
  const id = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  sessionStorage.setItem(`art_${id}`, JSON.stringify(article));
  
  const imageUrl = article.image || article.urlToImage || 'https://via.placeholder.com/800x600';
  const author = article.author || 'Staff Writer';
  const source = article.source?.name || 'Staff';
  const description = article.description || '';
  
  box.innerHTML = `
    <img src="${imageUrl}" 
         alt="${article.title}" 
         class="main-img"
         onerror="this.src='https://via.placeholder.com/800x600'">
    <a href="article.html?id=${id}">${article.title}</a>
    <div class="text-container">
      <p class="author">${author}<br>Photographed by ${source}</p>
      <p class="description">${description}</p>
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
      console.warn('⚠️ Carousel: Stories container not found');
      return;
    }

    // Wait a bit for DOM to fully render
    await new Promise(resolve => setTimeout(resolve, 100));

    const stories = Array.from(document.querySelectorAll(".story"));
    const storiesPerView = 5;
    const totalStories = stories.length;

    if (totalStories === 0) {
      console.warn('⚠️ Carousel: No stories found');
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
      wrapper.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
      });

      wrapper.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(slideStories, 3000);
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
 */
function navigateToArticle(article) {
  const hash = btoa(article.url).slice(0, 12).replace(/\//g, '-');
  sessionStorage.setItem(`art_${hash}`, JSON.stringify(article));
  location.href = `article.html?id=${hash}`;
}

/**
 * Global function to search articles
 */
async function searchArticles(query) {
  if (!query?.trim()) {
    alert('Please enter a search term');
    return;
  }

  try {
    const container = document.querySelector('.main-container');
    uiRenderer.showLoading(container);

    const results = await apiService.searchArticles(query, 20, 1);
    
    if (results.articles?.length) {
      const enriched = await Promise.all(
        results.articles.map(article => apiService.getEnrichedArticle(article))
      );
      uiRenderer.renderTopStories(enriched);
      console.log(`✓ Search: ${enriched.length} articles found for "${query}"`);
    } else {
      uiRenderer.showError(container, `No articles found for "${query}"`);
    }
  } catch (error) {
    console.error('❌ Search error:', error);
    uiRenderer.showError(
      document.querySelector('.main-container'),
      'Search failed. Please try again.'
    );
  }
}

/**
 * Global error handler
 */
function handleAPIError(error, context = 'API') {
  console.error(`${context} Error:`, error);

  if (API_CONFIG?.app?.enableLogging) {
    console.error(`[${new Date().toISOString()}] ${context}: ${error.message}`);
  }

  const message = error.message?.includes('API') 
    ? 'API Error - Please check your configuration' 
    : 'An error occurred. Please try again.';

  return message;
}