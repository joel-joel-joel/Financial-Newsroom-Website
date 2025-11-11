// ===== Display Current Date on Page Load =====
document.addEventListener("DOMContentLoaded", function() {
    const dateElement = document.querySelector(".date");
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
});


/*
 * Pattern matches main.js: initialization, API calls, rendering, auto-refresh
 */

// Global instances (matching main.js style)
let apiService = null;
let uiRenderer = null;


/**
 * Initialize regional page on DOM ready (matching main.js pattern)
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Regional page initializing...');

    // Instantiate service and renderer objects (same as main.js)
    apiService = new APIService(API_CONFIG);
    uiRenderer = new UIRenderer();

    // Display current date (matching main.js behavior)
    displayCurrentDate();

    // Detect current region from URL
    const region = detectRegion();
    console.log(`📍 Detected region: ${region}`);

    // Load all regional data
    await loadRegionalData(region);

    // Set up auto-refresh (matches main.js pattern)
    setUpAutoRefresh(region);

    console.log('✅ Regional page fully loaded');
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
 * Detect region based on page URL
 */
function detectRegion() {
    const path = window.location.pathname;

    if (path.includes('australia')) return 'australia';
    if (path.includes('africa')) return 'africa';
    if (path.includes('americas')) return 'americas';
    if (path.includes('asia')) return 'asia';
    if (path.includes('europe')) return 'europe';
    if (path.includes('world')) return 'world';

    // Default region
    return 'world';
}


/**
 * Load all regional page data
 */
async function loadRegionalData(region) {
    try {
        console.log(`📰 Loading ${region} data...`);

        // Show loading state in main container
        const container = document.querySelector('.main-container');
        if (container) {
            uiRenderer.showLoading(container);
        }

        // Fetch regional news from API
        const regionalNews = await fetchRegionalNews(region, 20, 1);

        if (!regionalNews.success || !regionalNews.articles?.length) {
            throw new Error('No articles found for this region');
        }

        console.log(`✓ Retrieved ${regionalNews.articles.length} articles`);

        // Enrich articles with images and other metadata
        const enrichedArticles = await Promise.all(
            regionalNews.articles.map(article => apiService.getEnrichedArticle(article))
        );

        // Render page sections with enriched articles
        await renderRegionalSections(enrichedArticles, region);

        console.log('✅ All regional data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading regional data:', error);

        const container = document.querySelector('.main-container');
        if (container) {
            uiRenderer.showError(
                container,
                `Unable to load news for ${region}. Please check your connection.`
            );
        }
    }
}


/**
 * Fetch regional news from API
 */
