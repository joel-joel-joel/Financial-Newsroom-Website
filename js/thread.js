 const threadData = {
                1: {
                    title: "Fed Decision Looms—What's Priced In?",
                    author: "MarketWatcher99",
                    timestamp: "3 hours ago",
                    content: "Markets are pricing in a 70% chance of a 25-bp cut, but some traders are betting on 50. The market seems split on what the Fed will ultimately decide. What are your thoughts on the probability? Are you positioning for a bigger cut or sticking with consensus?",
                    replies: 42,
                    lastPost: "3 min ago",
                    posts: [
                        {
                            author: "TradingPro",
                            timestamp: "2 hours ago",
                            content: "I'm betting on 25bp. The inflation data hasn't moved enough to justify 50bp in my view. The Fed has been data-dependent, and recent CPI prints suggest they'll stay cautious."
                        },
                        {
                            author: "AnalystMike",
                            timestamp: "1 hour ago",
                            content: "50bp is priced in by some of the more aggressive funds. I think if we see any hawkish guidance, we could see a sharp selloff in equities and a rally in bonds."
                        },
                        {
                            author: "RetailTrader",
                            timestamp: "30 min ago",
                            content: "Just holding my positions through the announcement. Too risky to make big bets right now. The IV is already elevated."
                        }
                    ]
                },
                2: {
                    title: "Oil Volatility Returns",
                    author: "EnergyDeskAnalyst",
                    timestamp: "2 hours ago",
                    content: "Geopolitical tension is pushing WTI toward $90. How are you positioned? The risk premium has returned to the market after a quiet summer. Production concerns from key regions are adding to the pressure.",
                    replies: 18,
                    lastPost: "12 min ago",
                    posts: [
                        {
                            author: "CommodityTrader",
                            timestamp: "1 hour ago",
                            content: "Long energy names and short equities as a hedge. If we breach $90, the correlation trade could get messy."
                        },
                        {
                            author: "PortfolioManager",
                            timestamp: "45 min ago",
                            content: "Staying neutral. Supply disruption fears are real, but demand destruction from higher prices could be just as impactful."
                        }
                    ]
                }
            };

            // Get thread ID from URL
            function getThreadId() {
                const params = new URLSearchParams(window.location.search);
                return params.get('id') || '1';
            }

            // Load and display thread
            function loadThread() {
                const threadId = getThreadId();
                const thread = threadData[threadId];

                if (!thread) {
                    document.querySelector('.thread-header-section').innerHTML = '<h2 class="thread-title-large">Thread not found</h2>';
                    return;
                }

                // Update header
                document.getElementById('thread-title').textContent = thread.title;
                document.getElementById('thread-replies').textContent = `${thread.replies} replies`;
                document.getElementById('thread-last-post').textContent = `Last post ${thread.lastPost}`;

                // Update original post
                document.getElementById('author-name').textContent = thread.author;
                document.getElementById('post-time').textContent = thread.timestamp;
                document.getElementById('post-content').textContent = thread.content;

                // Load additional posts
                const postsList = document.getElementById('posts-list');
                postsList.innerHTML = '';
                
                thread.posts.forEach(post => {
                    const postEl = document.createElement('div');
                    postEl.className = 'post';
                    postEl.innerHTML = `
                        <div class="post-header">
                            <div>
                                <div class="post-author">${post.author}</div>
                                <div class="post-timestamp">${post.timestamp}</div>
                            </div>
                        </div>
                        <div class="post-content">${post.content}</div>
                        <div class="post-actions">
                            <a class="post-action" href="#">Like</a>
                            <a class="post-action" href="#">Reply</a>
                            <a class="post-action" href="#">Share</a>
                        </div>
                    `;
                    postsList.appendChild(postEl);
                });
            }

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