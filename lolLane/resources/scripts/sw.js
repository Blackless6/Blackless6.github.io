const CACHE_NAME = "lol-lane-v1.7.1";
const URLS_TO_CACHE = [
  "./",
  "./lolLane.html",
  "./util/register.html",
  "./manifest.json",
  "./resources/css/styles.css",
  "./resources/scripts/scriptMain.js",
  "./resources/scripts/scriptRegister.js",
  "./resources/img/icon.webp",
  "./resources/img/icon_small.png",
  "./resources/img/background1.png",
  "./resources/img/background2.png",
  "./resources/img/background3.png",
  "./resources/img/background4.png",
  "./resources/img/background5.png",
  "./resources/img/background6.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});