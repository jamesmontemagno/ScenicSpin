let routes = [];

const catalogUrl = 'routes/catalog.json';
const selectedRouteStorageKey = 'scenicRideCatalog.selectedRouteId';
const defaultRecommendationId = 'bavarian-countryside-90-minute-4k';

const state = {
  selectedRoute: null,
  featuredRoute: null,
  heroMode: 'recommended',
  query: '',
  duration: 'all',
  scenery: 'all',
  intensity: 'all',
  catalogStatus: 'loading'
};

const elements = {
  heroImage: document.querySelector('#heroImage'),
  heroImageFallback: document.querySelector('#heroImageFallback'),
  heroLabel: document.querySelector('#heroLabel'),
  heroSelection: document.querySelector('#heroSelection'),
  heroMetadata: document.querySelector('#heroMetadata'),
  heroRouteButton: document.querySelector('#heroRouteButton'),
  searchInput: document.querySelector('#searchInput'),
  durationFilter: document.querySelector('#durationFilter'),
  sceneryFilter: document.querySelector('#sceneryFilter'),
  intensityFilter: document.querySelector('#intensityFilter'),
  resultCount: document.querySelector('#resultCount'),
  routeGrid: document.querySelector('#routeGrid'),
  playerShell: document.querySelector('#playerShell'),
  selectedTitle: document.querySelector('#selectedTitle'),
  selectedDescription: document.querySelector('#selectedDescription'),
  selectedMetadata: document.querySelector('#selectedMetadata'),
  startRideButton: document.querySelector('#startRideButton'),
  fullscreenButton: document.querySelector('#fullscreenButton'),
  sourceLink: document.querySelector('#sourceLink')
};

function titleCase(value) {
  if (typeof value !== 'string') return '';

  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entities[character];
  });
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return 'Unknown';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

