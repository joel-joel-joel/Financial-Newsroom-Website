/**
 * regional-loader.js - COMPLETE Regional Page Loader
 * Handles: Australia, Europe, Asia, Americas, Africa (standard layout)
 * World page uses separate logic due to different layout
 */

// ===== Global Variables =====
let apiService = null;
let uiRenderer = null;
let currentRegion = null;

// ===== Region Detection =====
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

// ===== API Call to Backend =====
async function fetchRegionalNews(region, pageSize = 20, page = 1) {
    try {
        console.log(`📡 Fetching news for ${region}...`);
        
        // Call your Vercel serverless function
        const response = await fetch('/api/regional-news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                region,
                pageSize,
                page
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Received ${data.articles?.length || 0} articles`);
        
        return data;
        
    } catch (error) {
        console.error('❌ Regional news fetch error:', error);
        
        // Fallback: use direct API call
        console.log('🔄 Trying fallback with apiService...');
        return await fetchRegionalNewsFallback(region, pageSize);
    }
}

// ===== Fallback API Call (Direct) =====
async function fetchRegionalNewsFallback(region, pageSize = 20) {
    try {
        // Use apiService for direct API call
        const query = getRegionalQuery(region);
        const result = await apiService.searchArticles(query, pageSize, 1);
        
        return {
            success: true,
            articles: result.articles || [],
            totalResults: result.totalResults || 0
        };
    } catch (error) {
        console.error('❌ Fallback also failed:', error);
        return {
            success: false,
            articles: getFallbackArticles(region),
            totalResults: 0
        };
    }
}

// ===== Get Region-Specific Search Query =====
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

// ===== Render Main Story =====
async function renderMainStory(article, selector = '.main-story') {
    const mainStory = document.querySelector(selector);
    if (!mainStory) {
        console.warn('⚠️ Main story element not found:', selector);
        return;
    }
    
    const title = mainStory.querySelector('.main-story-title');
    const img = mainStory.querySelector('.main-img');
    const text = mainStory.querySelector('.main-story-text');
    const author = mainStory.querySelector('.main-story-author');
    
    // Generate article ID and store
    const articleId = apiService._generateArticleId(article);
    storeArticleData(articleId, article);
    
    // Update content
    if (title) title.textContent = article.title;
    
    if (img) {
        img.src = article.image || article.urlToImage || 'https://via.placeholder.com/800x400';
        img.alt = article.title;
        img.onerror = () => { img.src = 'https://via.placeholder.com/800x400'; };
    }
    
    if (text) {
        text.textContent = article.description || article.content || 'Read full article...';
    }
    
    if (author) {
        author.innerHTML = `By ${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}`;
    }
    
    // Update link
    mainStory.href = `article.html?id=${articleId}`;
    
    console.log('✅ Main story rendered:', article.title.substring(0, 50));
}

// ===== Render Substory =====
async function renderSubstory(substoryEl, article, isType2 = false) {
    if (!substoryEl) {
        console.warn('⚠️ Substory element not found');
        return;
    }
    
    const articleId = apiService._generateArticleId(article);
    storeArticleData(articleId, article);
    
    const title = substoryEl.querySelector('.substory-title');
    const text = substoryEl.querySelector('.substory-text');
    
    if (title) title.textContent = article.title;
    if (text) text.textContent = article.description || 'Read more...';
    
    if (isType2) {
        // Type 2: Text + square thumbnail layout
        const img = substoryEl.querySelector('.sub-img.square-right');
        const authorEl = substoryEl.querySelector('.substory-author-under');
        
        if (img) {
            img.src = article.image || article.urlToImage || 'https://via.placeholder.com/120x120';
            img.alt = article.title;
            img.onerror = () => { img.src = 'https://via.placeholder.com/120x120'; };
        }
        
        if (authorEl) {
            authorEl.innerHTML = `By ${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}`;
        }
    } else {
        // Type 1: Image on top layout
        const img = substoryEl.querySelector('.main-img');
        const authorEl = substoryEl.querySelector('.substory-author');
        
        if (img) {
            img.src = article.image || article.urlToImage || 'https://via.placeholder.com/400x300';
            img.alt = article.title;
            img.onerror = () => { img.src = 'https://via.placeholder.com/400x300'; };
        }
        
        if (authorEl) {
            authorEl.innerHTML = `By ${article.author || 'Staff Writer'}<br>Photographed by ${article.source?.name || 'Staff'}`;
        }
    }
    
    // Update link
    substoryEl.href = `article.html?id=${articleId}`;
    
    console.log('✅ Substory rendered:', article.title.substring(0, 40));
}

// ===== Render Articles List =====
function renderArticlesList(articles, containerSelector = '.article-wrapper') {
    const container = document.querySelector(containerSelector);
    if (!container || !articles || articles.length === 0) {
        console.warn('⚠️ Articles list: container not found or no articles');
        return;
    }
    
    container.innerHTML = articles.map(article => {
        const articleId = apiService._generateArticleId(article);
        storeArticleData(articleId, article);
        
        const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <a href="article.html?id=${articleId}" class="article">
                <img src="${article.image || article.urlToImage || 'https://via.placeholder.com/140x100'}" 
                     alt="${escapeHtml(article.title)}" 
                     class="article-thumbnail"
                     onerror="this.src='https://via.placeholder.com/140x100'">
                <div class="article-text-block">
                    <p class="article-date">${date}</p>
                    <h5 class="article-title">${escapeHtml(article.title)}</h5>
                    <p class="article-description">${escapeHtml(article.description || '')}</p>
                    <p class="article-author">By ${escapeHtml(article.author || 'Staff Writer')}</p>
                </div>
            </a>
        `;
    }).join('');
    
    console.log(`✅ Rendered ${articles.length} articles in list`);
}

