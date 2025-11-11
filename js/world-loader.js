/*
 * Style-aware, grid-based rendering for top stories, regional columns, and trending articles.
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌍 World page initializing...');

    try {
        // Check required dependencies
        if (typeof API_CONFIG === 'undefined') throw new Error('API_CONFIG missing');
        if (typeof APIService === 'undefined') throw new Error('APIService missing');

        const apiService = new APIService(API_CONFIG);

        // Display current date in header
        displayCurrentDate();

        console.log('1️⃣ Loading top stories...');
        await loadTopStories(apiService);

        console.log('2️⃣ Loading regional columns...');
        await loadRegionalColumns(apiService);

        console.log('3️⃣ Loading trending articles...');
        await loadTrendingArticles(apiService);

        console.log('✅ World page fully loaded');

    } catch (error) {
        console.error('❌ World page initialization error:', error);
        showError(error.message || 'Failed to load world news');
    }
});


/**
 * ============================
 * Load Top Stories
 * ============================
 * Fetches world news articles and renders them in two different grid layouts
 */
async function loadTopStories(apiService) {
    console.log('📰 Starting top stories load...');

    try {
        const worldNews = await apiService.searchArticles('global economy finance market', 10, 1);

        if (!worldNews.articles || worldNews.articles.length < 6) {
            throw new Error(`Insufficient articles: got ${worldNews.articles?.length || 0}`);
        }

        // Grid 1: Standard order (Main → Sub-1 → Sub-2)
        await renderStoryGrid('.story-grid-1', worldNews.articles.slice(0, 3), 'standard');

        // Grid 2: Inverted order (Sub-2 → Main → Sub-1)
        await renderStoryGrid('.story-grid-2', worldNews.articles.slice(3, 6), 'inverted');

        console.log('✅ Top stories rendered');

    } catch (error) {
        console.error('❌ Top stories failed:', error);
    }
}


/**
 * Render a story grid based on layout type
 * @param {string} gridSelector - CSS selector for the grid container
 * @param {Array} articles - Array of articles to render
 * @param {string} layout - 'standard' or 'inverted'
 */
async function renderStoryGrid(gridSelector, articles, layout = 'standard') {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    console.log(`🏗️ Rendering ${gridSelector} in ${layout} mode`);

    // Define element order based on layout
    const elementSelectors = layout === 'inverted'
        ? ['.substory-2', '.main-story', '.substory-1'] // Grid 2 order
        : ['.main-story', '.substory-1', '.substory-2']; // Grid 1 order

    for (let i = 0; i < elementSelectors.length; i++) {
        const element = grid.querySelector(elementSelectors[i]);
        if (element && articles[i]) {
            const isType2 = element.classList.contains('substory-2');
            await renderWorldStory(element, articles[i], isType2, i);
        }
    }
}


/**
 * Render individual story inside a grid element
 * @param {HTMLElement} element - The story container
 * @param {Object} article - The article data
 * @param {boolean} isType2 - True if substory-2 (smaller style)
 * @param {number} index - Article index for fallback images
 */
async function renderWorldStory(element, article, isType2 = false, index = 0) {
    if (!element || !article) return;

    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);

    const title = element.querySelector(isType2 ? '.substory-title' : '.main-story-title');
    const text = element.querySelector(isType2 ? '.substory-text' : '.main-story-text');
    const img = element.querySelector(isType2 ? '.sub-img.square-right' : '.main-img');
    const author = element.querySelector(isType2 ? '.substory-author-under' : '.main-story-author');

    if (title) title.textContent = article.title || 'Untitled';
    if (text) text.textContent = article.description || 'Read more...';

    if (img) {
        img.src = article.urlToImage || article.image || getFallbackImage(index);
        img.alt = article.title || 'Article image';
        img.onerror = () => img.src = getFallbackImage(index);
    }

    if (author) {
        const authorName = article.author || 'Staff Writer';
        const sourceName = article.source?.name || 'The Financial Frontier';
        author.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
    }

    // Set the href to link to the article page
    element.href = `article.html?id=${articleId}`;
}


/**
 * ============================
 * Load Regional Columns
 * ============================
 * Fetches and populates columns for Africa, Americas, Asia, Europe
 */
