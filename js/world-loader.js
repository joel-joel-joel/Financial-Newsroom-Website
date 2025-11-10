/**
 * world-loader.js - World Page API Loader
 * Handles the unique multi-region layout of world.html
 */

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🌍 World page initializing...');
    
    try {
        // Check dependencies
        if (typeof API_CONFIG === 'undefined') {
            throw new Error('API_CONFIG not found. Load config.js first.');
        }
        if (typeof APIService === 'undefined') {
            throw new Error('APIService not found. Load api-service.js first.');
        }
        
        // Initialize service
        const apiService = new APIService(API_CONFIG);
        
        // Display current date
        displayCurrentDate();
        
        // Load all world page content in parallel
        await Promise.all([
            loadTopStories(apiService),
            loadRegionalColumns(apiService),
            loadTrendingArticles(apiService)
        ]);
        
        console.log('✅ World page fully loaded');
        
    } catch (error) {
        console.error('❌ World page initialization error:', error);
        showError('Failed to load world news. Please refresh.');
    }
});

/**
 * Load top stories into both story grids
 */
async function loadTopStories(apiService) {
    try {
        console.log('📰 Loading world top stories...');
        
        // Show loading state
        const titleEls = document.querySelectorAll('.story-grid-1 .main-story-title, .story-grid-2 .main-story-title');
        titleEls.forEach(el => el.textContent = 'Loading...');
        
        // Fetch general world news
        const worldNews = await apiService.searchArticles('world economy finance market', 12, 1);
        
        if (!worldNews.articles || worldNews.articles.length < 6) {
            throw new Error('Not enough world articles found');
        }
        
        // Split articles between grids (6 for grid-1, 6 for grid-2)
        const grid1Articles = worldNews.articles.slice(0, 6);
        const grid2Articles = worldNews.articles.slice(6, 12);
        
        // Render grid 1
        await renderStoryGrid('.story-grid-1', grid1Articles);
        
        // Render grid 2
        await renderStoryGrid('.story-grid-2', grid2Articles);
        
        console.log('✅ Top stories loaded');
        
    } catch (error) {
        console.error('❌ Top stories loading error:', error);
        // Keep existing hardcoded content as fallback
    }
}

/**
 * Render a story grid (main + 2 substories)
 */
async function renderStoryGrid(gridSelector, articles) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    
    // Main story (first article)
    const mainStoryEl = grid.querySelector('.main-story');
    if (mainStoryEl && articles[0]) {
        await renderWorldStory(mainStoryEl, articles[0]);
    }
    
    // Substory 1 (second article)
    const substory1El = grid.querySelector('.substory-1');
    if (substory1El && articles[1]) {
        await renderWorldStory(substory1El, articles[1], false, 1);
    }
    
    // Substory 2 (third article - special layout)
    const substory2El = grid.querySelector('.substory-2');
    if (substory2El && articles[2]) {
        await renderWorldStory(substory2El, articles[2], true, 2);
    }
}

/**
 * Render a single story element (works for main and substories)
 */
async function renderWorldStory(element, article, isType2 = false, index = 0) {
    if (!element || !article) return;
    
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    const title = element.querySelector('.main-story-title, .substory-title');
    const text = element.querySelector('.main-story-text, .substory-text');
    const img = element.querySelector('.main-img, .sub-img');
    const author = element.querySelector('.main-story-author, .substory-author, .substory-author-under');
    
    if (title) title.textContent = article.title || 'Untitled';
    if (text) text.textContent = article.description || 'Read more...';
    
    if (img) {
        img.src = article.urlToImage || article.image || getFallbackImage(index);
        img.alt = article.title || 'Article image';
        img.onerror = () => { img.src = getFallbackImage(index); };
    }
    
    if (author) {
        const authorName = article.author || 'Staff Writer';
        const sourceName = article.source?.name || 'The Financial Frontier';
        author.innerHTML = `By ${authorName}<br>Photographed by ${sourceName}`;
    }
    
    element.href = `article.html?id=${articleId}`;
}

/**
 * Load regional columns (Africa, Americas, Asia, Europe)
 */
async function loadRegionalColumns(apiService) {
    console.log('🌐 Loading regional columns...');
    
    const regions = ['africa', 'americas', 'asia', 'europe'];
    
    for (const region of regions) {
        try {
            const regionData = await apiService.searchArticles(region, 5, 1);
            
            if (!regionData.articles || regionData.articles.length === 0) continue;
            
            const column = document.querySelector(`.${region}`);
            if (!column) continue;
            
            // Update main story in column
            const topStory = column.querySelector('.topmost-story');
            if (topStory && regionData.articles[0]) {
                updateColumnStory(topStory, regionData.articles[0]);
            }
            
            // Update other stories
            const bottomStories = column.querySelectorAll('.bottommost-story');
            regionData.articles.slice(1).forEach((article, idx) => {
                if (!bottomStories[idx]) return;
                updateColumnStory(bottomStories[idx], article, true);
            });
            
        } catch (error) {
            console.warn(`⚠️ Failed to load ${region} column:`, error);
        }
    }
    
    console.log('✅ Regional columns loaded');
}

/**
 * Update a column story element
 */
function updateColumnStory(element, article, isBottom = false) {
    const articleId = generateArticleId(article);
    storeArticleData(articleId, article);
    
    if (isBottom) {
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
            img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400'; };
        }
        
        if (link) {
            link.textContent = article.title || 'Untitled';
            link.href = `article.html?id=${articleId}`;
        }
    }
}

/**
 * Load trending articles
 */
async function loadTrendingArticles(apiService) {
    try {
        console.log('📈 Loading trending articles...');
        
        const trendingNews = await apiService.getTopHeadlines('business', 8);
        
        if (!trendingNews || trendingNews.length === 0) {
            throw new Error('No trending articles found');
        }
        
        // Enrich articles
        const enriched = await Promise.all(
            trendingNews.map(article => apiService.getEnrichedArticle(article))
        );
        
        renderArticlesList(enriched, '.fourth-container .article-wrapper');
        
        console.log('✅ Trending articles loaded');
        
    } catch (error) {
        console.error('❌ Trending articles loading error:', error);
        // Keep existing hardcoded content as fallback
    }
}

/**
 * Helper: Get fallback image by index
 */
function getFallbackImage(index) {
    const images = [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120'
    ];
    return images[index] || images[0];
}

/**
 * Helper: Generate article ID (copy from regional-loader.js)
 */
function generateArticleId(article) {
    try {
        const baseString = article.url || article.title || Date.now().toString();
        return btoa(baseString)
            .slice(0, 16)
            .replace(/[/+=]/g, match => {
                return { '/': '-', '+': '_', '=': '' }[match];
            });
    } catch {
        return 'article_' + Date.now();
    }
}

/**
 * Helper: Store article data (copy from regional-loader.js)
 */
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
        console.error('❌ Error storing article:', error);
    }
}

/**
 * Helper: Display current date
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
 * Helper: Show error message
 */
function showError(message) {
    const container = document.querySelector('.second-container');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: crimson;">
                <h3>⚠️ ${message}</h3>
                <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh
                </button>
            </div>
        `;
    }
}