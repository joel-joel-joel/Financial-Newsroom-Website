/**
 * regional-loader.js - Regional Page Loader
 * Handles regional news, videos, search, and layout rendering
 */

// ===== Global Variables =====
let apiService = null;
let currentRegion = null;

/* ========== REGION DETECTION ========== */

/**
 * Detect the current region from the URL path
 * @returns {string|null} - Region name or null if not detected
 */
function detectRegion() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('australia')) return 'australia';
    if (path.includes('europe')) return 'europe';
    if (path.includes('asia')) return 'asia';
    if (path.includes('americas')) return 'americas';
    if (path.includes('africa')) return 'africa';

    console.warn('⚠️ Could not detect region from URL:', path);
    return null;
}

/* ========== API CALLS ========== */

/**
 * Fetch regional news from backend
 * @param {string} region - Region name
 * @param {number} pageSize - Number of articles per request
 * @param {number} page - Page number
 * @returns {Promise<Object>} - API response with articles
 */
async function fetchRegionalNews(region, pageSize = 20, page = 1) {
    try {
        console.log(`📡 Fetching news for ${region}...`);
        const response = await fetch('/api/regional-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ region, pageSize, page })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        console.log(`✅ Received ${data.articles?.length || 0} articles from API`);
        return data;

    } catch (error) {
        console.error('❌ Regional news fetch error:', error);
        return await fetchRegionalNewsFallback(region, pageSize);
    }
}

/**
 * Fallback API call using direct service
 * @param {string} region 
 * @param {number} pageSize 
 * @returns {Promise<Object>}
 */
async function fetchRegionalNewsFallback(region, pageSize = 20) {
    try {
        const query = getRegionalQuery(region);
        const result = await apiService.searchArticles(query, pageSize, 1);
        return { success: true, articles: result.articles || [], totalResults: result.totalResults || 0 };

    } catch (error) {
        console.error('❌ Fallback also failed:', error);
        return { success: false, articles: getFallbackArticles(region), totalResults: 0 };
    }
}

/**
 * Return region-specific search query for fallback
 * @param {string} region 
 * @returns {string}
 */
function getRegionalQuery(region) {
    const queries = {
        australia: 'Australia Sydney Melbourne market finance economy ASX',
        africa: 'Africa Kenya Nigeria South Africa market finance economy',
        americas: 'Americas USA Canada Brazil Latin America market finance',
        asia: 'Asia China Japan India Singapore market finance economy',
        europe: 'Europe UK Germany France ECB market finance economy'
    };
    return queries[region.toLowerCase()] || 'finance market economy';
}

/* ========== RENDERING FUNCTIONS ========== */

/**
 * Render the main story
 * @param {Object} article 
 * @param {string} selector - DOM selector for main story
 */
async function renderMainStory(article, selector = '.main-story') {
    const mainStory = document.querySelector(selector);
    if (!mainStory) return console.warn('⚠️ Main story element not found:', selector);

    const titleEl = mainStory.querySelector('.main-story-title');
    const imgEl   = mainStory.querySelector('.main-img');
    const textEl  = mainStory.querySelector('.main-story-text');
    const authorEl = mainStory.querySelector('.main-story-author');

    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);

    if (titleEl) titleEl.textContent = article.title || 'Untitled Article';
    if (imgEl) {
        imgEl.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';
        imgEl.alt = article.title || 'Article image';
        imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800'; };
    }
    if (textEl) textEl.textContent = article.description || article.content || 'Read full article for more details...';
    if (authorEl) {
        const authorName = article.author || 'Staff Writer';
        const sourceName = article.source?.name || 'The Financial Frontier';
        authorEl.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
    }

    mainStory.href = `article.html?id=${articleId}`;
}

/**
 * Render a substory
 * @param {HTMLElement} substoryEl 
 * @param {Object} article 
 * @param {boolean} isType2 - Layout type
 */
