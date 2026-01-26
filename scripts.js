console.debug("%cScripts.js loaded", "color: lightgreen;");

let lenis;

// Lenis setup
function setupLenis() {
  lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  lenis.start();
}

/** Scroll Animations
 *
 * Usage:
 * ------
 * 1. Add data attributes to your HTML elements:
 *    - data-anim: Specifies the animation type
 *    - data-anim-duration: (Optional) Sets custom animation duration in seconds or milliseconds
 *    - data-anim-delay: (Optional) Sets element's individual delay in seconds or milliseconds
 *    - data-anim-group-delay: (Optional) Sets custom stagger delay between elements entering visibility within 0.1s time frame in seconds or milliseconds
 *
 * Example HTML:
 * ```html
 * <div data-anim="fadeslide-up" data-anim-duration="0.8" data-anim-group-delay="0.15"></div>
 * ```
 *
 * Necessary CSS:
 * ------
 * ```css
 * [data-anim] {
 *   opacity: 0;
 *   will-change: transform, opacity;
 *   backface-visibility: hidden;
 *   perspective: 1000px;
 * }
 * html.wf-design-mode [data-anim],
 * html.wf-doc [data-anim],
 * html.site-scrollbar [data-anim],
 * html.w-editor [data-anim] { opacity: 1; }
 * ```
 *
 * Animation Types:
 * ---------------
 * - "fadeslide-up": Fades in while sliding up
 * - "fadeslide-in-left": Fades in while sliding from left
 * - "fadeslide-in-right": Fades in while sliding from right
 * - "fadeslide-in": Smart directional fade-slide based on panel layout
 * - "fade": Simple fade in
 *
 * Default Values:
 * --------------
 * - Animation Duration: 0.75 seconds
 * - Stagger Delay: 0.1 seconds
 * - Scroll Trigger Point: 90% from top of viewport
 * - Reset Time Window: 0.1 seconds (for grouping staggered animations)
 *
 * Special Features:
 * ---------------
 * 1. Stagger Grouping:
 *    - Elements triggered within 0.1 seconds are grouped together
 *    - Each group starts its own stagger sequence
 *    - Helps maintain visual coherence for elements entering viewport together
 *
 * 2. Performance:
 *    - Animations trigger only once
 *    - Uses performant GSAP animations
 *    - Optimized trigger calculations
 *
 * Implementation Notes:
 * -------------------
 * - Call initScrollAnimations() after DOM is ready
 * - Ensure GSAP and ScrollTrigger are loaded before initialization
 * - Animations trigger when elements are 90% visible from the top of viewport
 *
 */
