import { getThread, addReply } from './persist.js';

// Get thread ID from URL
function getThreadId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
}

// Display current date
function displayDate() {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    document.getElementById('current-date').textContent = today;
}

// Render thread header and posts
function renderThread(threadId) {
    const t = getThread(threadId);

    if (!t) {
        document.querySelector('.thread-header-section').innerHTML =
            '<h2 class="thread-title-large">Thread not found</h2>';
        return;
    }

    // Header info
    document.getElementById('thread-title').textContent     = t.title;
    document.getElementById('thread-replies').textContent   = `${t.replies} replies`;
    document.getElementById('thread-last-post').textContent = `Last post ${t.lastPost}`;
    document.getElementById('author-name').textContent      = t.author;
    document.getElementById('post-time').textContent        = new Date(t.createdAt).toLocaleString();
    document.getElementById('post-content').textContent     = t.content;

    // Posts list
    const list = document.getElementById('posts-list');
    list.innerHTML = ''; // Clear previous posts

    t.posts.forEach(p => {
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
        list.insertAdjacentHTML('beforeend', postHTML);
    });
}

// Handle reply form submission
function setupReplyForm(threadId) {
    const form = document.getElementById('reply-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const author  = document.getElementById('reply-name').value.trim();
        const content = document.getElementById('reply-content').value.trim();
        if (!author || !content) return;

        addReply({ threadId, author, content });  // Save reply
        form.reset();                              // Clear form
        renderThread(threadId);                    // Re-render posts & thread info
    });
}

// Initialize page
window.addEventListener('DOMContentLoaded', () => {
    displayDate();
    const threadId = getThreadId();
    if (!threadId) {
        document.querySelector('.thread-header-section').innerHTML =
            '<h2 class="thread-title-large">Thread not found</h2>';
        return;
    }

    renderThread(threadId);
    setupReplyForm(threadId);
});