async function renderSubstory(substoryEl, article, isType2 = false) {
    if (!substoryEl) return console.warn('⚠️ Substory element not found');

    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);

    const titleEl = substoryEl.querySelector('.substory-title');
    const textEl  = substoryEl.querySelector('.substory-text');
    if (titleEl) titleEl.textContent = article.title || 'Untitled Article';
    if (textEl) textEl.textContent = article.description || 'Read more...';

    if (isType2) {
        const imgEl = substoryEl.querySelector('.sub-img.square-right');
        const authorEl = substoryEl.querySelector('.substory-author-under');
        if (imgEl) {
            imgEl.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400';
            imgEl.alt = article.title || 'Article thumbnail';
            imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400'; };
        }
        if (authorEl) {
            const authorName = article.author || 'Staff Writer';
            const sourceName = article.source?.name || 'Staff';
            authorEl.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
        }
    } else {
        const imgEl = substoryEl.querySelector('.main-img');
        const authorEl = substoryEl.querySelector('.substory-author');
        if (imgEl) {
            imgEl.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400';
            imgEl.alt = article.title || 'Article image';
            imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'; };
        }
        if (authorEl) {
            const authorName = article.author || 'Staff Writer';
            const sourceName = article.source?.name || 'Staff';
            authorEl.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
        }
    }

    substoryEl.href = `article.html?id=${articleId}`;
}

/**
 * Render list of additional articles
 * @param {Array} articles 
 * @param {string} containerSelector 
 */
function renderArticlesList(articles, containerSelector = '.article-wrapper') {
    const container = document.querySelector(containerSelector);
    if (!container) return console.warn('⚠️ Articles list container not found:', containerSelector);

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No additional articles available</p>';
        return;
    }

    container.innerHTML = articles.map(article => {
        const articleId = generateArticleId(article);
        storeArticleData(articleId, article);
        const date = new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const imageUrl = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800';

        return `
            <a href="article.html?id=${articleId}" class="article">
                <img src="${imageUrl}" alt="${escapeHtml(article.title || 'Article')}" class="article-thumbnail">
                <div class="article-text-block">
                    <p class="article-date">${date}</p>
                    <h5 class="article-title">${escapeHtml(article.title || 'Untitled')}</h5>
                    <p class="article-description">${escapeHtml(article.description || 'No description available')}</p>
                    <p class="article-author">By ${escapeHtml(article.author || 'Staff Writer')}</p>
                </div>
            </a>`;
    }).join('');
}

/* ========== SEARCH FUNCTIONALITY ========== */

/**
 * Setup search form and handle search
 */
function setupSearchFunctionality() {
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    if (!searchForm || !searchInput) return console.warn('⚠️ Search form not found');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return alert('Please enter a search term');

        try {
            const result = await apiService.searchArticles(query, 20, 1);
            if (!result.articles || result.articles.length === 0) {
                showSearchNoResults(query);
                return;
            }
            await rebuildStoryGridForSearch(result.articles);
            updateNewsTicker(result.articles);

        } catch (error) {
            console.error('❌ Search error:', error);
            showError('Search failed. Please try again.');
        }
    });
}

/**
 * Rebuild story grid for search results
 * @param {Array} articles 
 */
async function rebuildStoryGridForSearch(articles) {
    const storyGrid = document.querySelector('.story-grid');
    if (!storyGrid) return console.error('❌ Story grid not found');

    if (articles.length < 3) articles = [...articles, ...getFallbackArticles(currentRegion)].slice(0, 7);

    storyGrid.innerHTML = `
        <a href="#" class="main-story" data-article="0"><h4 class="main-story-title">Loading...</h4></a>
        <a href="#" class="substory-1" data-article="1"><h4 class="substory-title">Loading...</h4></a>
        <a href="#" class="substory-2" data-article="2"><h4 class="substory-title">Loading...</h4></a>
    `;

    await renderMainStory(articles[0], '.main-story');
    await renderSubstory(document.querySelector('.substory-1'), articles[1], false);
    await renderSubstory(document.querySelector('.substory-2'), articles[2], true);

    renderArticlesList(articles.slice(3, 11));
}

/* ========== UTILITY FUNCTIONS ========== */

/**
 * Store article in sessionStorage
 * @param {string} articleId 
 * @param {Object} article 
 */
function storeArticleData(articleId, article) {
    if (!articleId || !article) return;
    const data = { ...article };
    sessionStorage.setItem(`art_${articleId}`, JSON.stringify(data));
}

/**
 * Generate unique article ID
 * @param {Object} article 
 * @returns {string}
 */
function generateArticleId(article) {
    try {
        const base = article.url || article.title || Date.now().toString();
        return btoa(base).slice(0, 16).replace(/[/+=]/g, m => ({ '/':'-', '+':'_', '=':'' }[m]));
    } catch {
        return 'article_' + Date.now();
    }
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

/* ========== PAGE INITIALIZATION ========== */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        apiService = new APIService(API_CONFIG);
        currentRegion = detectRegion();
        displayCurrentDate();
        setupSearchFunctionality();
        await loadRegionalContent(currentRegion);
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError(error.message);
    }
});
