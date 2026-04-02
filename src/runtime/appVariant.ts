export type AppVariant = 'desktop' | 'mobile';

function readForcedVariant(): AppVariant | null {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get('app');

  if (forced === 'desktop' || forced === 'mobile') {
    return forced;
  }

  return null;
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 900px)').matches;
}

function isMobileUserAgent() {
  const ua = navigator.userAgent.toLowerCase();

  return /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/.test(ua);
}

function isTouchPrimaryDevice() {
  return navigator.maxTouchPoints > 1;
}

export function detectAppVariant(): AppVariant {
  const forced = readForcedVariant();

  if (forced) {
    return forced;
  }

  if (isMobileUserAgent()) {
    return 'mobile';
  }

  if (isTouchPrimaryDevice() && isMobileViewport()) {
    return 'mobile';
  }

  return 'desktop';
}
