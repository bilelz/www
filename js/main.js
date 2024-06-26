// test webp support
const webP = new Image();
webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
webP.onload = webP.onerror = () => {
  if (webP.height !== 2) {
    document.body.classList.add("no-webp");
  }
};

if (!("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)) {
  document.body.classList.add("no-touchscreen");
}

// offline part
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", function (event) {
    console.log("client received: ", event.type, event.data);

    if (event.data == "offline OK") {
      document.body.classList.add("offline-available");
    }
  });
}
(async () => {
  const cachedData = await caches.open("Bilelz__COMMIT_SHA_AND_DATE_");
  const hasCachedData = (await cachedData.keys()).length > 0;
  if (hasCachedData) {
    document.body.classList.add("offline-available");
  }
})();
if (!navigator.onLine) {
  document.body.classList.add("is-offline");
}

window.onoffline = (event) => {
  document.body.classList.add("is-offline");
};
window.ononline = (event) => {
  document.body.classList.remove("is-offline");
};

// endof : offline part

const config = {
  rootMargin: "0px",
  threshold: [0.25, 0.5, 0.75, 1.0],
};

const observer = new IntersectionObserver(function (entries, self) {
  entries.forEach((entry) => {
    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
      intersectionHandler(entry);
    }
  });
}, config);

function intersectionHandler(entry) {
  if (entry.target.tagName === "SECTION") {
    // const currentActive = document.querySelector("nav a.active");
    const currentActiveList = document.querySelectorAll("nav a.active");

    // if (currentActive && currentActive.getAttribute("href") !== `#${entry.target.id}`) {
    //   currentActive.classList.remove("active");

    //   if (document.querySelector(`nav a[href='#${entry.target.id}']`)) {
    //     document.querySelector(`nav a[href='#${entry.target.id}']`).classList.add("active");
    //   }
    // }

    if (currentActiveList && currentActiveList.length > 0) {
      currentActiveList.forEach((currentActive) => {
        if (currentActive && currentActive.getAttribute("href") !== `#${entry.target.id}`) {
          currentActive.classList.remove("active");

          const buttonList = document.querySelectorAll(`nav a[href='#${entry.target.id}']`);
          if (buttonList && buttonList.length > 0) {
            buttonList.forEach((btn) => {
              btn.classList.add("active");
            });
          }
        }
      });
    }

    if (entry.target.id) {
      document.body.setAttribute("nav", entry.target.id);
    } else {
      document.body.removeAttribute("nav");
    }
  }

  // lazy-load backgroundImage
  if (entry.target.getAttribute("data-bg")) {
    const supportWebp = !document.body.classList.contains("no-webp");
    const bgUrl = entry.target.getAttribute("data-bg");
    const bgExtension = bgUrl.split(".").pop().toLocaleLowerCase().trim();

    if (bgExtension !== "webp" || (bgExtension === "webp" && supportWebp)) {
      entry.target.style.backgroundImage = `url('${bgUrl}')`;
    }
    entry.target.removeAttribute("data-bg");
  }
}

//navbar
document.querySelectorAll("nav a").forEach((item) => {
  item.addEventListener("click", (event) => {
    const target = event.target.getAttribute("href");
    const targetElement = document.querySelector("section" + target);
    if (targetElement) {
      event.preventDefault();
      document.getElementById("webdev").scrollTo({ top: targetElement.offsetTop - 60, behavior: "smooth" });
    }
  });
});

// header
document.getElementById("nbSeasons").textContent = `${new Date().getFullYear() - 2006} saisons`;

// blog
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadMode = 1;
window.lazySizesConfig.expand = 0;

const template = document.querySelector("template").innerHTML;

const allPosts = [];
readBlogPosts = function (data) {
  readData(data, "#blog-posts");
};
readBlogWallpaper = function (data) {
  readData(data, "#blog-wallpaper");
};

