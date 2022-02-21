// var offlineList = ["./index.html", "./css/main.css", "./js/main.js"];
// var version = "v1.8::";

// //https://css-tricks.com/serviceworker-for-offline/

// //https://deanhume.com/displaying-a-new-version-available-progressive-web-app/

// self.addEventListener("install", function(event) {
//   event.waitUntil(
//     caches.open(version + "sw-cache").then(function(cache) {
//       return cache.addAll(offlineList);
//     })
//   );
// });

// self.addEventListener("fetch", function(event) {
//   event.respondWith(
//     caches.match(event.request).then(function(response) {
//       return response || fetch(event.request);
//     })
//   );
// });

// //Cache, falling back to network
// // https://jakearchibald.com/2014/offline-cookbook/
// self.addEventListener("fetch", event => {
//   event.respondWith(
//     (async function() {
//       const response = await caches.match(event.request);
//       return response || fetch(event.request);
//     })()
//   );
// });

// self.addEventListener("activate", function activator(event) {
//   event.waitUntil(
//     caches.keys().then(function(keys) {
//       // delete previous
//       return Promise.all(
//         keys
//           .filter(function(key) {
//             return key.indexOf(version) !== 0;
//           })
//           .map(function(key) {
//             return caches.delete(key);
//           })
//       );
//     })
//   );
// });