// ===== Load Regional Videos =====
async function loadRegionalVideos(region) {
    try {
        console.log(`🎬 Loading videos for ${region}...`);
        
        const videosWrapper = document.querySelector('.videos-wrapper');
        if (!videosWrapper) {
            console.log('📺 No videos wrapper found');
            return;
        }
        
        videosWrapper.innerHTML = '<div class="video-loading">Loading videos...</div>';
        
        const videoQuery = getRegionalVideoQuery(region);
        const videos = await apiService.searchVideos(videoQuery, 4);
        
        if (!videos || videos.length === 0) {
            throw new Error('No videos found');
        }
        
        renderRegionalVideos(videos, videosWrapper);
        console.log(`✅ Loaded ${videos.length} videos`);
        
    } catch (error) {
        console.error('❌ Video loading error:', error);
        handleVideoError(region);
    }
}

function getRegionalVideoQuery(region) {
    const queries = {
        australia: 'Australia finance market economy ASX news',
        africa: 'Africa finance market economy investment news',
        americas: 'Americas finance market economy USA news',
        asia: 'Asia finance market economy China Japan news',
        europe: 'Europe finance market economy ECB UK news'
    };
    
    return queries[region.toLowerCase()] || 'finance news';
}

function renderRegionalVideos(videos, container) {
    container.innerHTML = videos.map(video => `
        <a href="https://www.youtube.com/watch?v=${video.id}" class="video" target="_blank" rel="noopener">
            <img src="${video.thumbnail}" alt="${escapeHtml(video.title)}" class="video-thumbnail" loading="lazy">
            <h5 class="video-title">${escapeHtml(video.title)}</h5>
        </a>
    `).join('');
}

function handleVideoError(region) {
    const videosWrapper = document.querySelector('.videos-wrapper');
    if (!videosWrapper) return;
    
    videosWrapper.innerHTML = `
        <div class="video-error">
            <p>Videos temporarily unavailable</p>
        </div>
    `;
}

// ===== Store Article Data =====
function storeArticleData(articleId, article) {
    try {
        if (!articleId || !article || !article.title) {
            console.warn('⚠️ Invalid article data');
            return false;
        }
        
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
        return true;
        
    } catch (error) {
        console.error('❌ Error storing article:', error);
        return false;
    }
}

