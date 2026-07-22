"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

  mediaQuery.addEventListener("change", callback);

  return () => {
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot() {
  /*
   * Saat SSR diasumsikan desktop.
   * Setelah hydration, React membaca
   * ukuran layar sebenarnya.
   */
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