readData = function (data, target) {
  document.querySelector(target).innerHTML = "";
  const feed = data.feed.entry.slice(0, 10);

  for (const [index, item] of feed.entries()) {
    // search thumbmail in HTML content
    if (!item.media$thumbnail) {
      var tmp = document.createElement("div");
      tmp.innerHTML = item.content.$t;
      if (tmp.querySelectorAll("img").length > 0) {
        // increase img size & ensure HTTPS
        item.media$thumbnail = {
          url: tmp
            .querySelectorAll("img")[0]
            .src.replace(/\/s[^\/]+-c\//g, "/s450-c/")
            .replace("http://", "https://"),
        };

        // if (target === "#blog-wallpaper" && index === 0) {
        //   const heroWallpaper = tmp.querySelectorAll("img")[0].src;
        //   // document.getElementById("🏡").setAttribute = ("data-bg", `url('${heroWallpaper}')`);
        //   document.getElementById("🏡").style.backgroundImage = `url('${heroWallpaper}')`;
        //   console.log("1", heroWallpaper);
        // }
      }
    }

    // increase img size & ensure HTTPS
    item.media$thumbnail.url = item.media$thumbnail.url
      .replace(/\/s[^\/]+-c\//g, "/s450-c/") // exemple : https://blogger.googleusercontent.com/img/b/R29vZ2xl/[.....]/s72-c/PXL_20231209_105450047~2.jpg
      .replace(/=s[^\/]+-c/g, "=s450-c") // exemple : https://blogger.googleusercontent.com/img/a/[.....]yLTxKJQTq=s72-w640-h482-c
      .replace("http://", "https://");

    item.index = index;
    item.id = target.replace("#", "") + "_" + item.id.$t.replace("tag:blogger.com,1999:", "").replace(/\./g, "-");
    document.querySelector(target).innerHTML += eval("`" + template + "`");

    allPosts.push(item);

    // waiting the next tick to listen click
    setTimeout(() => {
      document.querySelectorAll(".post:not(.modal-listener)").forEach((post) => {
        post.addEventListener("click", (event) => {
          showModal(post.id, event);
        });
        post.classList.add("modal-listener");
      });
    }, 0);
  }

  const blogPosts = document.querySelectorAll(target + " .post [data-bg]");
  blogPosts.forEach((post) => {
    observer.observe(post);
  });
};

function play(event) {
  event.preventDefault();

  if (!player) {
    document.body.setAttribute("playerState", "loading");
    let tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = "ytScript";
    tag.nonce = "9cd2b8a2-753f-11ed-a1eb-0242ac120002";

    document.getElementById("ytScript") && document.getElementById("ytScript").remove();

    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    setTimeout(() => {
      if (!document.getElementById("ytScript") || !!!document.getElementById("ytScript").getAttribute("loaded")) {
        document.body.setAttribute("playerState", "error");
      }
    }, 5000);
  } else if (player.getIframe() === null) {
    onYouTubeIframeAPIReady();
  } else {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
      player.getIframe().style.visibility = "visible";
    }
  }
}

var player;
function onYouTubeIframeAPIReady() {
  document.getElementById("ytScript").setAttribute("loaded", "true");
  document.body.setAttribute("playerState", "loading");

  player = new YT.Player("player", {
    height: "315",
    width: "560",
    videoId: "uGEFVMdoG74",
    playerVars: {
      autoplay: 1, // Auto-play the video on load
      controls: 0, // Show pause/play buttons in player
      showinfo: 0, // Hide the video title
      modestbranding: 1, // Hide the Youtube Logo
      loop: 1, // Run the video in a loop
      fs: 0, // Hide the full screen button
      cc_load_policy: 0, // Hide closed captions
      iv_load_policy: 3, // Hide the Video Annotations
      autohide: 0, // Hide video controls when playing
      start: 225,
    },
    events: {
      onReady: (event) => {
        event.target.mute();
        event.target.playVideo();
      },
      onStateChange: (event) => {
        document.body.setAttribute("playerState", event.data);
      },
      onError: () => {
        document.body.setAttribute("playerState", "error");
      },
    },
  });
}

function stop(event) {
  event.preventDefault();
  player.destroy();
  document.body.removeAttribute("playerState");
}

const dialog = document.getElementById("dialog");

dialog.addEventListener("close", function onClose() {
  document.body.classList.remove("dialog-open");
  document.querySelector("dialog article").innerHTML = "";
});

function showModal(id, event) {
  if (!!!document.createElement("dialog").showModal) {
    // feature detection
    return;
  }

  const post = allPosts.find((item) => item.id === id);
  if (post) {
    event.preventDefault();
    document.querySelector("dialog").style.backgroundImage = `url('${post.media$thumbnail.url}')`;
    document.querySelector("dialog article").innerHTML = post.content.$t.replaceAll("<img", '<img loading="lazy"').replaceAll("http://", "https://");
    document.querySelector("dialog h3").innerHTML = post.title.$t;
    document.querySelector("dialog footer a").href = post.link.find((l) => l.rel === "alternate").href;
    dialog.showModal();
    document.getElementById("modalClose").addEventListener("click", (event) => {
      event.target.closest("dialog").close("cancel");
    });
    document.body.classList.add("dialog-open");
    document.querySelector("#dialog article").scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.getElementById("left").addEventListener("change", (event) => {
  if (event.target.checked) {
    document.querySelector(".left label[for][tabindex]:last-child").focus();

    const defaultPosts = document.getElementById("blog-posts-js");
    if (defaultPosts && !defaultPosts.hasAttribute("src")) {
      defaultPosts.setAttribute("src", defaultPosts.getAttribute("data-src"));
    }

    const wallpaperPosts = document.getElementById("wallpaper-posts-js");
    if (wallpaperPosts && !wallpaperPosts.hasAttribute("src")) {
      wallpaperPosts.setAttribute("src", wallpaperPosts.getAttribute("data-src"));
    }

    const sections = document.querySelectorAll("section:not([data-observed])");
    sections.forEach((item) => {
      item.setAttribute("data-observed", "true");
      observer.observe(item);
    });
  }
});

document.querySelectorAll("#front, #random").forEach((e) => {
  e.addEventListener("change", (event) => {
    document.querySelector(".front label[for][tabindex]:first-child").focus();
    if (event.target.checked) {
      setTimeout(() => {
        document.querySelector("#webdev").scrollTo({ top: 0, behavior: "smooth" });
      }, 300);

      const bgImgList = document.querySelectorAll("[data-bg]:not([data-observed])");
      bgImgList.forEach((item) => {
        item.setAttribute("data-observed", "true");
        observer.observe(item);
      });
    }
  });
});

function playAnim() {
  document.getElementById("back").checked = true;

  document.querySelectorAll(".run-animation").forEach((i) => {
    i.classList.remove("run-animation");
    void i.offsetWidth; // https://css-tricks.com/restart-css-animation/
    i.classList.add("run-animation");
  });

  setTimeout(() => {
    document.getElementById("left").checked = true;
    document.getElementById("left").dispatchEvent(new Event("change"));
    timerGoToFront();
  }, 3500);
}

// showtime
(async () => {
  const cachedData = await caches.open("Bilelz__COMMIT_SHA_AND_DATE_");
  const hasCachedData = (await cachedData.keys()).length > 0;
  if (hasCachedData) {
    document.getElementById("left").checked = true;
    document.getElementById("left").dispatchEvent(new Event("change"));
    timerGoToFront();
  } else {
    playAnim();
  }
})();

function timerGoToFront() {
  document.querySelector("#bibi").classList.add("incoming");
  setTimeout(() => {
    const side = document.querySelector('[name="side"]:checked').value;
    if (side && side === "left") {
      // side 'left' = user's menu
      document.querySelector("#bibi").click();
      document.querySelector("#bibi").classList.remove("incoming");
    }
  }, 4000);
}

// CSP grrrrrrrr : https://content-security-policy.com/unsafe-hashes/
document.getElementById("webdev").addEventListener(
  "scroll",
  (event) => {
    if (event.target.scrollY > 12 || event.target.scrollTop > 12) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  },
  { passive: true }
);
document.getElementById("playAnim").addEventListener("click", () => {
  playAnim();
});
document.getElementById("play").addEventListener("click", (event) => {
  play(event);
});
document.getElementById("close").addEventListener("click", (event) => {
  stop(event);
});
document.getElementById("reload").addEventListener("click", () => {
  document.location.reload();
});
document.getElementById("refresh").addEventListener("click", () => {
  document.location.reload();
});
document.getElementById("checkUpdate").addEventListener("click", () => {
  navigator.serviceWorker.ready.then((registration) => {
    registration.update();
  });
});
document.getElementById("displayNotif").addEventListener("click", () => {
  document.getElementById("newVersion").classList.toggle("show");
});
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.checkValidity()) {
    document.querySelector('form [type="submit"]').value = "Merci 🥳";
    setTimeout(() => {
      event.target.submit();
      document.querySelector('form [type="submit"]').removeAttribute("value");
    }, 1000);
  }
});

