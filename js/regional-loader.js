/**
 * regional-loader.js - Layout-aware regional news loading
 * Handles: Standard regions (AU, EU, ASIA, etc.) vs World layout
 */

// ===== Layout Type Detection =====
function detectLayoutType() {
    // World page has unique elements
    if (document.querySelector('.world-navbar') || 
        document.querySelector('.story-grid-2') ||
        document.querySelector('.third-section ul.africa')) {
        return 'world-layout';
    }
    
    // Standard regional layout
    if (document.querySelector('.story-grid') && 
        document.querySelector('.main-story') &&
        !document.querySelector('.story-grid-2')) {
        return 'standard-regional';
    }
    
    return 'unknown';
}

/**
 * Render content based on detected layout
 */
async function renderRegionalContent(articles, region) {
    const layoutType = detectLayoutType();
    console.log(`🎨 Rendering ${layoutType} for ${region}`);
    
    switch (layoutType) {
        case 'world-layout':
            await renderWorldLayout(articles);
            break;
        case 'standard-regional':
            await renderStandardRegionalLayout(articles);
            break;
        default:
            console.warn('⚠️ Unknown layout, using standard');
            await renderStandardRegionalLayout(articles);
    }
}

/**
 * World Layout Renderer (matches world.html structure)
 */
async function renderWorldLayout(articles) {
    console.log('🏗️ Rendering World layout');
    
    // World page has 2 story grids + regional columns + trending
    const grid1Articles = articles.slice(0, 3);  // First 3 for grid-1
    const grid2Articles = articles.slice(3, 6);  // Next 3 for grid-2  
    const regionalArticles = articles.slice(6, 10); // 4 for regional columns
    const trendingArticles = articles.slice(10, 14); // 4 for trending
    
    // ===== Story Grid 1 =====
    const grid1 = document.querySelector('.story-grid-1');
    if (grid1) {
        // Main story (first article)
        if (grid1Articles[0]) {
            await renderMainStory(grid1Articles[0], '.story-grid-1 .main-story');
        }
        // Substory 1
        if (grid1Articles[1]) {
            await renderSubstory(grid1.querySelector('.substory-1'), grid1Articles[1]);
        }
        // Substory 2 (special layout)
        if (grid1Articles[2]) {
            await renderSubstory(grid1.querySelector('.substory-2'), grid1Articles[2], true);
        }
    }
    
    // ===== Story Grid 2 =====
    const grid2 = document.querySelector('.story-grid-2');
    if (grid2) {
        // Substory 2 first (special layout)
        if (grid2Articles[0]) {
            await renderSubstory(grid2.querySelector('.substory-2'), grid2Articles[0], true);
        }
        // Main story in middle
        if (grid2Articles[1]) {
            await renderMainStory(grid2Articles[1], '.story-grid-2 .main-story');
        }
        // Substory 1 on right
        if (grid2Articles[2]) {
            await renderSubstory(grid2.querySelector('.substory-1'), grid2Articles[2]);
        }
    }
    
    // ===== Regional Columns (Africa, Americas, Asia, Europe) =====
    await renderRegionalColumns(regionalArticles);
    
    // ===== Trending Articles =====
    if (document.querySelector('.fourth-container .article-wrapper')) {
        uiRenderer.renderArticlesList(trendingArticles);
    }
}

/**
 * Standard Regional Layout (Australia, Europe, Asia, etc.)
 */
async function renderStandardRegionalLayout(articles) {
    console.log('🏗️ Rendering Standard Regional layout');
    
    // Standard layout: 1 main + 2 substories + additional articles
    const mainArticle = articles[0];
    const substories = articles.slice(1, 3);
    const additionalArticles = articles.slice(3);
    
    // ===== Main Story =====
    if (mainArticle && document.querySelector('.main-story')) {
        await renderMainStory(mainArticle);
    }
    
    // ===== Sub Stories =====
    if (substories[0] && document.querySelector('.substory-1')) {
        await renderSubstory(document.querySelector('.substory-1'), substories[0]);
    }
    
    if (substories[1] && document.querySelector('.substory-2')) {
        await renderSubstory(document.querySelector('.substory-2'), substories[1], true);
    }
    
    // ===== Additional Articles =====
    if (document.querySelector('.article-wrapper')) {
        uiRenderer.renderArticlesList(additionalArticles.slice(0, 4));
    }
    
    // ===== Videos Section (if exists) =====
    if (document.querySelector('.videos-wrapper')) {
        // Can load region-specific videos here if needed
        console.log('📺 Videos section found - can load regional videos');
    }
}

/**
 * Render regional columns (World layout specific)
 */