function extractYouTubeId(route) {
  const embedMatch = route.embedUrl?.match(/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  try {
    const source = new URL(route.sourceUrl);
    return source.searchParams.get('v') || source.pathname.split('/').filter(Boolean).pop();
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
  if (!videoId) return '';
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/${quality}.jpg`;
}

function readStoredRouteId() {
  try {
    return sessionStorage.getItem(selectedRouteStorageKey) || localStorage.getItem(selectedRouteStorageKey);
  } catch {
    return null;
  }
}

function saveSelectedRouteId(routeId) {
  try {
    sessionStorage.setItem(selectedRouteStorageKey, routeId);
    localStorage.setItem(selectedRouteStorageKey, routeId);
  } catch {
    // Storage can be disabled; selection still works for the current page.
  }
}

function isYouTubeRoute(route) {
  return route.sourcePlatform === 'youtube' || /youtu\.?be|youtube(-nocookie)?\.com/.test(`${route.sourceUrl || ''} ${route.embedUrl || ''}`);
}

function normalizeRoute(route) {
  const sceneryTags = Array.isArray(route.sceneryTags) ? route.sceneryTags : [];
  const difficulty = route.difficulty ? titleCase(route.difficulty) : 'Unrated';
  const youtubeRoute = isYouTubeRoute(route);
  const videoId = youtubeRoute ? extractYouTubeId(route) : null;
  const thumbnailUrl = route.thumbnailUrl || route.imageUrl || getYouTubeThumbnail(videoId, 'hqdefault');
  const thumbnailFallbackUrl = youtubeRoute && videoId ? getYouTubeThumbnail(videoId, 'mqdefault') : '';

  return {
    ...route,
    durationLabel: formatDuration(route.durationMinutes),
    scenery: sceneryTags[0] ? titleCase(sceneryTags[0]) : 'Scenic',
    sceneryTags,
    intensity: difficulty,
    sourceType: route.sourcePlatform || 'external',
    videoId,
    thumbnailUrl,
    thumbnailFallbackUrl,
    description: `${route.terrain || 'Scenic cycling route'} • ${route.creator || 'Public video source'}`
  };
}

function setControlsDisabled(disabled) {
  [
    elements.searchInput,
    elements.durationFilter,
    elements.sceneryFilter,
    elements.intensityFilter,
    elements.fullscreenButton
  ].forEach((element) => {
    element.disabled = disabled;
  });
}

function uniqueValues(key) {
  return [...new Set(routes.map((route) => route[key]).filter(Boolean))].sort();
}

function uniqueSceneryTags() {
  return [...new Set(routes.flatMap((route) => route.sceneryTags).filter(Boolean))].sort();
}

function resetFilter(select, label) {
  select.innerHTML = `<option value="all">${label}</option>`;
}

function populateFilter(select, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = titleCase(value);
    select.append(option);
  });
}

function populateFilters() {
  resetFilter(elements.sceneryFilter, 'Any scenery');
  resetFilter(elements.intensityFilter, 'Any intensity');
  populateFilter(elements.sceneryFilter, uniqueSceneryTags());
  populateFilter(elements.intensityFilter, uniqueValues('intensity'));
}

function durationMatches(route) {
  if (state.duration === 'short') return route.durationMinutes < 20;
  if (state.duration === 'standard') return route.durationMinutes >= 20 && route.durationMinutes < 60;
  if (state.duration === 'long') return route.durationMinutes >= 60;
  return true;
}

function routeMatches(route) {
  const haystack = [
    route.title,
    route.description,
    route.location,
    route.terrain,
    route.creator,
    route.videoQuality,
    route.audio,
    route.cameraStyle,
    route.sceneryTags.join(' '),
    route.intensity
  ]
    .join(' ')
    .toLowerCase();

  return (
    haystack.includes(state.query) &&
    durationMatches(route) &&
    (state.scenery === 'all' || route.sceneryTags.includes(state.scenery)) &&
    (state.intensity === 'all' || route.intensity === state.intensity)
  );
}

function renderStatus(message, detail = '') {
  elements.routeGrid.innerHTML = `
    <div class="empty-state">
      <strong>${escapeHtml(message)}</strong>
      ${detail ? `<span>${escapeHtml(detail)}</span>` : ''}
    </div>
  `;
}

function setHeroImage(route) {
  const image = elements.heroImage;
  const fallback = elements.heroImageFallback;
  image.hidden = !route.thumbnailUrl;
  fallback.hidden = Boolean(route.thumbnailUrl);
  fallback.textContent = route.scenery || 'Ride';

  if (!route.thumbnailUrl) {
    image.removeAttribute('src');
    image.removeAttribute('data-fallback');
    image.alt = '';
    return;
  }

  image.src = route.thumbnailUrl;
  image.dataset.fallback = route.thumbnailFallbackUrl;
  image.alt = `Preview image for ${route.title}`;
}

function renderHeroRoute() {
  const route = state.featuredRoute;

  if (!route) {
    elements.heroLabel.innerHTML = '<span class="status-dot" aria-hidden="true"></span> Loading catalog ride';
    elements.heroSelection.textContent = 'Choose a route below';
    elements.heroMetadata.textContent = '';
    elements.heroRouteButton.disabled = true;
    elements.heroRouteButton.textContent = 'Start this ride';
    elements.heroRouteButton.removeAttribute('aria-label');
    elements.heroImage.hidden = true;
    elements.heroImageFallback.hidden = false;
    elements.heroImageFallback.textContent = 'Ride';
    return;
  }

  const isContinue = state.heroMode === 'continue';
  elements.heroLabel.innerHTML = `<span class="status-dot" aria-hidden="true"></span> ${isContinue ? 'Continue ride' : 'Recommended first ride'}`;
  elements.heroSelection.textContent = route.title;
  elements.heroMetadata.textContent = `${route.location} · ${route.durationLabel} · ${route.intensity} · from routes/catalog.json`;
  elements.heroRouteButton.disabled = false;
  elements.heroRouteButton.textContent = isContinue ? 'Continue this ride' : 'Start recommended ride';
  elements.heroRouteButton.setAttribute('aria-label', `${elements.heroRouteButton.textContent}: ${route.title}`);
  setHeroImage(route);
}

function chooseFeaturedRoute() {
  const storedRouteId = readStoredRouteId();
  const storedRoute = routes.find((route) => route.id === storedRouteId);
  if (storedRoute) {
    return { route: storedRoute, mode: 'continue' };
  }

  const recommendedRoute =
    routes.find((route) => route.id === defaultRecommendationId) ||
    routes.find((route) => route.embeddingAllowed && route.sourceType === 'youtube') ||
    routes[0];

  return { route: recommendedRoute, mode: 'recommended' };
}

function setFeaturedRoute(route, mode = 'recommended') {
  state.featuredRoute = route;
  state.heroMode = mode;
  renderHeroRoute();
}

function renderCatalog() {
  elements.routeGrid.innerHTML = '';

  if (state.catalogStatus === 'loading') {
    elements.resultCount.textContent = 'Loading…';
    renderStatus('Loading curated routes…');
    return;
  }

  if (state.catalogStatus === 'error') {
    elements.resultCount.textContent = 'Catalog unavailable';
    renderStatus('Could not load routes/catalog.json.', 'Run the app through the local server and try again.');
    return;
  }

  if (routes.length === 0) {
    elements.resultCount.textContent = '0 rides';
    renderStatus('No routes are available yet.', 'Add entries to routes/catalog.json to populate the catalog.');
    return;
  }

  const visibleRoutes = routes.filter(routeMatches);
  elements.resultCount.textContent = `${visibleRoutes.length} ride${visibleRoutes.length === 1 ? '' : 's'}`;

  if (visibleRoutes.length === 0) {
    renderStatus('No routes match these filters.', 'Try a different duration, scenery, intensity, or search term.');
    return;
  }

  visibleRoutes.forEach((route) => {
    const card = document.createElement('article');
    const tags = route.sceneryTags
      .slice(0, 2)
      .map((tag) => `<li>${escapeHtml(titleCase(tag))}</li>`)
      .join('');
    card.className = `route-card ${state.selectedRoute?.id === route.id ? 'selected-card' : ''}`;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', state.selectedRoute?.id === route.id ? 'true' : 'false');
    card.setAttribute('aria-label', `Select ${route.title}, ${route.durationLabel}, ${route.location}`);
    card.innerHTML = `
      <div class="card-art">
        ${
          route.thumbnailUrl
            ? `<img src="${escapeHtml(route.thumbnailUrl)}" alt="Scenic preview for ${escapeHtml(route.title)}" loading="lazy" data-fallback="${escapeHtml(route.thumbnailFallbackUrl)}">`
            : `<span aria-hidden="true">${escapeHtml(route.scenery)}</span>`
        }
        <span class="card-badge">${escapeHtml(route.videoQuality || 'Video')}</span>
      </div>
      <div class="card-body">
        <p class="route-location">${escapeHtml(route.location)}</p>
        <h3>${escapeHtml(route.title)}</h3>
        <ul class="pill-list" aria-label="Route metadata">
          <li>${escapeHtml(route.durationLabel)}</li>
          <li>${escapeHtml(route.intensity)}</li>
          ${tags}
        </ul>
        <span class="card-cta" aria-hidden="true">Preview ride →</span>
      </div>
    `;

    card.querySelector('img')?.addEventListener('error', (event) => {
      const fallback = event.currentTarget.dataset.fallback;
      if (fallback && event.currentTarget.src !== fallback) {
        event.currentTarget.src = fallback;
      }
    });
    card.addEventListener('click', () => selectRoute(route.id, true));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectRoute(route.id, true);
      }
    });
    elements.routeGrid.append(card);
  });
}

function clearSelectedRoute(message = 'Choose a scenic ride card above. The player supports YouTube embeds, fullscreen mode, and source links for browser fallback.') {
  state.selectedRoute = null;
  elements.selectedTitle.textContent = 'No route selected';
  elements.selectedDescription.textContent = message;
  elements.selectedMetadata.innerHTML = '';
  elements.startRideButton.disabled = true;
  elements.sourceLink.href = '#';
  elements.sourceLink.classList.add('disabled-link');
  elements.sourceLink.removeAttribute('aria-label');
  elements.playerShell.innerHTML = `
    <div class="player-placeholder">
      <span aria-hidden="true">▶</span>
      <p>Select a route to load the ride video.</p>
    </div>
  `;
}

function renderSelectedRoute() {
  const route = state.selectedRoute;

  if (!route) {
    clearSelectedRoute();
    return;
  }

  elements.selectedTitle.textContent = route.title;
  elements.selectedDescription.textContent = route.curationNotes || route.description;
  elements.selectedMetadata.innerHTML = `
    <div><dt>Duration</dt><dd>${escapeHtml(route.durationLabel)}</dd></div>
    <div><dt>Difficulty</dt><dd>${escapeHtml(route.intensity)}</dd></div>
    <div><dt>Terrain</dt><dd>${escapeHtml(route.terrain || 'Not specified')}</dd></div>
    <div><dt>Location</dt><dd>${escapeHtml(route.location)}</dd></div>
    <div><dt>Creator</dt><dd>${escapeHtml(route.creator || 'Unknown')}</dd></div>
    <div><dt>Video</dt><dd>${escapeHtml(route.videoQuality || 'Unknown')} · ${escapeHtml(route.audio || 'Audio varies')}</dd></div>
  `;
  elements.startRideButton.disabled = !route.embeddingAllowed;
  elements.sourceLink.href = route.sourceUrl;
  elements.sourceLink.classList.remove('disabled-link');
  elements.sourceLink.setAttribute('aria-label', `Open source video for ${route.title}`);
}

function loadPlayer(route, autoplay = false) {
  elements.playerShell.innerHTML = '';

  if (!route.embeddingAllowed) {
    elements.playerShell.innerHTML = '<p class="player-message">Embedding is not marked as allowed for this route. Use Open source instead.</p>';
    return;
  }

  if (route.sourceType === 'youtube' && route.videoId) {
    const iframe = document.createElement('iframe');
    iframe.title = `${route.title} ride video`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
    iframe.allowFullscreen = true;
    iframe.src = `${route.embedUrl || `https://www.youtube-nocookie.com/embed/${route.videoId}`}?rel=0&modestbranding=1&playsinline=1${autoplay ? '&autoplay=1' : ''}`;
    elements.playerShell.append(iframe);
    return;
  }

  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.src = route.sourceUrl;
  elements.playerShell.append(video);
}

function selectRoute(routeId, moveToPlayer = false, options = {}) {
  const { persist = true, updateHero = true } = options;
  const selectedRoute = routes.find((route) => route.id === routeId);
  if (!selectedRoute) return;

  state.selectedRoute = selectedRoute;
  if (persist) saveSelectedRouteId(selectedRoute.id);
  if (updateHero) setFeaturedRoute(selectedRoute, 'continue');
  renderSelectedRoute();
  loadPlayer(state.selectedRoute);
  renderCatalog();

  if (moveToPlayer) {
    document.querySelector('#player').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

async function requestFullscreen() {
  const target = elements.playerShell;
  if (target.requestFullscreen) {
    await target.requestFullscreen();
  } else if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen();
  }
}

function startRide() {
  if (!state.selectedRoute) return;
  saveSelectedRouteId(state.selectedRoute.id);
  setFeaturedRoute(state.selectedRoute, 'continue');
  loadPlayer(state.selectedRoute, true);
  requestFullscreen().catch(() => {
    elements.sourceLink.focus();
  });
}

function startHeroRoute() {
  if (!state.featuredRoute) return;
  selectRoute(state.featuredRoute.id, true);
  startRide();
}

function bindEvents() {
  elements.heroImage.addEventListener('error', (event) => {
    const fallback = event.currentTarget.dataset.fallback;
    if (fallback && event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
      return;
    }

    event.currentTarget.hidden = true;
    elements.heroImageFallback.hidden = false;
  });
  elements.heroRouteButton.addEventListener('click', startHeroRoute);

  elements.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

  elements.durationFilter.addEventListener('change', (event) => {
    state.duration = event.target.value;
    renderCatalog();
  });

  elements.sceneryFilter.addEventListener('change', (event) => {
    state.scenery = event.target.value;
    renderCatalog();
  });

  elements.intensityFilter.addEventListener('change', (event) => {
    state.intensity = event.target.value;
    renderCatalog();
  });

  elements.startRideButton.addEventListener('click', startRide);
  elements.fullscreenButton.addEventListener('click', () => {
    if (!state.selectedRoute && routes.length > 0) selectRoute(routes[0].id);
    if (!state.selectedRoute) return;

    requestFullscreen().catch(() => {
      elements.sourceLink.focus();
    });
  });
}

async function loadCatalog() {
  state.catalogStatus = 'loading';
  setControlsDisabled(true);
  clearSelectedRoute('Loading curated routes from routes/catalog.json…');
  renderCatalog();

  try {
    const response = await fetch(catalogUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);

    const catalog = await response.json();
    routes = Array.isArray(catalog.routes) ? catalog.routes.map(normalizeRoute) : [];
    state.catalogStatus = 'ready';
    populateFilters();
    setControlsDisabled(routes.length === 0);
    renderCatalog();

    if (routes.length > 0) {
      const featured = chooseFeaturedRoute();
      setFeaturedRoute(featured.route, featured.mode);
      selectRoute(featured.route.id, false, { persist: featured.mode === 'continue', updateHero: false });
    } else {
      setFeaturedRoute(null);
      clearSelectedRoute('routes/catalog.json loaded, but it does not contain any routes yet.');
    }
  } catch (error) {
    console.error(error);
    routes = [];
    state.catalogStatus = 'error';
    setControlsDisabled(true);
    setFeaturedRoute(null);
    clearSelectedRoute('The route catalog could not be loaded. Start the static server and refresh.');
    renderCatalog();
  }
}

function init() {
  bindEvents();
  loadCatalog();
}

init();