document.querySelector('[type="number"]').addEventListener("input", (event) => {
  document.getElementById("☕count").textContent = Array(event.target.valueAsNumber || 1)
    .fill("☕")
    .join("");
});

let deferredPrompt;
document.getElementById("install").addEventListener("click", async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    if (outcome === "accepted") {
      deferredPrompt = null;
    }
  }
});

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  document.getElementById("install").style.display = "inline-block";
  // Optionally, send analytics event that PWA install promo was shown.
  console.log(`'beforeinstallprompt' event was fired.`);
});

window.addEventListener("appinstalled", () => {
  // Hide the app-provided install promotion
  document.getElementById("install").style.display = "none";
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  console.log("PWA was installed");
});

// a11y for label
const labels = document.querySelectorAll("label[for][tabindex]");

for (let label of labels) {
  label.addEventListener("keyup", (event) => {
    (event.code === "NumpadEnter" || event.code === "Enter" || event.code === "Space") && event.target.click();
  });
}

// clear data cached / unregister service worker
document.getElementById("clearData").addEventListener("click", async () => {
  if ("serviceWorker" in navigator) {
    const cacheNames = await caches.keys();
    for (let cacheName of cacheNames) {
      caches.delete(cacheName);
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      registration.unregister();
    }

    document.body.classList.remove("offline-available");

    document.getElementById("clearData").textContent = "Cleared!";
  }
});

