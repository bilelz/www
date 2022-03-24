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

const sections = document.querySelectorAll("section");
sections.forEach((section) => {
  observer.observe(section);
});

function intersectionHandler(entry) {
  if (entry.target.tagName === "SECTION") {
    document.querySelector("nav a.active").classList.remove("active");
    document.querySelector(`nav a[href='#${entry.target.id}']`).classList.add("active");
    history.replaceState(null, "", `#${entry.target.id}`);
  }

  // lazy-load backgroundImage
  if (entry.target.getAttribute("data-bg")) {
    entry.target.style.backgroundImage = `url('${entry.target.getAttribute("data-bg")}')`;
    entry.target.removeAttribute("data-bg");
  }
}

// header
document.getElementById("nbSeasons").textContent = `${new Date().getFullYear() - 2006} seasons`;

// blog
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadMode = 1;
window.lazySizesConfig.expand = 0;

const template = document.querySelector("template").innerHTML;
readData = function (data) {
  document.querySelector("#template").innerHTML = "";
  const feed = data.feed.entry.slice(0, 10);

  for (const [index, item] of feed.entries()) {
    // search thumbmail in HTML content
    if (!item.media$thumbnail) {
      var tmp = document.createElement("div");
      tmp.innerHTML = item.content.$t;
      if (tmp.querySelectorAll("img").length > 0) {
        // increase img size & ensure HTTPS
        item.media$thumbnail = {
          url: tmp.querySelectorAll("img")[0].src.replace("s72-c", "s300-c").replace("http://", "https://"),
        };
      }
    } else {
      // increase img size & ensure HTTPS
      item.media$thumbnail.url = item.media$thumbnail.url.replace("s72-c", "s300-c").replace("http://", "https://");
    }
    item.index = index;
    document.querySelector("#template").innerHTML += eval("`" + template + "`");
  }

  const blogPosts = document.querySelectorAll(".post [data-bg]");
  blogPosts.forEach((post) => {
    observer.observe(post);
  });
};

function handleScroll() {
  if (window.scrollY > 12) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
}

function play(event) {
  event.preventDefault();

  if (!player) {
    document.body.setAttribute("playerState", "loading");
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
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
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerReady(event) {
  event.target.mute();
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  document.body.setAttribute("playerState", event.data);
}

function stop(event) {
  event.preventDefault();
  player.destroy();
  document.body.removeAttribute("playerState");
}