async function renderRegionalColumns(articles) {
    const regions = ['africa', 'americas', 'asia', 'europe'];
    const articlesPerRegion = Math.ceil(articles.length / regions.length);
    
    regions.forEach((regionName, index) => {
        const regionArticles = articles.slice(
            index * articlesPerRegion,
            (index + 1) * articlesPerRegion
        );
        
        const columnEl = document.querySelector(`.third-section ul.${regionName}`);
        if (!columnEl || regionArticles.length === 0) return;
        
        // Top story with image
        const topStory = columnEl.querySelector('.topmost-story');
        if (topStory && regionArticles[0]) {
            const article = regionArticles[0];
            const img = topStory.querySelector('.trend-img');
            const link = topStory.querySelector('.mainstory-title');
            
            if (img) {
                img.src = article.image || 'https://via.placeholder.com/400x300';
                img.alt = article.title;
                img.onerror = () => { img.src = 'https://via.placeholder.com/400x300'; };
            }
            if (link) {
                link.textContent = article.title;
                link.href = `article.html?id=${article.id}`;
            }
        }
        
        // Bottom stories (text only)
        const bottomStories = columnEl.querySelectorAll('.bottommost-story');
        regionArticles.slice(1).forEach((article, idx) => {
            if (bottomStories[idx]) {
                const link = bottomStories[idx].querySelector('.story-title');
                if (link) {
                    link.textContent = article.title;
                    link.href = `article.html?id=${article.id}`;
                }
            }
        });
    });
}

/**
 * Video API Integration for Regional Pages
 * Loads region-specific videos using YouTube API
 */

/**
 * Load regional videos with proper error handling
 */
async function loadRegionalVideos(region) {
    try {
        console.log(`🎬 Loading videos for ${region}...`);
        
        const videosWrapper = document.querySelector('.videos-wrapper');
        if (!videosWrapper) {
            console.log('📺 No videos wrapper found');
            return;
        }
        
        // Show loading state
        videosWrapper.innerHTML = '<div class="video-loading">Loading videos...</div>';
        
        // Get region-specific video query
        const videoQuery = getRegionalVideoQuery(region);
        
        // Search for videos using same API pattern as main.js
        const videos = await apiService.searchVideos(videoQuery, 4);
        
        if (!videos || videos.length === 0) {
            throw new Error('No videos found');
        }
        
        // Render videos
        renderRegionalVideos(videos, videosWrapper);
        
        console.log(`✅ Loaded ${videos.length} videos for ${region}`);
        
    } catch (error) {
        console.error('❌ Video loading error:', error);
        handleVideoError(region);
    }
}

/**
 * Get region-specific video search query
 */
function getRegionalVideoQuery(region) {
    const queries = {
        australia: 'Australia finance market economy ASX',
        africa: 'Africa finance market economy investment',
        americas: 'Americas finance market economy USA Canada Brazil',
        asia: 'Asia finance market economy China Japan India',
        europe: 'Europe finance market economy ECB UK Germany',
        world: 'Global finance market economy international'
    };
    
    return queries[region.toLowerCase()] || queries.world;
}

/**
 * Render video cards with proper styling
 */
function renderRegionalVideos(videos, container) {
    if (!videos || videos.length === 0) {
        container.innerHTML = '<p class="no-videos">No videos available</p>';
        return;
    }
    
    container.innerHTML = videos.map(video => `
        <a href="https://www.youtube.com/watch?v=${video.id}" class="video" target="_blank" rel="noopener">
            <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy">
            <h5 class="video-title">${escapeHtml(video.title)}</h5>
            <p class="video-channel">${escapeHtml(video.channelTitle)}</p>
            <p class="video-date">${formatDate(video.publishedAt)}</p>
        </a>
    `).join('');
}

/**
 * Handle video loading errors with fallback
 */
function handleVideoError(region) {
    const videosWrapper = document.querySelector('.videos-wrapper');
    if (!videosWrapper) return;
    
    // Show fallback content
    videosWrapper.innerHTML = `
        <div class="video-error">
            <p>Unable to load videos for ${region}</p>
            <a href="https://www.youtube.com/results?search_query=${region}+finance" target="_blank">
                View on YouTube →
            </a>
        </div>
    `;
}

/**
 * Escape HTML for video titles
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

/**
 * Format video publish date
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    } catch {
        return 'Date unknown';
    }
}

/**
 * regional-loader.js - Enhanced with proper article linking and video API integration
 * Handles article clicks and video loading for all regional pages
 */

// ===== Article Linking System =====
function setupArticleLinks() {
    // Make all article cards clickable
    document.addEventListener('click', (e) => {
        const articleLink = e.target.closest('a[href^="article.html?id="]');
        if (articleLink) {
            e.preventDefault();
            const articleId = new URL(articleLink.href).searchParams.get('id');
            navigateToArticle(articleId);
        }
    });
}

/**
 * Navigate to article page with proper data passing
 */
function navigateToArticle(articleId) {
    try {
        // Get article data from sessionStorage
        const articleData = sessionStorage.getItem(`art_${articleId}`);
        
        if (!articleData) {
            console.warn('⚠️ Article data not found, loading without cache');
            // Still navigate, article.js will try to fetch
        }
        
        // Navigate to article page
        window.location.href = `article.html?id=${articleId}`;
        
    } catch (error) {
        console.error('❌ Error navigating to article:', error);
        // Fallback: direct navigation
        window.location.href = `article.html?id=${articleId}`;
    }
}