// stats
fetch("js/languages.json?v=_COMMIT_SHA_AND_DATE_")
  .then(function (response) {
    return response.json();
  })
  .then(function (responseJSON) {
    const total = Object.values(responseJSON).reduce((partialSum, a) => partialSum + a, 0);

    for (const [key, value] of Object.entries(responseJSON)) {
      const percent = Math.round((value * 100) / total);
      const element = document.querySelector(`#stat-${key.toLocaleLowerCase()} .percent`);
      if (element) {
        element.textContent = `${percent}%`;
      }
    }
  });

/* swipe management */
let touchstartX = 0;
let touchstartY = 0;
let rotatestartY = 0;
let touchendX = 0;
let touchendY = 0;

const gestureZones = document.querySelectorAll(".cube-face");

for (let gestureZone of gestureZones) {
  gestureZone.addEventListener(
    "touchstart",
    (event) => {
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
      switch (document.querySelector('[name="side"]:checked').value) {
        case "front":
          rotatestartY = 0;
          break;
        case "right":
          rotatestartY = 270;
          break;
        case "back":
          rotatestartY = 180;
          break;
        case "left":
          rotatestartY = 90;
          break;
        case "random":
          rotatestartY = 720;
          break;
        default:
          break;
      }
      console.log("touchstart", document.querySelector('[name="side"]:checked').value, "rotatestartY", rotatestartY);
    },
    { passive: true }
  );

  gestureZone.addEventListener(
    "touchmove",
    (event) => {
      const diffX = ((event.changedTouches[0].screenX - touchstartX) * 90) / document.body.clientWidth;
      const diffY = event.changedTouches[0].screenY - touchstartY;

      console.log(document.querySelector('[name="side"]:checked').value, diffX);

      // if (Math.abs(diffY) < 25) {
      document.querySelector(".wrap").style.transition = `none`;
      document.querySelector(".cube").style.transition = `none`;
      document.querySelector(".cube").style.transform = `translateZ(-50vw) rotateY(${rotatestartY + diffX}deg)`;
      // } else {
      //   document.querySelector(".cube").style.transform = `translateZ(-50vw) rotateY(${rotatestartY}deg)`;
      // }
    },
    { passive: true }
  );

  gestureZone.addEventListener(
    "touchend",
    (event) => {
      document.querySelector(".wrap").style.transition = `0.3s`;
      document.querySelector(".cube").style.transition = `0.3s`;
      document.querySelector(".cube").style.transform = ``;
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      handleGesture(gestureZone);
    },
    { passive: true }
  );
}

