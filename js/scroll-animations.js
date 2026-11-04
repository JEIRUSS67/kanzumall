/**
 * Kanzumall Scroll Animations Module
 * IntersectionObserver-based reveal animations with staggered delays,
 * lazy image handling, and reduced-motion support.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  Configuration                                                      */
    /* ------------------------------------------------------------------ */

    var OBSERVER_OPTIONS = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    var STAGGER_SELECTORS = [
        '.collections__grid > *',
        '.products__grid > *',
        '.accessories__grid > *'
    ];

    var MAX_STAGGER_INDEX = 4; // delay classes cycle 1–4

    /* ------------------------------------------------------------------ */
    /*  State                                                              */
    /* ------------------------------------------------------------------ */

    var revealObserver = null;
    var imageObserver  = null;
    var prefersReducedMotion = false;

    /* ------------------------------------------------------------------ */
    /*  Reduced-motion check                                               */
    /* ------------------------------------------------------------------ */

    function checkReducedMotion() {
        if (window.matchMedia) {
            var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            prefersReducedMotion = mq.matches;

            // Listen for changes (user toggles setting while page is open)
            if (mq.addEventListener) {
                mq.addEventListener('change', function (e) {
                    prefersReducedMotion = e.matches;
                    if (prefersReducedMotion) {
                        revealAllImmediately();
                    }
                });
            } else if (mq.addListener) {
                // Safari 13 fallback
                mq.addListener(function (e) {
                    prefersReducedMotion = e.matches;
                    if (prefersReducedMotion) {
                        revealAllImmediately();
                    }
                });
            }
        }
    }

    /**
     * Immediately mark every .anim-reveal element as visible (no animation).
     */
    function revealAllImmediately() {
        var els = document.querySelectorAll('.anim-reveal');
        for (var i = 0; i < els.length; i++) {
            els[i].classList.add('is-visible');
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Staggered delay classes                                            */
    /* ------------------------------------------------------------------ */

    /**
     * For known grid containers, add anim-reveal--delay-{1..4} to each child.
     */
    function applyStaggerDelays() {
        for (var s = 0; s < STAGGER_SELECTORS.length; s++) {
            var children = document.querySelectorAll(STAGGER_SELECTORS[s]);
            for (var i = 0; i < children.length; i++) {
                var delayIndex = (i % MAX_STAGGER_INDEX) + 1;
                children[i].classList.add('anim-reveal--delay-' + delayIndex);
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Reveal Observer                                                    */
    /* ------------------------------------------------------------------ */

    function createRevealObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: just show everything
            revealAllImmediately();
            return null;
        }

        return new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('is-visible');
                    revealObserver.unobserve(entries[i].target);
                }
            }
        }, OBSERVER_OPTIONS);
    }

    function observeRevealElements() {
        if (!revealObserver) return;

        var elements = document.querySelectorAll('.anim-reveal:not(.is-visible)');
        for (var i = 0; i < elements.length; i++) {
            revealObserver.observe(elements[i]);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Image Lazy-load Observer                                           */
    /* ------------------------------------------------------------------ */

    function createImageObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: mark all images as loaded
            var imgs = document.querySelectorAll('img[loading="lazy"]');
            for (var i = 0; i < imgs.length; i++) {
                imgs[i].classList.add('loaded');
            }
            return null;
        }

        return new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (!entry.isIntersecting) continue;

                var img = entry.target;

                // If already decoded / loaded
                if (img.naturalWidth > 0 && img.complete) {
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                } else {
                    // Wait for load event
                    img.addEventListener('load', function handleLoad() {
                        this.classList.add('loaded');
                        this.removeEventListener('load', handleLoad);
                    });
                    img.addEventListener('error', function handleError() {
                        this.classList.add('loaded'); // still remove shimmer
                        this.removeEventListener('error', handleError);
                    });
                    imageObserver.unobserve(img);
                }
            }
        }, {
            root: null,
            threshold: 0.01,
            rootMargin: '200px 0px' // start loading a bit early
        });
    }

    function observeLazyImages() {
        if (!imageObserver) return;

        var images = document.querySelectorAll('img[loading="lazy"]:not(.loaded)');
        for (var i = 0; i < images.length; i++) {
            imageObserver.observe(images[i]);
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Public: refresh                                                    */
    /* ------------------------------------------------------------------ */

    /**
     * Re-observe newly added .anim-reveal elements and lazy images.
     * Call after dynamic content insertion.
     */
    function refresh() {
        applyStaggerDelays();

        if (prefersReducedMotion) {
            revealAllImmediately();
            return;
        }

        observeRevealElements();
        observeLazyImages();
    }

    /* ------------------------------------------------------------------ */
    /*  Public: init                                                       */
    /* ------------------------------------------------------------------ */

    function init() {
        checkReducedMotion();
        applyStaggerDelays();

        if (prefersReducedMotion) {
            revealAllImmediately();
            // Still set up image observer for lazy images
            imageObserver = createImageObserver();
            observeLazyImages();
            return;
        }

        revealObserver = createRevealObserver();
        imageObserver  = createImageObserver();

        observeRevealElements();
        observeLazyImages();
    }

    /* ------------------------------------------------------------------ */
    /*  Expose                                                             */
    /* ------------------------------------------------------------------ */

    window.KanzumallAnimations = {
        init: init,
        refresh: refresh
    };
})();
