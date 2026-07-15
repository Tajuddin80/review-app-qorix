(function () {
  function initReviewReel() {
    const container = document.querySelector(".mySwiper");
    if (!container) return;

    const wrapper = container.closest(".qorix-review-reel-real-review-section");
    const computedStyle = getComputedStyle(wrapper || container);
    const navCols =
      parseInt(computedStyle.getPropertyValue("--nav-cols").trim()) || 3;
    const gapBetweenCards =
      parseInt(computedStyle.getPropertyValue("--gap-between-cards").trim()) ||
      8;
    const autoplayEnabled =
      computedStyle.getPropertyValue("--autoplay-enabled").trim() === "true";
    const autoplaySpeed =
      parseInt(computedStyle.getPropertyValue("--autoplay-speed").trim()) ||
      4000;

    const swiperOptions = {
      slidesPerView: 1,
      spaceBetween: gapBetweenCards,
      observer: true,
      observeParents: true,
      loop: true,
      navigation: {
        nextEl: document.querySelector(".qorix-review-reel-swiper-button-next"),
        prevEl: document.querySelector(".qorix-review-reel-swiper-button-prev"),
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

    const swiper = new Swiper(".mySwiper", swiperOptions);
    let currentVideo = null;

    const PAUSE_ICON =
      '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="20" fill="rgba(0,0,0,0.5)"/><rect x="13" y="11" width="5" height="18" rx="1.5" fill="white"/><rect x="22" y="11" width="5" height="18" rx="1.5" fill="white"/></svg>';

    const PLAY_ICON =
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C8.97167 0 0 8.97167 0 20C0 31.0283 8.97167 40 20 40C31.0283 40 40 31.0283 40 20C40 8.97167 31.0283 0 20 0ZM27.34 23.1217L18.6533 27.8783C18.1117 28.1833 17.515 28.335 16.9183 28.335C16.2967 28.335 15.6733 28.17 15.1067 27.84C13.995 27.19 13.3333 26.035 13.3333 24.7483V15.25C13.3333 13.9633 13.995 12.8083 15.1067 12.1583C16.215 11.51 17.5483 11.4983 18.67 12.13L27.3233 16.8683C28.4833 17.52 29.165 18.6867 29.165 19.9983C29.165 21.31 28.4833 22.4767 27.3383 23.12L27.34 23.1217ZM25.8333 20C25.8333 20.145 25.7367 20.1983 25.7233 20.2083L17.0367 24.9667C17.005 24.9833 16.9083 25.0367 16.7917 24.965C16.6683 24.8933 16.6683 24.7867 16.6683 24.7517V15.2533C16.6683 15.2183 16.6683 15.1117 16.7917 15.04C16.8367 15.0133 16.8783 15.005 16.915 15.005C16.975 15.005 17.0233 15.0317 17.0533 15.0483L25.7067 19.7883C25.7383 19.8067 25.8333 19.86 25.8333 20.005V20Z" fill="white"/></svg>';

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
        const video = wrapper.querySelector("video");
        const btn = wrapper.querySelector(".qorix-review-reel-play-btn");

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

    const paginationContainer = document.querySelector(
      ".qorix-review-reel-swiper-pagination",
    );

    function buildPagination() {
      if (!paginationContainer) return;
      paginationContainer.innerHTML = "";

      const realSlides = document.querySelectorAll(
        ".mySwiper .swiper-slide:not(.swiper-slide-duplicate)",
      ).length;

      for (let i = 0; i < realSlides; i++) {
        const btn = document.createElement("button");
        btn.className = "qorix-review-reel-custom-pagination-btn";
        if (i === swiper.realIndex) {
          btn.classList.add("active");
        }
        btn.setAttribute("data-index", i);
        btn.addEventListener("click", function () {
          swiper.slideToLoop(parseInt(this.getAttribute("data-index")));
        });
        paginationContainer.appendChild(btn);
      }
    }

    function updatePagination() {
      if (!paginationContainer) return;
      const activeIndex = swiper.realIndex;
      const btns = paginationContainer.querySelectorAll(
        ".qorix-review-reel-custom-pagination-btn",
      );
      for (let i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("active", i === activeIndex);
      }
    }

    buildPagination();

    swiper.on("slideChange", function () {
      pauseAllVideos();
      updatePagination();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReviewReel);
  } else {
    initReviewReel();
  }
})();
