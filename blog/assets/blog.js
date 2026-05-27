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
    const stationPoints = areaId === 'hongdae'
      ? [
          { name: '홍대입구역', lat: 37.557192, lng: 126.92449, className: 'blog-station-marker blog-station-marker--green', emoji: '🚉' },
          { name: '상수역', lat: 37.547716, lng: 126.922852, className: 'blog-station-marker blog-station-marker--brown', emoji: '🚉' }
        ]
      : [];
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
          html: '<span class="blog-spot-marker-dot">📍</span>',
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
