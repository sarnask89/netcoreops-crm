import { ac as useNuxtApp } from './server.mjs';

function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}

export { useRequestEvent as a, useRequestFetch as u };
