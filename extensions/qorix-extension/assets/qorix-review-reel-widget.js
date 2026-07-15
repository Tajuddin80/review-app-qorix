(function () {
  function initReviewReel() {
    let container = document.querySelector(".mySwiper");
    if (!container) return;

    let wrapper = container.closest(".qorix-review-reel-real-review-section");
    let computedStyle = getComputedStyle(wrapper || container);
    let navCols =
      parseInt(computedStyle.getPropertyValue("--nav-cols").trim()) || 3;
    let gapBetweenCards =
      parseInt(computedStyle.getPropertyValue("--gap-between-cards").trim()) ||
      8;
    let autoplayEnabled =
      computedStyle.getPropertyValue("--autoplay-enabled").trim() === "true";
    let autoplaySpeed =
      parseInt(computedStyle.getPropertyValue("--autoplay-speed").trim()) ||
      4000;

    let swiperOptions = {
      slidesPerView: 1,
      spaceBetween: gapBetweenCards,
      observer: true,
      observeParents: true,
      loop: true,
      navigation: {
        nextEl: document.querySelector(".qorix-review-reel-swiper-button-next"),
        prevEl: document.querySelector(".qorix-review-reel-swiper-button-prev"),
      },
      pagination: {
        el: ".qorix-review-reel-swiper-pagination",
        clickable: true,
      },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: gapBetweenCards },
        1024: { slidesPerView: 3, spaceBetween: gapBetweenCards },
        1440: { slidesPerView: navCols, spaceBetween: gapBetweenCards },
      },
    };

    if (autoplayEnabled) {
      swiperOptions.autoplay = {
        delay: autoplaySpeed,
        disableOnInteraction: false,
      };
    }

    let swiper = new Swiper(".mySwiper", swiperOptions);
    let currentVideo = null;

    let PAUSE_ICON =
      '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="rgba(0,0,0,0.5)"/><rect x="13" y="11" width="5" height="18" rx="1.5" fill="white"/><rect x="22" y="11" width="5" height="18" rx="1.5" fill="white"/></svg>';

    let PLAY_ICON =
      '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="rgba(0,0,0,0.5)"/><path d="M16 12v16l13-8z" fill="white"/></svg>';

    function pauseAllVideos() {
      if (currentVideo) {
        currentVideo.pause();
        currentVideo = null;
      }
    }

    document
      .querySelectorAll(
        '.qorix-review-reel-review-card-image[data-media-type="video"]',
      )
      .forEach(function (wrapper) {
        let video = wrapper.querySelector("video");
        let btn = wrapper.querySelector(".qorix-review-reel-play-btn");

        if (!video || !btn) return;

        function onPlay() {
          currentVideo = video;
          btn.innerHTML = PAUSE_ICON;
          if (swiper.autoplay) {
            swiper.autoplay.stop();
          }
        }

        function onPause() {
          if (currentVideo === video) {
            currentVideo = null;
          }
          btn.innerHTML = PLAY_ICON;
          if (autoplayEnabled && swiper.autoplay) {
            swiper.autoplay.start();
          }
        }

        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (video.paused) {
            pauseAllVideos();
            video.play().catch(function () {
              btn.innerHTML = PLAY_ICON;
            });
          } else {
            video.pause();
          }
        });

        video.addEventListener("play", onPlay);
        video.addEventListener("pause", onPause);
        video.addEventListener("ended", onPause);
      });

    swiper.on("slideChange", function () {
      pauseAllVideos();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewReel);
  } else {
    initReviewReel();
  }
})();
