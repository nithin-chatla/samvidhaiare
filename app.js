// Samvidha Deep Linking & Event Landing Engine
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const urlParams = new URLSearchParams(window.location.search);
  let eventId = urlParams.get('id') || '';

  // Handle path-based routing e.g. /e/eventId or /event/eventId
  if (!eventId) {
    const pathParts = window.location.pathname.split('/').filter(p => p.length > 0);
    if (pathParts.length >= 2 && (pathParts[0] === 'e' || pathParts[0] === 'event')) {
      eventId = pathParts[1];
    }
  }

  // Pre-load from query parameters if available
  const paramTitle = urlParams.get('title');
  const paramSubtitle = urlParams.get('sub') || urlParams.get('subtitle');
  const paramDate = urlParams.get('date');
  const paramVenue = urlParams.get('venue') || urlParams.get('loc');
  const paramCategory = urlParams.get('cat') || urlParams.get('category');
  const paramClub = urlParams.get('club');
  const paramDesc = urlParams.get('desc');
  const paramImage = urlParams.get('img') || urlParams.get('image');

  if (paramTitle) {
    document.getElementById('event-title').textContent = decodeURIComponent(paramTitle);
    document.title = `${decodeURIComponent(paramTitle)} | Samvidha`;
  }
  if (paramSubtitle) document.getElementById('event-subtitle').textContent = decodeURIComponent(paramSubtitle);
  if (paramDate) document.getElementById('event-date').textContent = decodeURIComponent(paramDate);
  if (paramVenue) document.getElementById('event-venue').textContent = decodeURIComponent(paramVenue);
  if (paramCategory) document.getElementById('event-category').textContent = decodeURIComponent(paramCategory).toUpperCase();
  if (paramDesc) document.getElementById('event-description').textContent = decodeURIComponent(paramDesc);
  if (paramClub) {
    const clubEl = document.getElementById('event-club');
    clubEl.textContent = decodeURIComponent(paramClub);
    clubEl.style.display = 'inline-block';
  }
  if (paramImage) {
    const imgEl = document.getElementById('event-image');
    imgEl.src = decodeURIComponent(paramImage);
    imgEl.style.display = 'block';
    document.getElementById('poster-placeholder').style.display = 'none';
  }

  // Render QR Code for the current URL
  renderQRCode(window.location.href);

  // If eventId exists, fetch live details from Firebase Firestore
  if (eventId) {
    fetchFirestoreEvent(eventId);
  }

  // Deep Link Trigger Logic
  function triggerDeepLink() {
    const customScheme = `samvidha://event?id=${encodeURIComponent(eventId)}`;
    const androidIntent = `intent://event?id=${encodeURIComponent(eventId)}#Intent;scheme=samvidha;package=com.zyratech.samvidha;end`;

    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isAndroid) {
      // Use Android Intent URL for reliable package redirection
      window.location.href = androidIntent;
      setTimeout(() => {
        window.location.href = customScheme;
      }, 500);
    } else if (isIOS) {
      window.location.href = customScheme;
    } else {
      // Desktop / Other: prompt deep link or copy
      window.location.href = customScheme;
      showToast('Opening Samvidha App...');
    }
  }

  // Auto trigger deep link on mobile browsers if opened with an event ID
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && eventId && !urlParams.get('noredirect')) {
    // Soft delay to allow page render
    setTimeout(() => {
      triggerDeepLink();
    }, 600);
  }

  // Button Listeners
  const openAppBtn = document.getElementById('open-app-btn');
  if (openAppBtn) openAppBtn.addEventListener('click', triggerDeepLink);

  const headerBtn = document.getElementById('header-open-app-btn');
  if (headerBtn) headerBtn.addEventListener('click', triggerDeepLink);

  const copyBtn = document.getElementById('copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('Event link copied to clipboard!');
      }).catch(() => {
        showToast('Copied: ' + window.location.href);
      });
    });
  }
});

// Fetch Firestore Event Data using Firestore REST API
async function fetchFirestoreEvent(docId) {
  // Samvidha Community Firestore Project
  const projectId = 'samvidha-community'; 
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/events/${docId}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return;

    const data = await response.json();
    if (!data || !data.fields) return;

    const fields = data.fields;
    const title = fields.title?.stringValue || 'Campus Event';
    const subtitle = fields.subtitle?.stringValue || '';
    const desc = fields.description?.stringValue || 'No description provided.';
    const location = fields.location?.stringValue || 'IARE Campus';
    const category = fields.category?.stringValue || 'CAMPUS EVENT';
    const club = fields.club_name?.stringValue || '';
    const imageUrl = fields.image_url?.stringValue || '';
    const isTeam = fields.is_team_event?.booleanValue;
    const minTeam = fields.min_team_size?.integerValue || 1;
    const maxTeam = fields.max_team_size?.integerValue || 4;

    let dateStr = 'Upcoming';
    if (fields.date?.timestampValue) {
      const d = new Date(fields.date.timestampValue);
      dateStr = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }

    document.getElementById('event-title').textContent = title;
    document.title = `${title} | Samvidha IARE`;
    if (subtitle) document.getElementById('event-subtitle').textContent = subtitle;
    document.getElementById('event-venue').textContent = location;
    document.getElementById('event-category').textContent = category.toUpperCase();
    document.getElementById('event-date').textContent = dateStr;
    document.getElementById('event-description').textContent = desc;

    if (club) {
      const clubEl = document.getElementById('event-club');
      clubEl.textContent = club;
      clubEl.style.display = 'inline-block';
    }

    if (isTeam) {
      const teamMeta = document.getElementById('team-meta');
      teamMeta.style.display = 'flex';
      document.getElementById('event-format').textContent = `Team (${minTeam}-${maxTeam})`;
    }

    if (imageUrl) {
      const imgEl = document.getElementById('event-image');
      imgEl.src = imageUrl;
      imgEl.style.display = 'block';
      document.getElementById('poster-placeholder').style.display = 'none';
    }
  } catch (err) {
    console.warn('Could not fetch Firestore document:', err);
  }
}

// QR Code Generator
function renderQRCode(targetUrl) {
  const qrBox = document.getElementById('qrcode');
  if (!qrBox) return;
  qrBox.innerHTML = '';
  try {
    new QRCode(qrBox, {
      text: targetUrl,
      width: 160,
      height: 160,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (e) {
    console.error('QR rendering error', e);
  }
}

// Toast notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