function handleGesture(gestureZone) {
  const diffX = touchstartX - touchendX;
  const diffXPercent = ((touchstartX - touchendX) * 100) / document.body.clientWidth;
  const diffY = touchendY - touchstartY;

  if (touchendX < touchstartX) {
    console.log("Swiped left", diffX);
    if (Math.abs(diffXPercent) > 20 && Math.abs(diffY) < 50) {
      const el = gestureZone.querySelector('[data-swipe="right"]');
      el && el.click();
    }
  }

  if (touchendX > touchstartX) {
    console.log("Swiped right", diffX);

    if (Math.abs(diffXPercent) > 20 && Math.abs(diffY) < 50) {
      const el = gestureZone.querySelector('[data-swipe="left"]');
      el && el.click();
    }
  }
}

const nogestureZones = document.querySelectorAll(".template");

for (let nog of nogestureZones) {
  nog.addEventListener(
    "touchstart",
    (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
    },
    { passive: true }
  );
  nog.addEventListener(
    "touchmove",
    (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
    },
    { passive: true }
  );
  nog.addEventListener(
    "touchend",
    (event) => {
      event.stopImmediatePropagation();
      event.stopPropagation();
    },
    { passive: true }
  );
}

// window.addEventListener("deviceorientation", handleOrientation); // POC
let initialGamma = null; // peut-etre à remettre à null
let fromInitialGamma = false;
function handleOrientation(event) {
  const gamma = event.gamma ? (-1 * event.gamma) / 2 : 0;
  if (initialGamma === null) {
    initialGamma = gamma;
    console.log({ initialGamma });
  }

  const relativeGamma = initialGamma ? gamma - initialGamma : gamma;

  if (!fromInitialGamma && Math.abs(relativeGamma) < 10) {
    fromInitialGamma = true;
  }

  if (fromInitialGamma && Math.abs(relativeGamma) > 20) {
    const direction = relativeGamma > 0 ? "left" : "right";
    document.getElementById("direction").textContent = direction;

    const side = document.querySelector('[name="side"]:checked').value;
    const el = document.querySelector(`.${side} [data-swipe="${direction}"]`);
    el && el.click();

    fromInitialGamma = false;
  }

  document.querySelector(".wrap").style.transform = `rotateY(${relativeGamma}deg)`;
  document.getElementById("orientation").style.display = "flex";
  document.getElementById("orientation-values").textContent = `alpha: ${event.alpha ? event.alpha.toFixed(0) : "∞"} 
                                                | beta: ${event.beta ? event.beta.toFixed(0) : "∞"} 
                                                | gamma: ${relativeGamma ? relativeGamma.toFixed(0) : "∞"} `;
}
