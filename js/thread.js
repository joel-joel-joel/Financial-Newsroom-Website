

            // Get thread ID from URL
        function getThreadId() {
            const params = new URLSearchParams(window.location.search);
            return params.get('id') || '1';
        }

            import { getThread, addReply } from './persist.js';

    function loadThread() {
        const threadId = new URLSearchParams(location.search).get('id');
        const t = getThread(threadId);
        if (!t) {
            document.querySelector('.thread-header-section').innerHTML =
                '<h2 class="thread-title-large">Thread not found</h2>';
            return;
        }
        // header
        document.getElementById('thread-title').textContent       = t.title;
        document.getElementById('thread-replies').textContent     = `${t.replies} replies`;
        document.getElementById('thread-last-post').textContent   = `Last post ${t.lastPost}`;
        document.getElementById('author-name').textContent        = t.author;
        document.getElementById('post-time').textContent          = new Date(t.createdAt).toLocaleString();
        document.getElementById('post-content').textContent       = t.content;

        // posts
        const list = document.getElementById('posts-list');
        list.innerHTML = '';
        t.posts.forEach(p => {
            list.insertAdjacentHTML('beforeend', `
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
            </div>`);
        });
    }

// ---- handle reply form ----
    document.getElementById('reply-form').addEventListener('submit', e => {
        e.preventDefault();
        const threadId = new URLSearchParams(location.search).get('id');
        const author  = document.getElementById('reply-name').value.trim();
        const content = document.getElementById('reply-content').value.trim();
        if (!author || !content) return;
        addReply({ threadId, author, content });
        e.target.reset();
        loadThread();          // re-render with new post
    });
            // Display current date
            function displayDate() {
                const options = { month: 'short', day: 'numeric', year: 'numeric' };
                const today = new Date().toLocaleDateString('en-US', options);
                document.getElementById('current-date').textContent = today;
            }

            // Handle form submission
            document.getElementById('reply-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('reply-name').value;
                const content = document.getElementById('reply-content').value;
                
                // Here you would typically send this to a server
                alert(`Reply from ${name} submitted!\n\n"${content}"`);
                
                this.reset();
            });

            // Initialize on page load
            window.addEventListener('DOMContentLoaded', function() {
                displayDate();
                loadThread();
            });