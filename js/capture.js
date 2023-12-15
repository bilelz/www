import captureWebsite from "capture-website";
import * as fs from "fs";
import * as http from "https";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import imageminMozjpeg from "imagemin-mozjpeg";
import fetch from "node-fetch";

// const http = require("https"); // or 'https' for https:// URLs

fetch("https://bilelz.blogspot.com/feeds/posts/default?alt=json&max-results=1&category=wallpaper")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    if (data.feed.entry.length > 0 && data.feed.entry[0].media$thumbnail) {
      const heroBgUrl = data.feed.entry[0].media$thumbnail.url.replace(/s[^\/]+-c/g, "s1200");
      console.log(heroBgUrl);

      const file = fs.createWriteStream("img/hero.jpg");
      const request = http.get(heroBgUrl, function (response) {
        response.pipe(file);

        // after download completed close filestream
        file.on("finish", async () => {
          file.close();
          console.log("Download Completed");

          await imagemin(["img/hero.jpg"], {
            destination: "img",
            plugins: [imageminWebp({ quality: 50 })],
          });
          await imagemin(["img/hero.jpg"], {
            destination: "img",
            plugins: [imageminMozjpeg({ quality: 50 })],
          });

          await Promise.all([
            await captureWebsite.file("index.html", "img/screenshot1.png", {
              inputType: "url",
              overwrite: true,
              delay: 3.15,
              width: 540,
              height: 540,
              scaleFactor: 1,
            }),
            await captureWebsite.file("index.html", "img/screenshot2.png", {
              inputType: "url",
              overwrite: true,
              delay: 6,
              width: 540,
              height: 540,
              scaleFactor: 1,
            }),
            await captureWebsite.file("index.html", "img/screenshot3.png", {
              inputType: "url",
              overwrite: true,
              delay: 7.25,
              width: 540,
              height: 540,
              scaleFactor: 1,
            }),
            await captureWebsite.file("index.html", "img/preview.png", {
              inputType: "url",
              overwrite: true,
              delay: 10,
              width: 540,
              height: 540,
              scaleFactor: 1,
              hideElements: ["nav.sticky"],
            }),
          ]);
        });
      });
    }
  });
