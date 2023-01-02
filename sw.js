// are you looking for a pwa?
const cacheName = "Bilelz__COMMIT_SHA_AND_DATE_";
// prettier-ignore
const assets = ["/", "/index.html", 
                "/css/netflix.css", "/css/cube.css", "/blog/blog.css", 
                "/js/main.js",
                "/img/android/android-launchericon-96-96.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      // Add all the assets in the array to the 'Bilelz_v1'
      // `Cache` instance for later use.

      return cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (event) => {
  // return self.clients.claim();
  // Specify allowed cache keys
  const cacheAllowList = [cacheName];

  // Get all the currently active `Cache` instances.
  event.waitUntil(
    caches.keys().then((keys) => {
      // Delete all caches that aren't in the allow list:
      return Promise.all(
        keys.map((key) => {
          if (!cacheAllowList.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
    clients.forEach((client) => client.postMessage("offline OK"));
  });
});

self.addEventListener("message", (event) => {
  console.log("SW received", event.type, event.data);
});

const cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  return fetch(request);
};
// self.addEventListener("fetch", function (event) {
//   // event.respondWith(fetch(event.request));
//   event.respondWith(cacheFirst(event.request));
// });

self.addEventListener("fetch", function (event) {
  event.respondWith(
    (async function () {
      var cache = await caches.open(cacheName);
      var cachedFiles = await cache.match(event.request);
      if (cachedFiles) {
        console.log("✈cache find!", cachedFiles.url, cachedFiles);
        return cachedFiles;
      } else {
        try {
          console.log("cache not find ", event.request.url);
          var response = await fetch(event.request);
          await cache.put(event.request, response.clone());
          console.log("👍 cached", event.request.url);

          return response;
        } catch (e) {
          /* ... */
          console.error("fetch error :/", event.request.url, e);
        }
      }
    })()
  );
});