function initScrollAnimations() {
	// Select all elements with data-anim attribute
	const animElements = document.querySelectorAll("[data-anim]");

	let lastTriggerTime = 0; // Store the timestamp of the last group
	let groupIndex = 0; // To reset delay for new groups
	const resetTime = 0.1; // Time window (in seconds) to reset the stagger delay

	let screenWidth = window.innerWidth;
	let transitionAmount = screenWidth < 600 ? 40 : 75;
	let transitionAmountNeg = transitionAmount * -1;

	window.addEventListener("resize", () => {
		screenWidth = window.innerWidth;
		transitionAmount = screenWidth < 600 ? 40 : 75; // Update transitionAmount on resize
		transitionAmountNeg = transitionAmount * -1;
	});

	animElements.forEach((element, index) => {
		let setDuration = element.getAttribute("data-anim-duration");
		let setGroupDelay = element.getAttribute("data-anim-group-delay");
		let setDelay = element.getAttribute("data-anim-delay");

		// If the value is greater than 50, we assume it was set with milliseconds in mind so we convert to seconds
		if (setDuration > 50) { setDuration = setDuration / 1000; }
		if (setGroupDelay > 50) { setGroupDelay = setGroupDelay / 1000; }
		if (setDelay > 50) { setDelay = setDelay / 1000; }

		const animType = element.getAttribute("data-anim");
		const customDuration =
			parseFloat(setDuration) || 0.85;
		const customGroupDelay =
			parseFloat(setGroupDelay) || 0.15;
		const customDelay =
			parseFloat(setDelay) || false;

		const rect = element.getBoundingClientRect();
		const isAboveViewport = rect.bottom < 0; // Element is already above the viewport

		if (isAboveViewport) {
			gsap.set(element, { opacity: 1, x: 0, y: 0 }); // Instantly reveal elements above viewport
			return;
		}

		let fromX = 0;
		// const topOffsetPercent = window.innerWidth > 600 ? 85 : 95;

		// ScrollTrigger with time grouping logic
		ScrollTrigger.create({
			trigger: element,
			start: `top bottom-=15%`,
			once: true, // Ensure the animation runs only once
			onEnter: () => {
				const currentTime = performance.now() / 1000; // Convert to seconds

				// If the time since the last trigger is greater than resetTime, reset the group index
				if (currentTime - lastTriggerTime > resetTime) {
					groupIndex = 0; // Reset delay index for new group
				}

				lastTriggerTime = currentTime; // Update last trigger time

				let delay = 0;

				if (customDelay) {
					delay = customDelay;
				} else {
					delay = groupIndex * customGroupDelay; // Calculate delay within the group
					groupIndex++; // Increment group index for next element
				}

				// Animation variations based on data-anim type
				const baseAnimation = {
					opacity: 0,
					duration: customDuration,
					ease: "quad.out",
				};

				// Optional: Log delay for debugging
				// console.table(element.className, delay);

				switch (animType) {
					case "fadeslide-up":
						gsap.fromTo(
							element,
							{ ...baseAnimation, y: transitionAmount },
							{ ...baseAnimation, y: 0, opacity: 1, delay: delay }
						);
						break;

					case "fadeslide-in-left":
						gsap.fromTo(
							element,
							{ ...baseAnimation, x: transitionAmountNeg },
							{ ...baseAnimation, x: 0, opacity: 1, delay: delay }
						);
						break;

					case "fadeslide-in-right":
						gsap.fromTo(
							element,
							{ ...baseAnimation, x: transitionAmount },
							{ ...baseAnimation, x: 0, opacity: 1, delay: delay }
						);
						break;

					case "fadeslide-in":
						gsap.fromTo(
							element,
							{ ...baseAnimation, x: fromX },
							{ ...baseAnimation, x: 0, opacity: 1, delay: delay }
						);
						break;

					case "fade":
						gsap.fromTo(element, baseAnimation, {
							...baseAnimation,
							opacity: 1,
							delay: delay,
						});
						break;
				}
			},
		});
	});
}

var _pageLoad = function () {

  var reveal_options = {
    easing: 'ease',
    duration: '600',
    delay: '0'
  };

  $("body").attr({
    "data-reveal-easing": reveal_options.easing,
    "data-reveal-duration": reveal_options.duration,
    "data-reveal-delay": reveal_options.delay,
  });

  /* GSAP Usage */
  let tl = gsap.timeline(); // create timeline, similar to SM's controller, so we can add animations to it dynamically if we need to
  const revealEls = gsap.utils.toArray('[data-reveal]:not([data-reveal-snap])');
  revealEls.forEach((el) => {
    tl.from(el, {
      scrollTrigger: {
        start: 'top bottom-=5%', // animate when top of element is 5% above the bottom of the viewport
        trigger: el,
        onEnter: () => {
          $(el).addClass('reveal-animate');
        }, // callback to activate animation only on first enter
        // toggleClass: 'reveal-animate', // uncomment for animation on enter and re-enter
      }
    });
  });
  gsap.to('html', {
    "--hero-opacity": 1,
    scrollTrigger: {
      trigger: '.hero-home_inner_wrap',
      start: 'top top',
      end: 'bottom 25%',
      scrub: true
    }
  });

  $(window).on('load', function(){
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(function(){
        document.getElementById(hash).scrollIntoView({
          behavior: 'smooth'
        });
      }, 500);
    }

    // $(window).one('scroll', function(){
    // 	_map();
    // });
  });

  // Sticky Header - add .stuck class to body on scroll
  $(window).on('scroll', function() {
    var $tScroll = $(this);
    cdScroll($tScroll.scrollTop());
  });

  cdScroll($(window).scrollTop());

  function cdScroll(s) {
    if (s > 50) {
      $("body").addClass("stuck");
    } else {
      $("body").removeClass("stuck");
    }
  }

}; // end page load

