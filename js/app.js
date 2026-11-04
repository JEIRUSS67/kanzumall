/**
 * Kanzumall — Main Application Orchestrator
 * Coordinates initialization of all modules on DOMContentLoaded.
 */
(function () {
    'use strict';

    function init() {
        console.log('Kanzumall — Initializing...');

        // 1. Initialize product rendering (populates the DOM)
        if (window.KanzumallProducts) {
            window.KanzumallProducts.init();
        }

        // 2. Initialize navigation
        if (window.KanzumallNav) {
            window.KanzumallNav.init();
        }

        // 3. Initialize scroll animations (after DOM is populated)
        if (window.KanzumallAnimations) {
            window.KanzumallAnimations.init();
        }

        // 4. Initialize Three.js hero scene
        if (window.KanzumallHero) {
            // Slight delay to prioritize content rendering
            requestAnimationFrame(function () {
                window.KanzumallHero.init();
            });
        }

        // 5. Set current year in footer
        var yearEl = document.getElementById('currentYear');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }

        // 6. Handle loading state
        document.body.classList.add('is-loaded');

        console.log('Kanzumall — Ready.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
