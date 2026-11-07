// Main JavaScript for Fince News - Crypto & Finance Portal

document.addEventListener('DOMContentLoaded', () => {
  // Theme Management (Defaults to White & Orange)
  initTheme();

  // Reading Progress Bar
  initReadingProgress();

  // Search and Filter on Blog Grid (if on Home page)
  initFilterAndSearch();

  // Like & Bookmark interactions
  initLikeAndBookmark();

  // Comments System
  initComments();

  // Newsletter Subscriptions
  initNewsletter();

  // Mobile Menu
  initMobileMenu();
});

/* --- Theme Management --- */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  // Default to light theme (White & Orange)
  const savedTheme = localStorage.getItem('fince-theme') || localStorage.getItem('adstra-theme') || 'light';

  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggle) themeToggle.innerHTML = '🌙';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('fince-theme', 'light');
        themeToggle.innerHTML = '🌙';
        showToast('Switched to White & Orange Theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('fince-theme', 'dark');
        themeToggle.innerHTML = '☀️';
        showToast('Switched to Dark Theme');
      }
    });
  }
}

/* --- Reading Progress Bar --- */
function initReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  });
}

/* --- Filtering & Search --- */
function initFilterAndSearch() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('search-input');
  const blogCards = document.querySelectorAll('.blog-card');
  const countEl = document.getElementById('visible-count');

  if (!tabBtns.length && !searchInput) return;

  let activeCategory = 'all';
  let searchTerm = '';

  function filterPosts() {
    let visibleCount = 0;

    blogCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category')?.toLowerCase() || '';
      const title = card.querySelector('.card-title')?.textContent?.toLowerCase() || '';
      const excerpt = card.querySelector('.card-excerpt')?.textContent?.toLowerCase() || '';

      const matchesCategory = (activeCategory === 'all' || cardCategory === activeCategory);
      const matchesSearch = !searchTerm || title.includes(searchTerm) || excerpt.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countEl) {
      countEl.textContent = `Showing ${visibleCount} articles`;
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category')?.toLowerCase() || 'all';
      filterPosts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      filterPosts();
    });
  }
}

/* --- Likes & Bookmarks --- */
function initLikeAndBookmark() {
  const likeBtn = document.getElementById('btn-like');
  const shareBtn = document.getElementById('btn-share');

  if (likeBtn) {
    const pageId = window.location.pathname;
    const isLiked = localStorage.getItem(`liked_${pageId}`) === 'true';
    const countSpan = likeBtn.querySelector('.like-count');

    let count = parseInt(countSpan?.textContent || '42', 10);
    if (isLiked) {
      likeBtn.classList.add('active');
    }

    likeBtn.addEventListener('click', () => {
      const currentlyLiked = likeBtn.classList.contains('active');
      if (currentlyLiked) {
        likeBtn.classList.remove('active');
        count--;
        localStorage.removeItem(`liked_${pageId}`);
        showToast('Like removed');
      } else {
        likeBtn.classList.add('active');
        count++;
        localStorage.setItem(`liked_${pageId}`, 'true');
        showToast('Thanks for liking this article!');
      }
      if (countSpan) countSpan.textContent = count;
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url: window.location.href
          });
        } catch (err) {
          // ignore abort
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Article URL copied to clipboard! 📋');
      }
    });
  }
}

/* --- Comment Submission --- */
function initComments() {
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');
  const commentList = document.getElementById('comment-list');
  const commentCount = document.getElementById('comment-count');

  if (!commentForm || !commentList) return;

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = commentText.value.trim();
    if (!text) return;

    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.style.animation = 'fadeIn 0.4s ease-out';
    newComment.innerHTML = `
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="User Avatar" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-meta">
          <span class="comment-author">You</span>
          <span class="comment-time">Just now</span>
        </div>
        <p class="comment-text">${escapeHtml(text)}</p>
      </div>
    `;

    commentList.prepend(newComment);
    commentText.value = '';

    if (commentCount) {
      const current = parseInt(commentCount.textContent || '0', 10);
      commentCount.textContent = `${current + 1}`;
    }

    showToast('Your comment has been posted!');
  });
}

/* --- Newsletter --- */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`Subscribed ${input.value} to daily market briefings! 🚀`);
        input.value = '';
      }
    });
  });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show-mobile');
    });
  }
}

/* --- Toast Notification Helper --- */
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.textContent = string;
  return div.innerHTML;
}
