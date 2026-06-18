let leafletAssetsPromise = null;

function loadLeafletAssets() {
  if (window.L) {
    return Promise.resolve(window.L);
  }
  if (leafletAssetsPromise) {
    return leafletAssetsPromise;
  }
  leafletAssetsPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-leaflet-blog]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.dataset.leafletBlog = 'true';
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return leafletAssetsPromise;
}

async function initAreaMap(areaId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }
  container.innerHTML = '<div class="article-map-loading">홍대 17곳 지도를 불러오는 중입니다…</div>';
  try {
    const response = await fetch(`/data/${areaId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load ${areaId}.json`);
    }
    const data = await response.json();
    const spots = (data.spots || []).filter((spot) => typeof spot.lat === 'number' && typeof spot.lng === 'number');
    const stationPoints = {
      hongdae: [
        { name: '홍대입구역', lat: 37.557192, lng: 126.92449, className: 'blog-station-marker blog-station-marker--green', emoji: '🚇' },
        { name: '상수역', lat: 37.547716, lng: 126.922852, className: 'blog-station-marker blog-station-marker--brown', emoji: '🚇' }
      ],
      yeonsinnae: [
        { name: '연신내역 6번 출구', lat: 37.619001, lng: 126.920766, className: 'blog-station-marker blog-station-marker--green', emoji: '🚇' }
      ],
      jongro: [
        { name: '종로3가역 4번 출구', lat: 37.571654, lng: 126.991004, className: 'blog-station-marker blog-station-marker--brown', emoji: '🚇' },
        { name: '종각역 4번 출구', lat: 37.570368, lng: 126.985291, className: 'blog-station-marker blog-station-marker--green', emoji: '🚇' }
      ]
    }[areaId] || [];
    if (!spots.length) {
      container.innerHTML = '<div class="article-map-loading">표시할 좌표가 없습니다.</div>';
      return;
    }
    const L = await loadLeafletAssets();
    container.innerHTML = '';
    const map = L.map(container, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    const latLngs = spots.map((spot) => [spot.lat, spot.lng]).concat(stationPoints.map((point) => [point.lat, point.lng]));
    if (areaId === 'hongdae' && stationPoints.length && spots.length) {
      const hongdaeEntrance = stationPoints.find((point) => point.name === '홍대입구역');
      const firstSpot = spots[0];
      if (hongdaeEntrance && firstSpot) {
        L.polyline(
          [
            [hongdaeEntrance.lat, hongdaeEntrance.lng],
            [firstSpot.lat, firstSpot.lng]
          ],
          {
            color: '#16a34a',
            weight: 5,
            opacity: 0.9,
            dashArray: '10 8'
          }
        ).addTo(map);
      }
    }
    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], {
        icon: L.divIcon({
          className: 'blog-spot-marker',
          html: '<span class="blog-spot-marker-dot" aria-hidden="true"></span>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
      marker.bindPopup(`<strong>${spot.name}</strong><br>${spot.address || ''}`);
    });
    stationPoints.forEach((point) => {
      const marker = L.marker([point.lat, point.lng], {
        icon: L.divIcon({
          className: point.className,
          html: `<span class="blog-station-marker-label"><span class="blog-station-marker-dot">${point.emoji}</span>${point.name}</span>`,
          iconSize: [76, 28],
          iconAnchor: [14, 14]
        })
      }).addTo(map);
      marker.bindPopup(`<strong>${point.name}</strong>`);
    });
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 17);
    } else {
      map.fitBounds(latLngs, { padding: [34, 34] });
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="article-map-loading">지도를 불러오지 못했습니다. 잠시 뒤 다시 확인해 주세요.</div>';
  }
}

function trackCoupangClick(link) {
  const href = link.href || link.getAttribute('href') || '';
  const isCoupangLink = /(?:link|www|ads-partners)\.coupang\.com/.test(href);
  if (!isCoupangLink) {
    return;
  }

  const eventParams = {
    page_path: window.location.pathname,
    link_url: href,
    coupang_placement: link.dataset.coupangPlacement || 'unknown',
    coupang_product_type: link.dataset.coupangProductType || 'unknown',
    outbound: true
  };

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'coupang_click', eventParams);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: 'coupang_click',
      ...eventParams
    });
  }
}

function initSortedBlogCards() {
  const feed = document.querySelector('.blog-card-list');
  if (!feed) {
    return;
  }

  const cards = Array.from(feed.querySelectorAll(':scope > .blog-card'));
  if (cards.length < 2) {
    return;
  }

  const datedCards = cards.map((card, index) => {
    const metaText = card.querySelector('.blog-card-meta')?.textContent || '';
    const dateMatch = metaText.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    const timestamp = dateMatch
      ? Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3]))
      : 0;
    return { card, index, timestamp };
  });

  datedCards
    .sort((a, b) => {
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return a.index - b.index;
    })
    .forEach((item) => {
      feed.appendChild(item.card);
    });
}