// Finsweet Stuff
// https://finsweet.com/attributes/attributes-api
function finsweetStuff() {
  console.debug(
    "%c [DEBUG] Starting finsweetStuff",
    "background: #33cc33; color: white"
  );

  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((list)=>{
        list.addHook("afterRender", (items) => {
          ScrollTrigger.refresh();
          // lenis.resize();
        })
      });

      /* Log all stages of lifecycle */
      /*
      const phases = [
        'start',
        'filter',
        'sort',
        'pagination',
        'beforeRender',
        'render',
        'afterRender'
      ];
      listInstances.forEach((list) => {
        phases.forEach((phase) => {
          list.addHook(phase, (items) => {
            console.log(`[fs-list] Phase: ${phase}`, {
              listInstance: list,
              itemCount: items.length,
              items
            });
            return items;
          });
        });
      });
      */
    }
  ]);
}

// Auto-Update Copyright Year
function copyrightAutoUpdate() {
  const currentYear = new Date().getFullYear();
  $("[data-copyright-year]").html(currentYear);
}

var _swipers = function() {
  $(".hero-home_slider.swiper").each(function () {
    var sliderId = $(this).attr("id");
    var sliderPrevEl = $(this).find('.swiper-button-prev');
    var sliderNextEl = $(this).find('.swiper-button-next');
    var toggleTitleEl = $(this).find('.swiper-hide-title');
    var titleContainerEl = $(this).parent().find('.page-title-container');
    toggleTitleEl.add(sliderPrevEl).add(sliderNextEl).on('mouseenter', function(){
      $(titleContainerEl).addClass('hidden');
      $(this).find('button').removeClass('icon-visible');
      $(this).find('button').addClass('icon-invisible');
    });
    toggleTitleEl.add(sliderPrevEl).add(sliderNextEl).on('mouseleave', function(){
      $(titleContainerEl).removeClass('hidden');
      $(this).find('button').removeClass('icon-invisible');
      $(this).find('button').addClass('icon-visible');
    });
    // console.log(sliderId);
    return new Swiper(`#${sliderId}`, {
      slidesPerView: 1,
      speed: 800,
      // autoHeight: true,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: true,
      navigation: {
        nextEl: `.${sliderNextEl[0].classList[0]}`,
        prevEl: `.${sliderPrevEl[0].classList[0]}`,
      },
    });
  });
  $(".team-slider_slider.swiper").each(function () {
    var sliderId = $(this).attr("id");
    var sliderPrevEl = $(this).find('.swiper-button-prev');
    var sliderNextEl = $(this).find('.swiper-button-next');
    var sliderScrollbar = $(this).find('.swiper-scrollbar');
    // console.log(sliderId);
    return new Swiper(`#${sliderId}`, {
      slidesPerView: 1,
      speed: 800,
      spaceBetween: 32,
      grabCursor: true,
      // autoHeight: true,
      loop: false,
      navigation: {
        nextEl: `.${sliderNextEl[0].classList[0]}`,
        prevEl: `.${sliderPrevEl[0].classList[0]}`,
      },
      scrollbar: {
        el: `.${sliderScrollbar[0].classList[0]}`,
        draggable: true,
      },
      breakpoints: {
        800: {
          slidesPerView: 2
        },
        1200: {
          slidesPerView: 3
        }
      }
    });
  });
};