// ===== Utility Functions =====
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
    const container = document.querySelector('.main-container, .story-section');
    if (container) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: crimson;">
                <h3>⚠️ ${escapeHtml(message)}</h3>
                <p style="color: #666;">Please try refreshing the page.</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 20px; padding: 10px 20px; background: crimson; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh
                </button>
            </div>
        `;
    }
}

function updateNewsTicker(articles) {
    const ticker = document.querySelector('#ticker-content');
    if (!ticker || !articles || articles.length === 0) return;
    
    const headlines = articles.slice(0, 5).map(a => a.title);
    ticker.textContent = headlines.join(' | ');
}

function getFallbackArticles(region) {
    return [
        {
            title: `${region.charAt(0).toUpperCase() + region.slice(1)} Markets Update`,
            description: `Latest financial news from ${region}`,
            author: 'Regional Correspondent',
            source: { name: 'The Financial Frontier' },
            publishedAt: new Date().toISOString(),
            url: '#',
            urlToImage: 'https://via.placeholder.com/800x400'
        },
        {
            title: `Economic Outlook for ${region}`,
            description: 'Analysis of current economic conditions',
            author: 'Financial Analyst',
            source: { name: 'The Financial Frontier' },
            publishedAt: new Date().toISOString(),
            url: '#',
            urlToImage: 'https://via.placeholder.com/800x400'
        }
    ];
}

// ===== Auto-Refresh Setup =====
function setUpAutoRefresh(region) {
    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
    
    setInterval(() => {
        console.log('🔄 Auto-refreshing regional data...');
        apiService.clearCache();
        loadRegionalContent(region);
    }, REFRESH_INTERVAL);
    
    console.log('✓ Auto-refresh enabled (10 minutes)');
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Regional page initializing...');
    
    try {
        // Create service instances
        apiService = new APIService(API_CONFIG);
        uiRenderer = new UIRenderer();
        
        // Detect region
        currentRegion = detectRegion();
        console.log(`📍 Detected region: ${currentRegion}`);
        
        if (!currentRegion) {
            throw new Error('Could not detect region');
        }
        
        // Display date
        displayCurrentDate();
        
        // Load content
        await loadRegionalContent(currentRegion);
        
        // Setup auto-refresh
        setUpAutoRefresh(currentRegion);
        
        console.log('✅ Regional page fully loaded');
        
    } catch (error) {
        console.error('❌ Regional page error:', error);
        showError(error.message || 'Failed to load regional content');
    }
});

// ===== Load All Regional Content =====
async function loadRegionalContent(region) {
    try {
        console.log(`📰 Loading content for ${region}...`);
        
        // Show loading states
        const storyGrid = document.querySelector('.story-grid');
        if (storyGrid) {
            storyGrid.innerHTML = '<div style="padding: 40px; text-align: center;">Loading news...</div>';
        }
        
        // Fetch articles
        const newsData = await fetchRegionalNews(region, 20, 1);
        
        if (!newsData.success || !newsData.articles || newsData.articles.length === 0) {
            throw new Error('No articles found');
        }
        
        // Enrich articles with images
        const enrichedArticles = await Promise.all(
            newsData.articles.map(article => apiService.getEnrichedArticle(article))
        );
        
        console.log(`✅ Enriched ${enrichedArticles.length} articles`);
        
        // Render content based on layout
        await renderStandardRegionalLayout(enrichedArticles);
        
        // Update news ticker
        updateNewsTicker(enrichedArticles);
        
        // Load videos (parallel, non-blocking)
        loadRegionalVideos(region).catch(err => 
            console.warn('⚠️ Video loading failed:', err)
        );
        
        console.log('✅ All content loaded successfully');
        
    } catch (error) {
        console.error('❌ Content loading error:', error);
        showError('Unable to load content. Please try again.');
    }
}

// ===== Render Standard Regional Layout =====
async function renderStandardRegionalLayout(articles) {
    console.log('🏗️ Rendering Standard Regional layout');
    
    if (articles.length < 3) {
        console.error('❌ Need at least 3 articles for layout');
        return;
    }
    
    // Main story (first article)
    await renderMainStory(articles[0]);
    
    // Substory 1 (second article)
    const substory1 = document.querySelector('.substory-1');
    if (substory1 && articles[1]) {
        await renderSubstory(substory1, articles[1], false);
    }
    
    // Substory 2 (third article - special layout)
    const substory2 = document.querySelector('.substory-2');
    if (substory2 && articles[2]) {
        await renderSubstory(substory2, articles[2], true);
    }
    
    // Additional articles (rest)
    const additionalArticles = articles.slice(3, 7); // Take 4 more
    renderArticlesList(additionalArticles);
    
    console.log('✅ Standard layout rendered');
}