function initRecentPosts() {
  const recentList = document.querySelector('[data-recent-post-list]');
  if (!recentList) {
    return;
  }

  const limit = Number.parseInt(recentList.dataset.recentPostLimit || '5', 10);
  const toggleButton = document.querySelector(`[data-toggle-recent-posts][aria-controls="${recentList.id}"]`);
  const cardLinks = Array.from(document.querySelectorAll('.blog-card-link'));
  const seenHrefs = new Set();
  const recentLinks = cardLinks
    .map((cardLink) => {
      const href = cardLink.getAttribute('href');
      const title = cardLink.querySelector('h3')?.textContent?.trim();
      const label = cardLink.querySelector('.blog-card-meta')?.textContent?.split('·')?.[0]?.trim() || '글';
      if (!href || !title || seenHrefs.has(href)) {
        return null;
      }
      seenHrefs.add(href);
      return { href, title, label };
    })
    .filter(Boolean);

  function renderRecentPosts(count) {
    recentList.innerHTML = '';
    recentLinks.slice(0, count).forEach((item) => {
      const link = document.createElement('a');
      link.href = item.href;
      link.dataset.blogPath = item.href;
      link.textContent = item.title;

      const label = document.createElement('span');
      label.textContent = item.label;
      link.appendChild(label);
      recentList.appendChild(link);
    });
  }

  recentList.recentPostExpanded = false;
  renderRecentPosts(limit);

  if (!toggleButton) {
    return;
  }

  toggleButton.hidden = recentLinks.length <= limit;
  toggleButton.addEventListener('click', () => {
    recentList.recentPostExpanded = !recentList.recentPostExpanded;
    renderRecentPosts(recentList.recentPostExpanded ? recentLinks.length : limit);
    toggleButton.setAttribute('aria-expanded', recentList.recentPostExpanded ? 'true' : 'false');
    toggleButton.textContent = recentList.recentPostExpanded ? '최근 글 접기' : '최근 글 더 보기';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('blog-ready');

  initSortedBlogCards();
  initRecentPosts();

  let currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (currentPath === '/blog') {
    currentPath = '/blog/index.html';
  }
  document.querySelectorAll('[data-blog-path]').forEach((link) => {
    if (link.getAttribute('data-blog-path') === currentPath) {
      link.classList.add('is-current');
    }
  });

  const filterButtons = Array.from(document.querySelectorAll('[data-blog-filter]'));
  const filterCards = Array.from(document.querySelectorAll('[data-blog-category]'));
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedCategory = button.dataset.blogFilter;
      filterButtons.forEach((item) => {
        item.classList.toggle('is-current', item === button);
      });
      filterCards.forEach((card) => {
        const categories = (card.dataset.blogCategory || '').split(/\s+/);
        const shouldShow = selectedCategory === 'all' || categories.includes(selectedCategory);
        card.classList.toggle('is-filter-hidden', !shouldShow);
      });
    });
  });

  document.querySelectorAll('[data-toggle-mobile-nav]').forEach((button) => {
    const drawerId = button.getAttribute('aria-controls');
    const drawer = drawerId ? document.getElementById(drawerId) : null;
    if (!drawer) {
      return;
    }
    button.addEventListener('click', () => {
      const nextOpen = !drawer.classList.contains('is-open');
      drawer.hidden = !nextOpen;
      drawer.classList.toggle('is-open', nextOpen);
      button.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    });
  });

  document.querySelectorAll('[data-blog-back]').forEach((button) => {
    button.addEventListener('click', () => {
      if (window.history.length > 1 && document.referrer) {
        window.history.back();
        return;
      }
      window.location.href = '/blog/index.html';
    });
  });

  document.querySelectorAll('[data-share-page]').forEach((button) => {
    button.addEventListener('click', async () => {
      const shareData = {
        title: document.title,
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
          return;
        }
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(window.location.href);
          button.textContent = '✓';
          window.setTimeout(() => {
            button.textContent = '↗';
          }, 1200);
        }
      } catch (error) {
        console.error(error);
      }
    });
  });

  document.addEventListener('click', (event) => {
    const coupangLink = event.target.closest('a[data-coupang-link], a[href*="coupang.com"]');
    if (coupangLink) {
      trackCoupangClick(coupangLink);
    }
  });

  document.querySelectorAll('[data-card-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('img'));
    if (slides.length < 2) {
      return;
    }
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let carouselTimer = null;
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === activeIndex);
    });

    const showNextSlide = () => {
      slides[activeIndex].classList.remove('is-active');
      activeIndex = (activeIndex + 1) % slides.length;
      slides[activeIndex].classList.add('is-active');
    };
    const startCarousel = () => {
      if (carouselTimer) {
        return;
      }
      carouselTimer = window.setInterval(showNextSlide, 3000);
    };
    const stopCarousel = () => {
      if (!carouselTimer) {
        return;
      }
      window.clearInterval(carouselTimer);
      carouselTimer = null;
    };

    carousel.addEventListener('mouseenter', startCarousel);
    carousel.addEventListener('mouseleave', stopCarousel);
    carousel.addEventListener('focusin', startCarousel);
    carousel.addEventListener('focusout', stopCarousel);
  });

  const mobileTopAd = document.querySelector('[data-mobile-top-ad]');
  if (mobileTopAd) {
    let mobileTopAdOffset = mobileTopAd.getBoundingClientRect().top + window.scrollY;

    const measureMobileTopAd = () => {
      mobileTopAd.classList.remove('is-stuck');
      mobileTopAdOffset = mobileTopAd.getBoundingClientRect().top + window.scrollY;
    };

    const updateMobileTopAd = () => {
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      const threshold = pageHeight / 3;
      const shouldStick = window.innerWidth <= 760 && window.scrollY >= mobileTopAdOffset;
      mobileTopAd.classList.toggle('is-stuck', shouldStick);
      mobileTopAd.classList.toggle('is-hidden', window.scrollY > threshold);
    };

    window.setTimeout(measureMobileTopAd, 0);
    updateMobileTopAd();
    window.addEventListener('scroll', updateMobileTopAd, { passive: true });
    window.addEventListener('resize', () => {
      measureMobileTopAd();
      updateMobileTopAd();
    });
  }

  const areaMap = document.querySelector('[data-area-map]');
  if (areaMap) {
    initAreaMap(areaMap.dataset.areaMap, areaMap.id);
  }
});
