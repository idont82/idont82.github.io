(function() {
  var promoCards = [
    {
      href: "https://link.coupang.com/a/dGEed4tyq4",
      image: "https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/vendor_inventory/1529/3eb602a2c9654be947b0c5e670d64e986893f7e28af7c3a7c09273e7e5ff.jpg",
      alt: "레빗 미니 인형뽑기 기계",
      title: "집에서 해보는 입문형 미니 인형뽑기",
      copy: "매장 가기 전에 뽑기 감각을 가볍게 익혀보고 싶을 때 보기 좋은 가정용 입문형입니다.",
      price: "현재가 28,030원 · 리뷰 72개",
      cta: "집에서 해보기"
    },
    {
      href: "https://link.coupang.com/a/dGEmEV6pwq",
      image: "https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/vendor_inventory/bd8a/ccc9a7c03533846ff0ced660ce231ca9222148414a22d40dfd03c3348be5.png",
      alt: "인형뽑기 가챠 소형 가정용 키덜트 기계",
      title: "키덜트 감성 가정용 인형뽑기",
      copy: "집에서도 매장 같은 분위기로 즐기고 싶을 때 보는 소형 가챠형 모델입니다.",
      price: "현재가 385,900원 · 리뷰 13개",
      cta: "미니 기계 보기"
    },
    {
      href: "https://link.coupang.com/a/dGEhqsQovI",
      image: "https://thumbnail.coupangcdn.com/thumbnails/remote/657x657q90trim/image/vendor_inventory/7d5a/241126032a8b641f58a2e62b0a2b93471332c05dff5eb6bbaeef450c79f4.jpeg",
      alt: "YONO 미니 인형뽑기 장난감 크레인 게임기",
      title: "아이랑 같이 보는 미니 크레인 게임기",
      copy: "생일 선물이나 집콕 놀이용으로 무난하게 보기 좋은 유아·아동용 크레인 게임기입니다.",
      price: "현재가 38,500원 · 리뷰 1개",
      cta: "연습용 제품 보기"
    }
  ];

  function buildGoogleMapsDirectionsUrl(origin, destination, waypoints) {
    var params = new URLSearchParams({
      api: "1",
      origin: origin || "My Location",
      destination: destination,
      travelmode: "walking"
    });
    if (waypoints && waypoints.length) {
      params.set("waypoints", waypoints.join("|"));
    }
    return "https://www.google.com/maps/dir/?" + params.toString();
  }

  function getAreaGoogleMapsUrl(detail) {
    var addresses = (detail.spots || [])
      .map(function(spot) { return spot.address; })
      .filter(Boolean)
      .filter(function(address, index, arr) { return arr.indexOf(address) === index; });
    if (addresses.length < 2) {
      return null;
    }
    return buildGoogleMapsDirectionsUrl("", addresses[addresses.length - 1], addresses.slice(0, -1));
  }

  function renderPromoCard() {
    var picked = promoCards[Math.floor(Math.random() * promoCards.length)];
    return '' +
      '<div class="inline-coupang-card">' +
        '<a href="' + picked.href + '" target="_blank" rel="noopener" referrerpolicy="unsafe-url">' +
          '<img class="promo-thumb" src="' + picked.image + '" alt="' + picked.alt + '">' +
        '</a>' +
        '<p class="promo-title">' + picked.title + '</p>' +
        '<p class="promo-copy">' + picked.copy + '</p>' +
        '<p class="promo-price">' + picked.price + '</p>' +
        '<a class="promo-link" href="' + picked.href + '" target="_blank" rel="noopener" referrerpolicy="unsafe-url">' + picked.cta + '</a>' +
        '<p class="promo-disclosure">쿠팡 파트너스 활동의 일환으로<br>일정액의 수수료를 제공받을 수 있습니다</p>' +
      '</div>';
  }

  function renderSpotCard(spot) {
    var tags = [];
    if (spot.recommended) {
      tags.push("추천");
    }
    if (spot.size) {
      tags.push(spot.size);
    }
    if (spot.hours) {
      tags.push("운영 확인");
    }

    return '' +
      '<article class="spot-card' + (spot.recommended ? ' recommended' : '') + '">' +
        '<div class="spot-top">' +
          '<div>' +
            '<h3>' + spot.name + '</h3>' +
            '<div class="spot-tags">' + tags.map(function(tag) { return '<span class="spot-tag">' + tag + '</span>'; }).join('') + '</div>' +
          '</div>' +
        '</div>' +
        (spot.address ? '<p class="spot-address">📍 ' + spot.address + '</p>' : '') +
        (spot.hours ? '<p class="spot-hours">운영시간: ' + spot.hours + '</p>' : '') +
        (spot.comment ? '<p class="spot-copy">' + spot.comment + '</p>' : '') +
        (spot.address ? '<div class="spot-links"><a class="spot-map-link" href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(spot.address) + '" target="_blank" rel="noopener">구글맵 길찾기</a></div>' : '') +
      '</article>';
  }

  function renderArea(detail, summary) {
    var root = document.getElementById("areaPageRoot");
    var heroLead = document.getElementById("areaHeroLead");
    var heroMeta = document.getElementById("areaHeroMeta");
    var heroMap = document.getElementById("areaHeroMap");
    if (!root) {
      return;
    }

    if (heroLead && summary && summary.summary) {
      heroLead.textContent = summary.summary;
    }
    if (heroMeta) {
      var metaBits = [];
      metaBits.push("🏪 " + (detail.spots ? detail.spots.length : 0) + "곳");
      if (summary && summary.totalDistance) {
        metaBits.push("🚶 " + summary.totalDistance);
      }
      if (summary && summary.radius) {
        metaBits.push("📍 " + summary.radius);
      }
      if (summary && summary.totalMachines) {
        metaBits.push("🧸 약 " + summary.totalMachines + "대");
      }
      heroMeta.innerHTML = metaBits.map(function(bit) { return "<span>" + bit + "</span>"; }).join("");
    }
    if (heroMap && detail.route && detail.route.mapImage) {
      heroMap.innerHTML = '<img src="../' + detail.route.mapImage + '" alt="' + detail.name + ' 지도">';
    }

    var routeUrl = getAreaGoogleMapsUrl(detail);
    var spots = detail.spots || [];
    var promoIndex = Math.max(1, Math.ceil(spots.length / 2));
    var spotMarkup = "";
    spots.forEach(function(spot, index) {
      spotMarkup += renderSpotCard(spot);
      if (index + 1 === promoIndex) {
        spotMarkup += renderPromoCard();
      }
    });

    root.innerHTML = '' +
      '<section class="section-grid">' +
        '<section class="quick-card">' +
          '<h2 class="section-title">먼저 이렇게 보면 편합니다</h2>' +
          '<ul>' +
            '<li>' + detail.station + ' ' + detail.exit + ' 기준으로 메인 동선부터 훑고, 끝쪽 매장은 마지막에 붙여 보세요.</li>' +
            '<li>처음 가는 지역이면 추천 표시가 있는 매장부터 먼저 보고, 그다음 중형 매장으로 넓히면 덜 헤맵니다.</li>' +
            '<li>지점 운영시간은 바뀔 수 있으니, 늦은 시간 방문이면 길찾기 전에 한 번 더 확인하는 편이 안전합니다.</li>' +
          '</ul>' +
        '</section>' +
        '<section class="route-card">' +
          '<h2 class="section-title">도보 이동 경로</h2>' +
          '<ol>' + (detail.route.steps || []).map(function(step) { return '<li>' + step + '</li>'; }).join('') + '</ol>' +
          (detail.route.totalDistance ? '<div class="route-distance">총 거리: ' + detail.route.totalDistance + '</div>' : '') +
          '<div class="route-actions">' +
            (routeUrl ? '<a class="route-btn" href="' + routeUrl + '" target="_blank" rel="noopener">구글맵 전체 코스</a>' : '') +
            '<a class="route-btn secondary" href="../claw-machine-guide.html#' + detail.id + '">기존 상세 보기</a>' +
          '</div>' +
        '</section>' +
        '<section class="spot-list">' + spotMarkup + '</section>' +
        '<section class="promo-frame-card">' +
          '<h2 class="section-title">같이 보면 좋은 추천 상품</h2>' +
          '<p class="ad-copy">매장 투어 전후로 집에서도 가볍게 볼 만한 관련 상품을 함께 확인해보세요.</p>' +
          '<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&amp;template=carousel&amp;trackingCode=AF7523287&amp;subId=&amp;width=300&amp;height=250&amp;tsource=" width="300" height="250" frameborder="0" scrolling="no" referrerpolicy="unsafe-url" browsingtopics title="쿠팡 파트너스 관심 배너"></iframe>' +
          '<p class="ad-disclosure">쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.</p>' +
        '</section>' +
        '<section class="faq-card">' +
          '<h2 class="section-title">' + detail.name + ' 인형뽑기 FAQ</h2>' +
          '<div class="faq-item"><h3>처음 가면 어디부터 보면 좋을까요?</h3><p>' + detail.station + ' ' + detail.exit + ' 기준으로 메인 동선에 붙은 추천 매장부터 먼저 보면 전체 분위기를 파악하기 쉽습니다.</p></div>' +
          '<div class="faq-item"><h3>짧게 보고 나오려면 몇 곳만 보면 될까요?</h3><p>보통 추천 매장 2~3곳과 근처 중형 매장 1곳 정도만 봐도 지역 분위기는 충분히 확인할 수 있습니다.</p></div>' +
          '<div class="faq-item"><h3>서울 전체 코스로도 이어서 볼 수 있나요?</h3><p>가능합니다. 아래 버튼으로 서울 전체 허브 페이지에 돌아가면 다른 지역 코스까지 이어서 볼 수 있습니다.</p></div>' +
          '<a class="hero-cta" href="../claw-machine-guide.html">서울 전체 가이드 보기</a>' +
        '</section>' +
      '</section>';
  }

  Promise.all([
    fetch("../data/areas.json").then(function(res) { return res.json(); }),
    fetch("../data/" + document.body.dataset.areaId + ".json").then(function(res) { return res.json(); })
  ]).then(function(results) {
    var areas = results[0].areas || [];
    var detail = results[1];
    var summary = areas.find(function(area) { return area.id === detail.id; }) || null;
    renderArea(detail, summary);
  }).catch(function() {
    var root = document.getElementById("areaPageRoot");
    if (root) {
      root.innerHTML = '<section class="quick-card"><h2 class="section-title">정보를 불러오지 못했습니다</h2><p class="promo-copy">잠시 뒤 다시 열어보거나, 서울 전체 가이드에서 같은 지역을 확인해보세요.</p><div class="route-actions"><a class="route-btn" href="../claw-machine-guide.html">서울 전체 가이드 보기</a></div></section>';
    }
  });
})();
