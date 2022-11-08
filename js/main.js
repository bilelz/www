const webP = new Image();
webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
webP.onload = webP.onerror = () => {
  if (webP.height !== 2) {
    document.querySelector("body").classList.add("no-webp");
  }
};

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

// const sections = document.querySelectorAll("section");
// sections.forEach((section) => {
//   observer.observe(section);
// });

function intersectionHandler(entry) {
  if (entry.target.tagName === "SECTION") {
    document.querySelector("nav a.active") && document.querySelector("nav a.active").classList.remove("active");

    if (document.querySelector(`nav a[href='#${entry.target.id}']`)) {
      document.querySelector(`nav a[href='#${entry.target.id}']`).classList.add("active");
    }

    if (entry.target.id) {
      document.body.setAttribute("nav", entry.target.id);
    } else {
      document.body.removeAttribute("nav");
    }
  }

  // lazy-load backgroundImage
  if (entry.target.getAttribute("data-bg")) {
    entry.target.style.backgroundImage = `url('${entry.target.getAttribute("data-bg")}')`;
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
document.getElementById("nbSeasons").textContent = `${new Date().getFullYear() - 2006} seasons`;

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
          url: tmp.querySelectorAll("img")[0].src.replace("s72", "s300").replace("http://", "https://"),
        };
      }
    } else {
      // increase img size & ensure HTTPS
      item.media$thumbnail.url = item.media$thumbnail.url.replace("s72", "s300").replace("http://", "https://");
    }
    item.index = index;
    item.id = target.replace("#", "") + "_" + item.id.$t.replace("tag:blogger.com,1999:", "").replace(/\./g, "-");
    document.querySelector(target).innerHTML += eval("`" + template + "`");
    allPosts.push(item);
  }

  // const blogPosts = document.querySelectorAll(target + " .post [data-bg]");
  // blogPosts.forEach((post) => {
  //   observer.observe(post);
  // });
};

function play(event) {
  event.preventDefault();

  if (!player) {
    document.body.setAttribute("playerState", "loading");
    let tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = "ytScript";

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
    document.querySelector("dialog article").innerHTML = post.content.$t.replaceAll("<img", '<img loading="lazy"').replaceAll("http://", "https://");
    document.querySelector("dialog h3").innerHTML = post.title.$t;
    document.querySelector("dialog footer a").href = post.link.find((l) => l.rel === "alternate").href;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    document.querySelector("#dialog article").scrollTo({ top: 0, behavior: "smooth" });
  }
}

function playAnim() {
  document.getElementById("left").checked = true;

  document.querySelectorAll(".run-animation").forEach((i) => {
    i.classList.remove("run-animation");
    void i.offsetWidth; // https://css-tricks.com/restart-css-animation/
    i.classList.add("run-animation");
  });

  setTimeout(() => {
    document.getElementById("front").checked = true;
  }, 3000);
}

document.querySelectorAll("#right, #random").forEach((e) => {
  e.addEventListener("change", (event) => {
    if (event.target.checked) {
      setTimeout(() => {
        document.querySelector("#webdev").scrollTo({ top: 0, behavior: "smooth" });
      }, 300);

      const blogPosts = document.querySelectorAll("[data-bg]");
      blogPosts.forEach((post) => {
        observer.observe(post);
      });
    }
  });
});

//showtime
playAnim();