var _map = function() {
  if ($('[data-map]').length) {
    // Create the script tag, set the appropriate attributes
    // var script = document.createElement('script');
    // script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDHUtCgNJ6CkrNtTIOlUAGzaVpMXPJQjBA&callback=initMap';
    // script.async = true;

    window.initMap = function() {
      const centerLatLng = { lat: 37.41307555372046, lng: -122.05409066615627 };
      const moffettCoords = [
        {lat: 37.402656, lng: -122.045146},
        {lat: 37.396008, lng: -122.046690},
        {lat: 37.398974, lng: -122.056818},
        {lat: 37.400951, lng: -122.058235},
        {lat: 37.405417, lng: -122.056604},
        {lat: 37.408502, lng: -122.069564},
        {lat: 37.410377, lng: -122.073641},
        {lat: 37.413343, lng: -122.073513},
        {lat: 37.413891, lng: -122.082421},
        {lat: 37.416661, lng: -122.082293},
        {lat: 37.416933, lng: -122.086863},
        {lat: 37.423546, lng: -122.086606},
        {lat: 37.423546, lng: -122.078066},
        {lat: 37.428590, lng: -122.078194},
        {lat: 37.428658, lng: -122.068495},
        {lat: 37.426545, lng: -122.057877},
        {lat: 37.427942, lng: -122.055774},
        {lat: 37.429169, lng: -122.056031},
        {lat: 37.430294, lng: -122.051825},
        {lat: 37.426204, lng: -122.049551},
        {lat: 37.427499, lng: -122.043414},
        {lat: 37.426681, lng: -122.034987},
        {lat: 37.424738, lng: -122.027220},
        {lat: 37.423307, lng: -122.027134},
        {lat: 37.421807, lng: -122.022756},
        {lat: 37.408650, lng: -122.027134},
        {lat: 37.406128, lng: -122.026104},
        {lat: 37.403196, lng: -122.026619},
        {lat: 37.400605, lng: -122.035717},
      ];
      const markers = [
        // [{ lat: 37.4132758, lng: -122.0540668 }, "Hangar 1"],
        // [{ lat: 37.4113378, lng: -122.0592939 }, "Shenandoah Plaza"],
        [{ lat: 37.41715508007898, lng: -122.06166991541467 }, "NASA Ames Campus", "nasa"],
        [{ lat: 37.40985908175872, lng: -122.0540854770259 }, null, "berkeley"],
        [{ lat: 37.42280357867831, lng: -122.06639937247499 }, "Google Bay View Campus", "google"],
        [{ lat: 37.419244094098566, lng: -122.07362010538282 }, "Google Mountain View Campus", "google"],
        [{ lat: 37.41167300872227, lng: -122.07128469723234 }, "Microsoft Silicon Valley Campus", "microsoft"],
        [{ lat: 37.4091163918119, lng: -122.03327606293628 }, "Meta Sunnyvale Campus", "meta"],
        [{ lat: 37.40788981736148, lng: -122.02917592163321 }, "Juniper Networks", "juniper"],
        [{ lat: 37.40895965151502, lng: -122.036112222299 }, "Amazon", "amazon"],
        [{ lat: 37.404020098594096, lng: -122.03451811632239 }, "Google", "google"],
        [{ lat: 37.41508543056878, lng: -122.07514304683008 }, "Google North Bayshore", "google"],
        [{ lat: 37.41614937686715, lng: -122.03414418323331 }, "Lockheed Martin", "lockheed"],
        [{ lat: 37.401207766981685, lng: -122.04751868835328 }, "Samsung", 'samsung'],
      ];
      const markerIcons = {
        'default': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f8269bf628a35b4dec9_map-marker.svg',
        'google': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f8253c4b57d9921efd8_map-marker-google.svg',
        'microsoft': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f82270f169153aed331_map-marker-microsoft.svg',
        'meta': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f825cd4d2dc27b2de5e_map-marker-meta.svg',
        'amazon': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f8265b5beeeaf4ced87_map-marker-amazon.svg',
        'nasa': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f8204f67db8e7fe174a_map-marker-nasa.svg',
        'samsung': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f82d8fefb56d61eb61b_map-marker-samsung.svg',
        'lockheed': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f8269d1947c4a10f32e_map-marker-lockheed.svg',
        'juniper': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/684097a5211b54cc9c9708b8_2c3efd0e1f276bac9077ee1773dad00a_map-marker-juniper.svg',
        'berkeley': 'https://cdn.prod.website-files.com/682b3f5d34989031338d977a/696f9f82a8a9cf08631399b0_berkeley-marker.svg'
      };
      const map = new google.maps.Map(document.querySelector('[data-map]'), {
        mapId: "35bbde531ddc3a17",
        center: centerLatLng,
        zoom: 13.25,
        disableDefaultUI: true,
      });
      // const oneMoffett = new google.maps.Polygon({
      // 	paths: moffettCoords,
      // 	strokeColor: "#000000",
      // 	strokeOpacity: 0.8,
      // 	strokeWeight: 2,
      // 	fillColor: "#FFFFFF",
      // 	fillOpacity: 0,
      // 	map: map
      // });
      const infoWindow = new google.maps.InfoWindow();

      markers.forEach(([position, title, markerType], i) => {
        let markerIconURL = markerIcons['default'];
        let markerScaledSize = new google.maps.Size(28, 40);
        let markerOrigin = new google.maps.Point(0, 0);
        let markerAnchor = new google.maps.Point(14, 40);
        if (typeof markerType !== 'undefined') {
          markerIconURL = markerIcons[`${markerType}`];
          if (markerType == 'berkeley') {
            markerScaledSize = new google.maps.Size(40, 40);
            markerOrigin = new google.maps.Point(0, 0);
            markerAnchor = new google.maps.Point(20, 20);
          }
        }
        const marker = new google.maps.Marker({
          position,
          map,
          optimized: false,
          icon: {
            url: markerIconURL,
            scaledSize: markerScaledSize,
            origin: markerOrigin,
            anchor: markerAnchor,
          }
        });
        if (title !== null) {
          marker.setTitle(title);
          // Add a click listener for each marker, and set up the info window.
          marker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent('<p>' + marker.getTitle() + '</p>');
            infoWindow.open(marker.getMap(), marker);
          });
        }
      });
    };

    var mapToWatch = document.querySelector('[data-map]');
    var options = {
      rootMargin: '100px',
      threshold: 0
    };

    var observer = new IntersectionObserver(
      function(entries, self) {
        // Intersecting with Edge workaround https://calendar.perfplanet.com/2017/progressive-image-loading-using-intersection-observer-and-sqip/#comment-102838
        var isIntersecting = typeof entries[0].isIntersecting === 'boolean' ? entries[0].isIntersecting : entries[0].intersectionRatio > 0
        if (isIntersecting) {
          var mapsJS = document.createElement('script')
          mapsJS.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDHUtCgNJ6CkrNtTIOlUAGzaVpMXPJQjBA&callback=initMap';
          mapsJS.async = true;
          document.getElementsByTagName('head')[0].appendChild(mapsJS)
          self.unobserve(mapToWatch)
        }
      },
      options
    )

    observer.observe(mapToWatch);

    // window.initMap = initMap;

    // Append the 'script' element to 'body'
    // document.body.appendChild(script);
  }
}; // end map

