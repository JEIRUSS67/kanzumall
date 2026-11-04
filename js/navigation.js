/**
 * Kanzumall Navigation Module
 * Handles scroll detection, hamburger toggle, smooth scrolling,
 * active link highlighting, and WhatsApp FAB visibility.
 */
(function () {
    'use strict';

    /* ------------------------------------------------------------------ */
    /*  Helpers                                                            */
    /* ------------------------------------------------------------------ */

    /**
     * Throttle via requestAnimationFrame – keeps scroll work to ~16 ms ticks.
     * @param {Function} fn
     * @returns {Function}
     */
    function rafThrottle(fn) {
        var scheduled = false;
        return function () {
            if (scheduled) return;
            scheduled = true;
            requestAnimationFrame(function () {
                fn();
                scheduled = false;
            });
        };
    }

    /* ------------------------------------------------------------------ */
    /*  State / cached DOM refs                                            */
    /* ------------------------------------------------------------------ */

    var mainNav       = null;
    var hamburger     = null;
    var mobileMenu    = null;
    var navLinks      = [];
    var sections      = [];
    var whatsappFab   = null;
    var heroSection   = null;
    var footerSection = null;

    var NAV_OFFSET       = 80;   // px – fixed header height
    var SCROLL_THRESHOLD = 50;   // px – when to add 'is-scrolled'

    /* ------------------------------------------------------------------ */
    /*  1. Scroll Detection – add / remove 'is-scrolled' on #mainNav       */
    /* ------------------------------------------------------------------ */

    function handleScrollClass() {
        if (!mainNav) return;
        if (window.scrollY > SCROLL_THRESHOLD) {
            mainNav.classList.add('is-scrolled');
        } else {
            mainNav.classList.remove('is-scrolled');
        }
    }

    /* ------------------------------------------------------------------ */
    /*  2. Hamburger Toggle                                                */
    /* ------------------------------------------------------------------ */

    function openMobileMenu() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (!hamburger || !mobileMenu) return;
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
        if (mobileMenu && mobileMenu.classList.contains('is-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    /* ------------------------------------------------------------------ */
    /*  3. Mobile Link Clicks – close menu                                 */
    /* ------------------------------------------------------------------ */

    function bindMobileLinks() {
        var links = document.querySelectorAll('.mobile-menu__links a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                closeMobileMenu();
            });
        }
    }

    /* ------------------------------------------------------------------ */
    /*  4. Smooth Scroll                                                   */
    /* ------------------------------------------------------------------ */

    function smoothScrollTo(targetEl) {
        if (!targetEl) return;
        var top = targetEl.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }

    function bindSmoothScroll() {
        document.addEventListener('click', function (e) {
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;

            var hash = anchor.getAttribute('href');
            if (!hash || hash === '#') return;

            var target = document.querySelector(hash);
            if (target) {
                e.preventDefault();
                closeMobileMenu();
                smoothScrollTo(target);
                // Update URL hash without jumping
                if (history.pushState) {
                    history.pushState(null, null, hash);
                }
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  5. Active Link Highlighting                                        */
    /* ------------------------------------------------------------------ */

    function cacheSections() {
        sections = [];
        navLinks = document.querySelectorAll('.nav__link');
        for (var i = 0; i < navLinks.length; i++) {
            var href = navLinks[i].getAttribute('href');
            if (href && href.charAt(0) === '#' && href.length > 1) {
                var sec = document.querySelector(href);
                if (sec) {
                    sections.push({ el: sec, link: navLinks[i] });
                }
            }
        }
    }

    function highlightActiveLink() {
        if (sections.length === 0) return;

        var scrollPos = window.scrollY + NAV_OFFSET + 1;
        var activeIndex = -1;

        for (var i = 0; i < sections.length; i++) {
            var sec = sections[i].el;
            var top = sec.offsetTop;
            var bottom = top + sec.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                activeIndex = i;
                break;
            }
        }

        // If scrolled to bottom of page, activate last section
        if (activeIndex === -1 && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
            activeIndex = sections.length - 1;
        }

        for (var j = 0; j < sections.length; j++) {
            if (j === activeIndex) {
                sections[j].link.classList.add('is-active');
            } else {
                sections[j].link.classList.remove('is-active');
            }
        }
    }

    /* ------------------------------------------------------------------ */
    /*  6. WhatsApp FAB visibility                                         */
    /* ------------------------------------------------------------------ */

    function handleFabVisibility() {
        if (!whatsappFab) return;

        var shouldHide = false;

        // Hide when hero is fully visible (user at top of page)
        if (heroSection) {
            var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            if (window.scrollY < heroBottom - NAV_OFFSET) {
                shouldHide = true;
            }
        }

        // Hide when footer is in view
        if (!shouldHide && footerSection) {
            var footerTop = footerSection.getBoundingClientRect().top;
            if (footerTop < window.innerHeight) {
                shouldHide = true;
            }
        }

        if (shouldHide) {
            whatsappFab.classList.add('is-hidden');
        } else {
            whatsappFab.classList.remove('is-hidden');
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Unified scroll handler (throttled)                                 */
    /* ------------------------------------------------------------------ */

    var onScroll = rafThrottle(function () {
        handleScrollClass();
        highlightActiveLink();
        handleFabVisibility();
    });

    /* ------------------------------------------------------------------ */
    /*  Init                                                               */
    /* ------------------------------------------------------------------ */

    function init() {
        // Cache DOM references
        mainNav       = document.getElementById('mainNav');
        hamburger     = document.getElementById('navHamburger');
        mobileMenu    = document.getElementById('mobileMenu');
        whatsappFab   = document.getElementById('whatsappFab') || document.querySelector('.whatsapp-fab');
        heroSection   = document.querySelector('.hero') || document.getElementById('hero');
        footerSection = document.querySelector('footer') || document.getElementById('footer');

        // Hamburger
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Mobile links
        bindMobileLinks();

        // Smooth scroll
        bindSmoothScroll();

        // Cache sections for active link tracking
        cacheSections();

        // Scroll events (passive for performance)
        window.addEventListener('scroll', onScroll, { passive: true });

        // Initial calls
        handleScrollClass();
        highlightActiveLink();
        handleFabVisibility();
    }

    /* ------------------------------------------------------------------ */
    /*  Public API                                                         */
    /* ------------------------------------------------------------------ */

    window.KanzumallNav = {
        init: init
    };
})();
