/**
 * thread.js - Thread page functionality
 * Handles displaying a thread, its posts, and submitting new replies.
 */

import { getThread, addReply } from './persist.js';

/* ========== GET THREAD ID FROM URL ========== */

/**
 * Extract the thread ID from the URL query string
 * @returns {string|null} thread ID or null if missing
 */
function getThreadId() {
    const params = new URLSearchParams(window.location.search); // Parse query params
    return params.get('id') || null;                           // Return 'id' value or null
}

/* ========== DISPLAY CURRENT DATE ========== */

/**
 * Display the current date in 'MMM DD, YYYY' format
 */
function displayDate() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options); // Format date
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = today;                        // Set date in DOM
}

/* ========== RENDER THREAD HEADER & POSTS ========== */

/**
 * Render the thread header and all posts
 * @param {string} threadId - ID of the thread to display
 */
function renderThread(threadId) {
    const t = getThread(threadId); // Retrieve thread data from persistence

    // Thread not found
    if (!t) {
        const headerSection = document.querySelector('.thread-header-section');
        if (headerSection) {
            headerSection.innerHTML = '<h2 class="thread-title-large">Thread not found</h2>';
        }
        return;
    }

    // Populate thread header elements
    const titleEl       = document.getElementById('thread-title');
    const repliesEl     = document.getElementById('thread-replies');
    const lastPostEl    = document.getElementById('thread-last-post');
    const authorEl      = document.getElementById('author-name');
    const postTimeEl    = document.getElementById('post-time');
    const postContentEl = document.getElementById('post-content');

    if (titleEl)       titleEl.textContent       = t.title;
    if (repliesEl)     repliesEl.textContent     = `${t.replies} replies`;
    if (lastPostEl)    lastPostEl.textContent    = `Last post ${t.lastPost}`;
    if (authorEl)      authorEl.textContent      = t.author;
    if (postTimeEl)    postTimeEl.textContent    = new Date(t.createdAt).toLocaleString();
    if (postContentEl) postContentEl.textContent = t.content;

    // Render list of posts
    const list = document.getElementById('posts-list');
    if (!list) return;
    list.innerHTML = ''; // Clear previous posts

    t.posts.forEach(p => {
        // Build post HTML
        const postHTML = `
        <div class="post">
            <div class="post-header">
                <div class="post-author">${p.author}</div>
                <div class="post-timestamp">${p.timestamp}</div>
            </div>
            <div class="post-content">${p.content}</div>
            <div class="post-actions">
                <a class="post-action" href="#">Like</a>
                <a class="post-action" href="#">Reply</a>
                <a class="post-action" href="#">Share</a>
            </div>
        </div>`;
        list.insertAdjacentHTML('beforeend', postHTML); // Append post
    });
}

/* ========== HANDLE REPLY FORM SUBMISSION ========== */

/**
 * Set up reply form event listener
 * @param {string} threadId - Thread ID to which replies will be added
 */
function setupReplyForm(threadId) {
    const form = document.getElementById('reply-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault(); // Prevent default form submission

        const author  = document.getElementById('reply-name')?.value.trim();
        const content = document.getElementById('reply-content')?.value.trim();

        // Validate inputs
        if (!author || !content) return;

        addReply({ threadId, author, content }); // Save reply
        form.reset();                             // Clear form
        renderThread(threadId);                   // Re-render thread to include new post
    });
}

/* ========== INITIALIZE PAGE ========== */

/**
 * Initialize the thread page
 * - Display current date
 * - Render thread and posts
 * - Set up reply form
 */
window.addEventListener('DOMContentLoaded', () => {
    displayDate();                   // Show today's date
    const threadId = getThreadId();  // Get thread ID from URL

    if (!threadId) {
        // Thread ID missing -> show error
        const headerSection = document.querySelector('.thread-header-section');
        if (headerSection) {
            headerSection.innerHTML = '<h2 class="thread-title-large">Thread not found</h2>';
        }
        return;
    }

    renderThread(threadId);          // Render thread and posts
    setupReplyForm(threadId);        // Enable reply form
});