var _interactiveMap = function() {
  if ($('.interactive-map_wrap').length) {
    $('.interactive-map_legend_item').on('click', function() {
      var zoneId = $(this).data('zone-id');
      $(this).siblings().removeClass('is-active');
      $(this).toggleClass('is-active');

      $('.interactive-map_inner .interactive-map_zone').each(function(){
        if ($(this).data('zone-id') == zoneId) {
          $(this).siblings().removeClass('is-active');
          $(this).toggleClass('is-active');
        }
      });
    });
  }
}; // end interactive map

var _lightboxes = function() {

  // Videos
  $('.popup-video').magnificPopup({
    //disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: true
  });

  $('[href="#brochure-popup"]').magnificPopup({
    type: 'inline',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,
    fixedContentPos: true
  });

  $('.popup-video-embed').magnificPopup({
    type: 'inline',
    mainClass: 'mfp-fade popup-embed-container',
    removalDelay: 500,
    callbacks: {
      open: function() {
        var vidID = this.currItem.src;
        var vid = document.querySelector(vidID + " video");
        vid.play();
      }
    }
  });

  // Inline Popup
  $('.popup-inline').magnificPopup({
    type: 'inline',
    fixedContentPos: true,
    mainClass: 'mfp-fade',
    midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  });
  $('.menu-button.popup a').magnificPopup({
    type: 'inline',
    fixedContentPos: true,
    mainClass: 'mfp-fade',
    midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  });

  // Contact Popup
  $('a[href="#contact"]').magnificPopup({
    type: 'inline',
    fixedContentPos: true,
    mainClass: 'mfp-fade contact-container',
    midClick: true, // Allow opening popup on middle mouse click. Always set it to true if you don't provide alternative source in href.
  });

  // Custom Close Button
  $(document).on("click", ".js-exit-popup", function() {
    $.magnificPopup.close();
  });

}; // end lightboxes

