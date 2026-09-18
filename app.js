// Samvidha Instant Deep-Link Bridge Engine
(function () {
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

  // Construct target deep link URIs
  let customSchemeUri = 'samvidha://app';
  let intentUri = 'intent://app#Intent;scheme=samvidha;package=com.zyratech.samvidha;end';

  if (eventId) {
    customSchemeUri = `samvidha://event?id=${encodeURIComponent(eventId)}`;
    intentUri = `intent://event?id=${encodeURIComponent(eventId)}#Intent;scheme=samvidha;package=com.zyratech.samvidha;end`;
  } else if (route) {
    customSchemeUri = `samvidha://${route}`;
    intentUri = `intent://${route}#Intent;scheme=samvidha;package=com.zyratech.samvidha;end`;
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

  function executeRedirect() {
    if (isAndroid) {
      window.location.href = intentUri;
      setTimeout(() => {
        window.location.href = customSchemeUri;
      }, 300);
    } else if (isIOS) {
      window.location.href = customSchemeUri;
    } else {
      window.location.href = customSchemeUri;
    }
  }

  // Auto-launch deep link immediately on mobile
  if (isMobile && !urlParams.get('noredirect')) {
    executeRedirect();

    // If still on page after 2.5 seconds, user probably doesn't have the app
    setTimeout(() => {
      const statusEl = document.getElementById('redirect-status');
      const redirectBox = document.getElementById('redirect-box');
      if (statusEl && redirectBox) {
        statusEl.textContent = 'Tap below to download from Google Play';
        redirectBox.style.color = '#34d399';
      }
    }, 2500);
  } else {
    // Desktop: Show QR Code
    const statusEl = document.getElementById('redirect-status');
    if (statusEl) {
      statusEl.textContent = 'Scan QR or open on your Android phone';
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
