document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('blog-ready');

  let currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (currentPath === '/blog') {
    currentPath = '/blog/index.html';
  }
  document.querySelectorAll('[data-blog-path]').forEach((link) => {
    if (link.getAttribute('data-blog-path') === currentPath) {
      link.classList.add('is-current');
    }
  });
});
