// Samvidha Instant Deep-Link Bridge Engine
(function () {
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.zyratech.samvidha';
  const encodedFallback = encodeURIComponent(playStoreUrl);

  const urlParams = new URLSearchParams(window.location.search);
  let eventId = urlParams.get('id') || '';
  let route = urlParams.get('route') || '';

  // Extract from path e.g. /event/:id or /e/:id
  if (!eventId) {
    const parts = window.location.pathname.split('/').filter(p => p.length > 0);
    if (parts.length >= 2 && (parts[0] === 'e' || parts[0] === 'event')) {
      eventId = parts[1];
    }
  }

  // Construct target deep link URIs with embedded Play Store fallback
  let customSchemeUri = 'samvidha://app';
  let intentUri = `intent://app#Intent;scheme=samvidha;package=com.zyratech.samvidha;S.browser_fallback_url=${encodedFallback};end`;

  if (eventId) {
    customSchemeUri = `samvidha://event?id=${encodeURIComponent(eventId)}`;
    intentUri = `intent://event?id=${encodeURIComponent(eventId)}#Intent;scheme=samvidha;package=com.zyratech.samvidha;S.browser_fallback_url=${encodedFallback};end`;
  } else if (route) {
    customSchemeUri = `samvidha://${route}`;
    intentUri = `intent://${route}#Intent;scheme=samvidha;package=com.zyratech.samvidha;S.browser_fallback_url=${encodedFallback};end`;
  }

  // Set up button link
  const openAppBtn = document.getElementById('open-app-btn');
  if (openAppBtn) {
    openAppBtn.href = customSchemeUri;
    openAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeRedirect();
    });
  }

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;

  let hasLeftPage = false;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hasLeftPage = true;
  });
  window.addEventListener('pagehide', () => { hasLeftPage = true; });
  window.addEventListener('blur', () => { hasLeftPage = true; });

  function executeRedirect() {
    if (isAndroid) {
      // 1. Trigger Android Intent (Android opens app if installed, or redirects to browser_fallback_url)
      window.location.href = intentUri;

      // 2. JavaScript fallback: if user is still on this webpage after 1.2s, forward directly to Google Play
      setTimeout(() => {
        if (!hasLeftPage && !document.hidden) {
          window.location.href = playStoreUrl;
        }
      }, 1200);
    } else if (isIOS) {
      window.location.href = customSchemeUri;
      setTimeout(() => {
        if (!hasLeftPage && !document.hidden) {
          window.location.href = playStoreUrl;
        }
      }, 1200);
    } else {
      window.location.href = customSchemeUri;
    }
  }

  // Auto-launch deep link immediately on mobile devices
  if (isMobile && !urlParams.get('noredirect')) {
    executeRedirect();
  } else {
    // Desktop: Show QR Code
    const statusEl = document.getElementById('redirect-status');
    if (statusEl) {
      statusEl.textContent = 'Scan QR on phone or download from Play Store';
    }
  }

  // Generate QR Code for desktop users
  const qrBox = document.getElementById('qrcode');
  if (qrBox && typeof QRCode !== 'undefined') {
    qrBox.innerHTML = '';
    try {
      new QRCode(qrBox, {
        text: window.location.href,
        width: 140,
        height: 140,
        colorDark: "#090d16",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      console.warn('QR Code generation skipped:', e);
    }
  }
})();
