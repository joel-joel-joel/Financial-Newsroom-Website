// Simple localStorage helpers for the forum
const STORAGE_KEY = 'ff_forum_v1';        // namespace
const getDB = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const setDB = db => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

// ---------- Thread-level helpers ----------
export function getAllThreads() {
    const db = getDB();
    return Object.values(db.threads || {})
                 .sort((a,b) => b.createdAt - a.createdAt);   // newest first
}
export function getThread(id) {
    const db = getDB();
    return (db.threads || {})[id] || null;
}
export function addThread({title, author, content}) {
    const db = getDB();
    if (!db.threads) db.threads = {};
    const id = 't' + Date.now();
    db.threads[id] = {
        id,
        title,
        author,
        content,
        createdAt: Date.now(),
        replies: 0,
        lastPost: 'just now',
        posts: []
    };
    setDB(db);
    return id;
}
export function addReply({threadId, author, content}) {
    const db = getDB();
    const t = (db.threads || {})[threadId];
    if (!t) return;
    t.posts.push({
        author,
        content,
        timestamp: new Date().toLocaleString()
    });
    t.replies = t.posts.length;
    t.lastPost = 'just now';
    setDB(db);
}