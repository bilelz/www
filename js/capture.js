import captureWebsite from "capture-website";
import * as fs from "fs";
import * as http from "https";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";
import imageminMozjpeg from "imagemin-mozjpeg";
import fetch from "node-fetch";

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

          const width = 540;
          const height = 540;
          const widthWide = 1024;
          console.log("start capture", new Date());

          const captureOptions = {
            inputType: "url",
            overwrite: true,
            scaleFactor: 1,
            launchOptions: {
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            },
          };

          await Promise.all([
            captureWebsite.file("index.html", "img/screenshot1.png", {
              ...captureOptions,
              delay: 3.15,
              width,
              height,
            }),
            captureWebsite.file("index.html", "img/screenshot1-wide.png", {
              ...captureOptions,
              delay: 3.15,
              width: widthWide,
              height,
            }),
            captureWebsite.file("index.html", "img/screenshot2.png", {
              ...captureOptions,
              delay: 6,
              width,
              height,
            }),
            captureWebsite.file("index.html", "img/screenshot2-wide.png", {
              ...captureOptions,
              delay: 6,
              width: widthWide,
              height,
            }),
            captureWebsite.file("index.html", "img/screenshot3.png", {
              ...captureOptions,
              delay: 7.25,
              width,
              height,
            }),
            captureWebsite.file("index.html", "img/screenshot3-wide.png", {
              ...captureOptions,
              delay: 7.25,
              width: widthWide,
              height,
            }),
            captureWebsite.file("index.html", "img/preview.png", {
              ...captureOptions,
              delay: 10,
              width,
              height,
              hideElements: ["nav.sticky"],
            }),
            captureWebsite.file("index.html", "img/preview-wide.png", {
              ...captureOptions,
              delay: 10,
              width: widthWide,
              height,
              hideElements: ["nav.sticky"],
            }),
          ]);

          console.log("end capture", new Date());
        });
      });
    }
  });
