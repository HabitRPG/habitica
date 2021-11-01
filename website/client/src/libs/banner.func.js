export function isBannerHidden (bannerId) {
  return window.sessionStorage.getItem(`hide-banner-${bannerId}`) === 'true';
}

export function hideBanner (bannerId) {
  window.sessionStorage.setItem(`hide-banner-${bannerId}`, 'true');
}

export function clearBannerSetting (bannerId) {
  window.sessionStorage.removeItem(`hide-banner-${bannerId}`);
}

export function updateBannerHeight (bannerId, bannerHeight) {
  document.documentElement.style
    .setProperty(`--banner-${bannerId}-height`, bannerHeight);
}

export function getBannerHeight (bannerId) {
  const heightProp = document.documentElement.style
    .getPropertyValue(`--banner-${bannerId}-height`);

  if (heightProp?.includes('rem')) {
    return Number(heightProp.replace('rem', '') * 16); // FontSize
  }

  // || if the left side is an empty string
  return Number(heightProp?.replace('px', '') || 0);
}