async function fetchRegionalNews(region, pageSize = 20, page = 1) {
    try {
        const apiEndpoint = API_CONFIG.proxyUrl 
            ? '/api/regional-news'  // Production
            : '/api/regional-news'; // Development

        console.log(`📞 Calling regional API: ${apiEndpoint}`);

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ region, pageSize, page })
        });

        console.log(`📥 Response status: ${response.status}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`✓ API returned ${data.articles?.length || 0} articles`);

        return data;

    } catch (error) {
        console.error('❌ Regional API fetch error:', error);

        return { success: false, articles: [], error: error.message };
    }
}


/**
 * Render all regional page sections
 */
async function renderRegionalSections(articles, region) {
    try {
        // Split articles into sections
        const heroArticle = articles[0];
        const topStories = articles.slice(1, 4);
        const mainStories = articles.slice(4, 7);
        const sidebarArticles = articles.slice(7, 12);
        const moreStories = articles.slice(12);

        // ----- Hero/Main Story -----
        const mainStoryEl = document.querySelector('.main-story');
        if (mainStoryEl && heroArticle) {
            renderMainStory(heroArticle);
            console.log('✓ Main story rendered');
        }

        // ----- Top 3 Stories Grid -----
        const storyGrid = document.querySelector('.story-grid-1, .story-grid');
        if (storyGrid && topStories.length >= 2) {
            renderTopStoriesGrid(topStories.slice(0, 3));
            console.log('✓ Top stories grid rendered');
        }

        // ----- Secondary Stories Grid -----
        const storyGrid2 = document.querySelector('.story-grid-2');
        if (storyGrid2 && mainStories.length >= 2) {
            renderSecondaryGrid(mainStories.slice(0, 3));
            console.log('✓ Secondary grid rendered');
        }

        // ----- Regional Columns -----
        renderRegionalColumns(articles);

        // ----- Trending Articles Bar -----
        const articleWrapper = document.querySelector('.article-wrapper');
        if (articleWrapper && moreStories.length > 0) {
            renderArticlesList(moreStories.slice(0, 4));
            console.log('✓ Articles list rendered');
        }

    } catch (error) {
        console.error('❌ Error rendering sections:', error);
    }
}


/**
 * Render main/hero story
 */
function renderMainStory(article) {
    const mainStory = document.querySelector('.main-story');
    if (!mainStory) return;

    const articleId = article.id || apiService._generateArticleId(article);
    sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));

    const titleEl = mainStory.querySelector('.main-story-title');
    const imgEl = mainStory.querySelector('.main-img');
    const textEl = mainStory.querySelector('.main-story-text');
    const authorEl = mainStory.querySelector('.main-story-author');

    if (titleEl) titleEl.textContent = article.title;
    if (imgEl) {
        imgEl.src = article.image || article.urlToImage || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
        imgEl.alt = article.title;
        imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'; };
    }
    if (textEl) textEl.textContent = article.description || '';
    if (authorEl) {
        authorEl.innerHTML = `By ${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}`;
    }

    // Make entire card clickable
    mainStory.href = `article.html?id=${articleId}`;
}


/**
 * Render top stories grid (3 articles)
 */
function renderTopStoriesGrid(articles) {
    if (!articles || articles.length < 2) return;

    // Main story
    const mainStory = document.querySelector('.main-story');
    if (mainStory && articles[0]) renderMainStory(articles[0]);

    // Substory 1
    const substory1 = document.querySelector('.substory-1');
    if (substory1 && articles[1]) renderSubstory(substory1, articles[1]);

    // Substory 2
    const substory2 = document.querySelector('.substory-2');
    if (substory2 && articles[2]) renderSubstory(substory2, articles[2], true);
}


/**
 * Render secondary grid (story-grid-2)
 */
function renderSecondaryGrid(articles) {
    if (!articles || articles.length < 2) return;

    const substories = document.querySelectorAll(
        '.story-grid-2 .substory-1, .story-grid-2 .substory-2, .story-grid-2 .main-story'
    );

    articles.forEach((article, index) => {
        if (substories[index]) {
            renderSubstory(substories[index], article, substories[index].classList.contains('substory-2'));
        }
    });
}


/**
 * Render individual substory
 */
function renderSubstory(element, article, hasSpecialLayout = false) {
    const articleId = article.id || apiService._generateArticleId(article);
    sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));

    const titleEl = element.querySelector('.substory-title, .main-story-title');
    const textEl = element.querySelector('.substory-text, .main-story-text');
    const imgEl = element.querySelector('.main-img, .sub-img');
    const authorEl = element.querySelector('.substory-author, .substory-author-under, .main-story-author');

    if (titleEl) titleEl.textContent = article.title;
    if (textEl) textEl.textContent = article.description || '';
    if (imgEl) {
        imgEl.src = article.image || article.urlToImage || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400';
        imgEl.alt = article.title;
        imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'; };
    }
    if (authorEl) {
        authorEl.innerHTML = `By ${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}`;
    }

    element.href = `article.html?id=${articleId}`;
}


/**
 * Render regional columns (Africa, Americas, Asia, Europe)
 */
function renderRegionalColumns(articles) {
    const regions = ['africa', 'americas', 'asia', 'europe'];
    const articlesPerRegion = Math.ceil(articles.length / regions.length);

    regions.forEach((regionName, index) => {
        const columnEl = document.querySelector(`.${regionName}`);
        if (!columnEl) return;

        const regionArticles = articles
            .slice(index * articlesPerRegion, (index + 1) * articlesPerRegion)
            .slice(0, 4); // max 4 per column

        if (!regionArticles.length) return;

        // Main story in column
        const topStory = columnEl.querySelector('.topmost-story');
        if (topStory && regionArticles[0]) {
            const article = regionArticles[0];
            const articleId = article.id || apiService._generateArticleId(article);
            sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));

            const img = topStory.querySelector('.trend-img');
            const link = topStory.querySelector('.mainstory-title');

            if (img) {
                img.src = article.image || article.urlToImage || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400';
                img.alt = article.title;
                img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'; };
            }
            if (link) {
                link.textContent = article.title;
                link.href = `article.html?id=${articleId}`;
            }
        }

        // Remaining stories in column
        const otherStories = columnEl.querySelectorAll('.bottommost-story');
        regionArticles.slice(1).forEach((article, idx) => {
            if (!otherStories[idx]) return;

            const articleId = article.id || apiService._generateArticleId(article);
            sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));

            const link = otherStories[idx].querySelector('.story-title');
            if (link) {
                link.textContent = article.title;
                link.href = `article.html?id=${articleId}`;
            }
        });
    });

    console.log('✓ Regional columns rendered');
}


/**
 * Render trending articles list
 */
function renderArticlesList(articles) {
    const wrapper = document.querySelector('.article-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = articles.map(article => {
        const articleId = article.id || apiService._generateArticleId(article);
        sessionStorage.setItem(`art_${articleId}`, JSON.stringify(article));

        const date = new Date(article.publishedAt);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <a href="article.html?id=${articleId}" class="article">
                <img src="${article.image || article.urlToImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=140'}" 
                     alt="${article.title}" 
                     class="article-thumbnail"
                     onerror="this.src='https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=140'">
                <div class="article-text-block">
                    <p class="article-date">${dateStr}</p>
                    <h5 class="article-title">${article.title}</h5>
                    <p class="article-description">${article.description || ''}</p>
                    <p class="article-author">By ${article.author || 'Staff Writer'}</p>
                </div>
            </a>
        `;
    }).join('');
}


/**
 * Auto-refresh regional data every 10 minutes
 */
function setUpAutoRefresh(region) {
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

    setInterval(() => {
        console.log('🔄 Auto-refreshing regional data...');
        apiService.clearCache();
        loadRegionalData(region);
    }, REFRESH_INTERVAL);

    console.log('✓ Auto-refresh enabled (10 minutes)');
}


/**
 * Global API error handler
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