var _playVideo = function() {
  $(".hero-video_video_play").on('click', function(){
    $('.hero-video_video_play').fadeOut();
    $('.hero-video_video_overlay').fadeOut("slow");
    $('#landing-video').get(0).play()
  })
}; // end playVideo

var _cookieConsent = function() {
  var $can_cookies = $("#cookie-notice");
  if ($can_cookies.length > 0 && !Cookies.get('cookieConsent')) {
    $can_cookies.addClass('cookie-notice--active');
    $can_cookies.find(".btn_main_wrap").click(function(e) {
      e.preventDefault();
      Cookies.set('cookieConsent', 'true', { expires: 30 });
      $can_cookies.fadeOut(300);
    });
  }
}; // end cookie consent

var _cookiePageLoad = function() {
  var $has_link = $("#ada_enter-site");
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|bot|googlebot|crawler|spider|robot|crawling|Chrome-Lighthouse/i.test(navigator.userAgent);
  
  if ($has_link.length > 0 && !Cookies.get('shownPageLoad')) {
    // Only prevent scrolling on desktop devices
    if (!isMobile) {
      $("body").css({'overflow': 'hidden'});
    }
    $(".page-load_wrap").addClass("active");
    $(".page_wrap").removeClass("active");
  } else {
    $(".page-load_wrap").addClass("active");
    $(".page_wrap").removeClass("active");
  }

  // if a visitor doesn't wait for the video to end and clicks "Enter Site" then set a cookie and reload the page
  $("#ada_enter-site").click(function() {
    var inFifteenDays = new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000);
    Cookies.set('shownPageLoad', 'true', { expires: inFifteenDays }, '/');
    // reload the page
    location.reload();
  });

  // this is instead of cookies on the home page, which was having a cache issue.
  // not really fussy about this as it feels like a hack, but it's site launch day and this is working.
  // that said, unless I think of a better approach, it's likely to stay in place.
  // effectively, it toggles the hideme class on an element in the template-home.php file
  // hiding or showing the page load video or page content.
  // once a cookie is found that says the visitor has seen the page load, this script shows the content and
  // removes the page load because it was loading two headers with all the meta and such because of the
  // way this was originally built, which had to change late in the game due to some client requests.
  var $home_page_load = $(".page-load_wrap");
  var $home_page_content = $(".page_wrap");
  if ($home_page_load.length > 0 && !Cookies.get('shownPageLoad')) {
    // try to detect a mobile device, and if detected just remove the page load section to clean up the home page
    if( isMobile ) {
      $home_page_load.each(function(){
        $(this).remove();
      });
    } else {
      // otherwise toggle the classes to show the page load, and hide the content
      $home_page_load.each(function(){
        $(this).toggleClass('is-hidden');
      });
      $home_page_content.each(function(){
        $(this).toggleClass('is-hidden');
        $(this).remove();
      });
    }
  } else {
    // if the cookie is set then just remove the page load section to clean up the home page.
    $home_page_load.each(function(){
      $(this).remove();
    });
  }

}; // end cookie page load




// Init Function
const init = () => {
	console.debug("%cRun init", "color: lightgreen;");

  _pageLoad();
	// setupLenis();
	// initScrollAnimations();s
	finsweetStuff();
  copyrightAutoUpdate();
  _swipers();
  _map();
  _interactiveMap();
  _lightboxes();
  _playVideo();
  _cookieConsent();
  _cookiePageLoad();
}; // end init

$(window).on("load", init);