/**
 * Enhanced article data storage with validation
 */
function storeArticleData(articleId, article) {
    try {
        // Validate required fields
        if (!articleId || !article || !article.title) {
            console.warn('⚠️ Invalid article data, not storing');
            return false;
        }
        
        // Store in sessionStorage (same as main.js pattern)
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
        console.log(`💾 Stored article data: ${articleId}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error storing article:', error);
        return false;
    }
}

/**
 * regional-loader.js - Complete version with article linking and video support
 * Place this at the end of your existing regional-loader.js
 */

// ===== Enhanced Initialization =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Regional page initializing...');
    
    // Create service instances
    apiService = new APIService(API_CONFIG);
    uiRenderer = new UIRenderer();
    
    // Detect region
    currentRegion = detectRegion();
    console.log(`📍 Detected region: ${currentRegion}`);
    
    if (!currentRegion) {
        console.error('❌ Could not detect region');
        showError('Invalid region');
        return;
    }
    
    // Setup article linking
    setupArticleLinks();
    
    // Display date
    displayCurrentDate();
    
    // Load all content
    await loadRegionalContent(currentRegion);
    
    // Setup auto-refresh
    setUpAutoRefresh(currentRegion);
    
    // Setup search if present
    setupSearchFunctionality();
    
    console.log('✅ Regional page fully loaded');
});

/**
 * Enhanced content loading with videos
 */
async function loadRegionalContent(region) {
    try {
        console.log(`📰 Loading content for ${region}...`);
        
        // Show loading states
        showLoadingStates();
        
        // Load news articles
        const articles = await loadRegionalArticles(region);
        
        // Load videos (runs in parallel)
        loadRegionalVideos(region).catch(err => 
            console.warn('⚠️ Video loading failed:', err)
        );
        
        // Render articles
        await renderRegionalContent(articles, region);
        
        // Update news ticker
        updateNewsTicker(articles);
        
        console.log('✅ All content loaded successfully');
        
    } catch (error) {
        console.error('❌ Content loading error:', error);
        handleLoadError(error, region);
    }
}

/**
 * Load regional articles with enhanced error handling
 */
async function loadRegionalArticles(region) {
    const regionalNews = await fetchRegionalNews(region, 20, 1);
    
    if (!regionalNews.success || !regionalNews.articles?.length) {
        throw new Error('No articles found');
    }
    
    // Enrich articles
    const enrichedArticles = await Promise.all(
        regionalNews.articles.map(article => apiService.getEnrichedArticle(article))
    );
    
    // Store article data for article page navigation
    enrichedArticles.forEach(article => {
        const articleId = article.id || apiService._generateArticleId(article);
        storeArticleData(articleId, article);
    });
    
    return enrichedArticles;
}

/**
 * Show loading states for all content areas
 */
function showLoadingStates() {
    // Articles loading
    const storyGrid = document.querySelector('.story-grid');
    if (storyGrid) {
        storyGrid.innerHTML = '<div class="loading">Loading regional news...</div>';
    }
    
    // Videos loading
    const videosWrapper = document.querySelector('.videos-wrapper');
    if (videosWrapper) {
        videosWrapper.innerHTML = '<div class="loading">Loading videos...</div>';
    }
    
    // News ticker loading
    const ticker = document.querySelector('#ticker-content, .news-ticker p');
    if (ticker) {
        ticker.textContent = `Loading ${currentRegion} headlines...`;
    }
}

/**
 * Update news ticker with regional headlines
 */
function updateNewsTicker(articles) {
    const ticker = document.querySelector('#ticker-content, .news-ticker p');
    if (!ticker || !articles || articles.length === 0) return;
    
    const headlines = articles.slice(0, 5).map(article => article.title);
    ticker.textContent = `Top Headlines: ${headlines.join(' | ')}`;
}

/**
 * Enhanced error handling
 */
function handleLoadError(error, region) {
    console.error('❌ Load error:', error);
    
    const container = document.querySelector('.main-container, .story-section');
    if (container) {
        uiRenderer.showError(container, `Unable to load content for ${region}. Please try again.`);
    }
    
    // Show fallback content
    showFallbackContent(region);
}

/**
 * Show fallback content when API fails
 */
function showFallbackContent(region) {
    // Fallback articles
    const fallbackArticles = [
        {
            title: `${region.charAt(0).toUpperCase() + region.slice(1)} Markets Update`,
            description: `Latest financial news from ${region}`,
            author: 'Regional Correspondent',
            id: `fallback-${region}-1`
        },
        {
            title: `Economic Outlook for ${region}`,
            description: 'Analysis of current economic conditions',
            author: 'Financial Analyst',
            id: `fallback-${region}-2`
        }
    ];
    
    // Render fallback
    renderRegionalContent(fallbackArticles, region);
}