async function loadRegionalColumns(apiService) {
    console.log('🌐 Loading regional columns...');

    const regions = {
        africa: 'Africa economy Kenya Nigeria South Africa finance',
        americas: 'Americas USA Canada Brazil economy finance',
        asia: 'Asia China Japan India economy finance',
        europe: 'Europe UK Germany France economy finance'
    };

    for (const [region, query] of Object.entries(regions)) {
        try {
            console.log(`  📍 Loading ${region} column...`);

            const regionData = await apiService.searchArticles(query, 10, 1);

            if (!regionData.articles || regionData.articles.length < 4) {
                console.warn(`⚠️ ${region}: only got ${regionData.articles?.length || 0} articles`);
                continue;
            }

            const column = document.querySelector(`.${region}`);
            if (!column) {
                console.warn(`⚠️ Column not found: .${region}`);
                continue;
            }

            // Top story with image
            const topStory = column.querySelector('.topmost-story');
            if (topStory) {
                updateColumnStory(topStory, regionData.articles[0], false);
            }

            // Bottom stories (next 3 articles)
            const bottomStories = column.querySelectorAll('.bottommost-story');
            regionData.articles.slice(1, 4).forEach((article, idx) => {
                if (bottomStories[idx]) {
                    updateColumnStory(bottomStories[idx], article, true);
                }
            });

            console.log(`  ✅ ${region} column loaded`);

        } catch (error) {
            console.error(`❌ ${region} column failed:`, error);
        }
    }

    console.log('✅ Regional columns loaded');
}


/**
 * Update a story inside a regional column
 * @param {HTMLElement} element - Column element
 * @param {Object} article - Article data
 * @param {boolean} isBottomStory - True if it’s a bottom story (title link only)
 */
function updateColumnStory(element, article, isBottomStory = false) {
    if (!element || !article) return;

    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);

    if (isBottomStory) {
        const link = element.querySelector('.story-title');
        if (link) {
            link.textContent = article.title || 'Untitled';
            link.href = `article.html?id=${articleId}`;
        }
    } else {
        const img = element.querySelector('.trend-img');
        const link = element.querySelector('.mainstory-title');

        if (img) {
            img.src = article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
            img.alt = article.title || 'Article image';
            img.onerror = () => img.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400';
        }

        if (link) {
            link.textContent = article.title || 'Untitled';
            link.href = `article.html?id=${articleId}`;
        }
    }
}


/**
 * ============================
 * Load Trending Articles
 * ============================
 */
async function loadTrendingArticles(apiService) {
    console.log('📈 Loading trending articles...');

    try {
        const trendingNews = await apiService.getTopHeadlines('business', 8);

        if (!trendingNews || trendingNews.length < 4) {
            throw new Error(`Only got ${trendingNews?.length || 0} trending articles`);
        }

        const enriched = await Promise.all(
            trendingNews.slice(0, 4).map(article => apiService.getEnrichedArticle(article))
        );

        renderArticlesList(enriched, '.fourth-container .article-wrapper');

        console.log('✅ Trending articles rendered');

    } catch (error) {
        console.error('❌ Trending articles failed:', error);
    }
}


/**
 * Render a list of articles inside a container
 */
function renderArticlesList(articles, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.warn(`⚠️ Container not found: ${containerSelector}`);
        return;
    }

    container.innerHTML = articles.map(article => {
        const articleId = generateArticleId(article);
        storeArticleData(articleId, article);

        const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <a href="article.html?id=${articleId}" class="article" target="_blank" rel="noopener">
                <img src="${article.urlToImage || article.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'}" 
                     alt="${escapeHtml(article.title || 'Article')}" 
                     class="article-thumbnail"
                     onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'">
                <div class="article-text-block">
                    <p class="article-date">${date}</p>
                    <h5 class="article-title">${escapeHtml(article.title || 'Untitled')}</h5>
                    <p class="article-description">${escapeHtml(article.description || 'No description')}</p>
                    <p class="article-author">By ${escapeHtml(article.author || 'Staff Writer')}</p>
                </div>
            </a>
        `;
    }).join('');
}


/**
 * ============================
 * Utility Functions
 * ============================
 */
function getFallbackImage(index = 0) {
    const images = [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=140'
    ];
    return images[index % images.length];
}

function generateArticleId(article) {
    try {
        const baseString = article.url || article.title || Date.now().toString();
        return btoa(baseString)
            .slice(0, 16)
            .replace(/[/+=]/g, match => ({ '/': '-', '+': '_', '=': '' }[match]));
    } catch {
        return 'article_' + Date.now();
    }
}

function storeArticleData(articleId, article) {
    try {
        const articleData = {
            id: articleId,
            title: article.title,
            description: article.description || '',
            author: article.author || 'Staff Writer',
            source: article.source || { name: 'The Financial Frontier' },
            publishedAt: article.publishedAt || new Date().toISOString(),
            url: article.url || '#',
            urlToImage: article.urlToImage || article.image || '',
            content: article.content || article.description || ''
        };
        sessionStorage.setItem(`art_${articleId}`, JSON.stringify(articleData));
    } catch (error) {
        console.error('❌ Storage error:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function displayCurrentDate() {
    const dateElement = document.querySelector(".date");
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

function showError(message) {
    const container = document.querySelector('.second-container');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: crimson;">
                <h3>⚠️ ${escapeHtml(message)}</h3>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }
}
