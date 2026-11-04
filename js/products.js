/**
 * Kanzumall Products Module
 * Product data, WhatsApp integration, and dynamic rendering
 * for collections, products, and accessories grids.
 */
(function () {
    'use strict';

    /* ================================================================== */
    /*  DATA                                                               */
    /* ================================================================== */

    var COLLECTIONS = [
        {
            id: 'classic-kanzu',
            title: 'Classic Kanzu',
            label: 'Essential',
            image: 'assets/images/products/classic-kanzu-white.jpeg',
            count: 'Explore Collection',
            description: 'Timeless white and cream Kanzu with refined details'
        },
        {
            id: 'embroidered-kanzu',
            title: 'Embroidered Kanzu',
            label: 'Artisan',
            image: 'assets/images/products/collection-1.jpeg ', // placeholder – no image yet
            count: 'Explore Collection',
            description: 'Intricate hand-embroidered designs'
        },
        {
            id: 'moroccan-style',
            title: 'Moroccan-Style',
            label: 'Signature',
            image: 'assets/images/products/ceremonial-gold-robe.jpg',
            count: 'Explore Collection',
            description: 'Elegant North African-inspired garments'
        },
        {
            id: 'ceremonial-robes',
            title: 'Ceremonial Robes',
            label: 'Prestige',
            image: 'assets/images/hero/hero-ceremonial-robe.jpg',
            count: 'Explore Collection',
            description: 'Distinguished robes for special occasions'
        },
        {
            id: 'wedding',
            title: 'Wedding Collection',
            label: 'Bridal',
            image: 'assets/images/products/product-3.jpeg',
            count: 'View Wedding Wear',
            description: 'Complete groom styling and attire'
        },
        {
            id: 'accessories',
            title: 'Accessories',
            label: 'Complement',
            image: 'assets/images/products/product-4.jpeg',
            count: 'Browse Accessories',
            description: 'Kofia, vilemba, sandals and more'
        }
    ];

    var PRODUCTS = [
        {
            id: 'classic-white-kanzu',
            name: 'Classic White Kanzu with Silver Embroidery',
            category: 'Classic Kanzu',
            image: 'assets/images/products/classic-kanzu-white.jpeg',
            price: null, // Price available on enquiry
            badge: 'Popular',
            isSample: true
        },
        {
            id: 'ceremonial-burgundy-robe',
            name: 'Burgundy Ceremonial Robe with Gold Trim',
            category: 'Ceremonial Robes',
            image: 'assets/images/hero/hero-ceremonial-robe.jpg',
            price: null,
            badge: 'Exclusive',
            isSample: true
        },
        {
            id: 'champagne-bisht',
            name: 'Champagne Gold Bisht',
            category: 'Moroccan-Style',
            image: 'assets/images/products/ceremonial-gold-robe.jpg',
            price: null,
            badge: null,
            isSample: true
        },
        {
            id: 'embroidered-gold-kanzu',
            name: 'White Kanzu with Gold Embroidery Detail',
            category: 'Embroidered Kanzu',
            image: 'assets/images/products/classic-kanzu-white.jpeg',
            price: null,
            badge: 'New Arrival',
            isSample: true
        },
        {
            id: 'classic-cream-kanzu',
            name: 'Premium Cream Kanzu',
            category: 'Classic Kanzu',
            image: 'assets/images/products/collection-3.jpeg ',
            price: null,
            badge: null,
            isSample: true
        },
        {
            id: 'olive-embroidered',
            name: 'Olive Kanzu with Geometric Embroidery',
            category: 'Embroidered Kanzu',
            image: 'assets/images/products/collection-1.jpeg ',
            price: null,
            badge: null,
            isSample: true
        }
    ];

    var ACCESSORIES = [
        {
            id: 'traditional-kofia',
            name: 'Traditional Kofia',
            description: 'Handcrafted embroidered cap, perfect with any Kanzu',
            image: '',
            isSample: true
        },
        {
            id: 'vilemba',
            name: 'Vilemba Headwrap',
            description: 'Elegant traditional headwrap for distinguished occasions',
            image: '',
            isSample: true
        },
        {
            id: 'leather-sandals',
            name: 'Premium Leather Sandals',
            description: 'Handcrafted leather sandals for comfort and style',
            image: '',
            isSample: true
        }
    ];

    /* ================================================================== */
    /*  HELPERS                                                            */
    /* ================================================================== */

    /**
     * Escape HTML entities to prevent XSS.
     */
    function esc(str) {
        if (!str) return '';
        var el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    }

    /**
     * Generate a WhatsApp deep-link for a given product name (or generic).
     * @param {string} [productName]
     * @returns {string}
     */
    function getWhatsAppLink(productName) {
        var baseUrl = 'https://wa.me/255753803803';
        var message;
        if (productName) {
            message = 'Hello Kanzumall, I am interested in ' + productName + '. Please share the available sizes, colors, price, and ordering details.';
        } else {
            message = 'Hello Kanzumall, I would like to learn more about your collection.';
        }
        return baseUrl + '?text=' + encodeURIComponent(message);
    }

    /* ------------------------------------------------------------------ */
    /*  Placeholder image markup                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Returns HTML for an elegant placeholder when no product image exists.
     * Uses a gradient background with a centred garment silhouette SVG.
     */
    function placeholderHTML() {
        return '' +
            '<div class="product-placeholder" ' +
                'style="' +
                    'background:linear-gradient(135deg,#38261D,#151311);' +
                    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                    'width:100%;height:100%;min-height:260px;color:#6b5c52;' +
                '">' +
                // Minimal garment / wing silhouette SVG
                '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" ' +
                    'fill="none" stroke="#6b5c52" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" ' +
                    'style="opacity:.55;margin-bottom:12px">' +
                    // Stylised robe / kaftan outline
                    '<path d="M12 2 L8 6 L8 22 L16 22 L16 6 Z"/>' +
                    '<path d="M8 6 L4 8 L6 14 L8 12"/>' +
                    '<path d="M16 6 L20 8 L18 14 L16 12"/>' +
                    '<circle cx="12" cy="5" r="1.5"/>' +
                '</svg>' +
                '<span style="font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;opacity:.7">' +
                    'Image Coming Soon' +
                '</span>' +
            '</div>';
    }

    /* ================================================================== */
    /*  RENDER: Collections                                                */
    /* ================================================================== */

    /**
     * Render collection cards into the given container.
     * @param {string} containerId – e.g. 'collectionsGrid'
     */
    function renderCollections(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var html = '';

        for (var i = 0; i < COLLECTIONS.length; i++) {
            var col = COLLECTIONS[i];
            var waLink = getWhatsAppLink(col.title);

            var imageMarkup;
            if (col.image) {
                imageMarkup = '' +
                    '<div class="collection-card__image">' +
                        '<img src="' + esc(col.image) + '" alt="' + esc(col.title) + '" loading="lazy">' +
                    '</div>';
            } else {
                imageMarkup = '<div class="collection-card__image">' + placeholderHTML() + '</div>';
            }

            html += '' +
                '<a href="' + esc(waLink) + '" ' +
                    'class="collection-card anim-reveal" ' +
                    'target="_blank" rel="noopener noreferrer" ' +
                    'aria-label="Enquire about ' + esc(col.title) + '">' +
                    imageMarkup +
                    '<div class="collection-card__overlay">' +
                        '<span class="collection-card__label">' + esc(col.label) + '</span>' +
                        '<h3 class="collection-card__title">' + esc(col.title) + '</h3>' +
                        '<p class="collection-card__description">' + esc(col.description) + '</p>' +
                        '<span class="collection-card__count">' + esc(col.count) + ' &rarr;</span>' +
                    '</div>' +
                '</a>';
        }

        container.innerHTML = html;
    }

    /* ================================================================== */
    /*  RENDER: Products                                                   */
    /* ================================================================== */

    /**
     * WhatsApp SVG icon (inline) for quick-action buttons.
     */
    var WA_ICON_SVG = '' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">' +
            '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15' +
            '-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475' +
            '-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52' +
            '.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207' +
            '-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297' +
            '-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487' +
            '.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413' +
            '.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>' +
            '<path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.126 1.528 5.867L.06 23.495l5.753-1.51' +
            'A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.795 9.795 0 01' +
            '-5.003-1.374l-.36-.213-3.722.977.993-3.63-.234-.373A9.787 9.787 0 012.18 12c0-5.414' +
            ' 4.406-9.82 9.82-9.82 5.414 0 9.82 4.406 9.82 9.82 0 5.414-4.406 9.82-9.82 9.82z"/>' +
        '</svg>';

    /**
     * Render product cards into the given container.
     * @param {string} containerId – e.g. 'productsGrid'
     */
    function renderProducts(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var html = '';

        for (var i = 0; i < PRODUCTS.length; i++) {
            var p = PRODUCTS[i];
            var waLink = getWhatsAppLink(p.name);

            // Image or placeholder
            var imageContent;
            if (p.image) {
                imageContent = '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">';
            } else {
                imageContent = placeholderHTML();
            }

            // Badge
            var badgeMarkup = '';
            if (p.badge) {
                badgeMarkup = '<span class="product-card__badge">' + esc(p.badge) + '</span>';
            }

            // Price
            var priceMarkup;
            if (p.price !== null && p.price !== undefined) {
                priceMarkup = '<span class="product-card__price">' + esc(String(p.price)) + '</span>';
            } else {
                priceMarkup = '<span class="product-card__price product-card__price--enquire">Enquire for Price</span>';
            }

            html += '' +
                '<div class="product-card anim-reveal" data-product-id="' + esc(p.id) + '">' +
                    '<div class="product-card__image-wrapper">' +
                        imageContent +
                        badgeMarkup +
                        '<a href="' + esc(waLink) + '" class="product-card__quick-action" ' +
                            'target="_blank" rel="noopener noreferrer" ' +
                            'aria-label="Enquire about ' + esc(p.name) + ' on WhatsApp">' +
                            WA_ICON_SVG +
                        '</a>' +
                    '</div>' +
                    '<div class="product-card__info">' +
                        '<span class="product-card__category">' + esc(p.category) + '</span>' +
                        '<h3 class="product-card__name">' + esc(p.name) + '</h3>' +
                        priceMarkup +
                    '</div>' +
                    '<div class="product-card__actions">' +
                        '<button type="button" class="product-card__btn product-card__btn--details" ' +
                            'data-product-name="' + esc(p.name) + '">View Details</button>' +
                        '<a href="' + esc(waLink) + '" class="product-card__btn product-card__btn--enquire" ' +
                            'target="_blank" rel="noopener noreferrer">Enquire</a>' +
                    '</div>' +
                '</div>';
        }

        container.innerHTML = html;
    }

    /* ================================================================== */
    /*  RENDER: Accessories                                                */
    /* ================================================================== */

    /**
     * Render accessory cards into the given container.
     * @param {string} containerId – e.g. 'accessoriesGrid'
     */
    function renderAccessories(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var html = '';

        for (var i = 0; i < ACCESSORIES.length; i++) {
            var a = ACCESSORIES[i];
            var waLink = getWhatsAppLink(a.name);

            var imageContent;
            if (a.image) {
                imageContent = '<img src="' + esc(a.image) + '" alt="' + esc(a.name) + '" loading="lazy">';
            } else {
                imageContent = placeholderHTML();
            }

            html += '' +
                '<div class="accessory-card anim-reveal" data-accessory-id="' + esc(a.id) + '">' +
                    '<div class="accessory-card__image-wrapper">' +
                        imageContent +
                    '</div>' +
                    '<div class="accessory-card__info">' +
                        '<h3 class="accessory-card__name">' + esc(a.name) + '</h3>' +
                        '<p class="accessory-card__description">' + esc(a.description) + '</p>' +
                    '</div>' +
                    '<a href="' + esc(waLink) + '" class="accessory-card__btn" ' +
                        'target="_blank" rel="noopener noreferrer">' +
                        'Enquire ' + WA_ICON_SVG +
                    '</a>' +
                '</div>';
        }

        container.innerHTML = html;
    }

    /* ================================================================== */
    /*  VIEW DETAILS handler                                               */
    /* ================================================================== */

    function bindViewDetails() {
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.product-card__btn--details');
            if (!btn) return;

            var productName = btn.getAttribute('data-product-name');
            if (productName) {
                // Open WhatsApp enquiry for now; can be swapped for a modal later
                window.open(getWhatsAppLink(productName), '_blank', 'noopener,noreferrer');
            }
        });
    }

    /* ================================================================== */
    /*  INIT                                                               */
    /* ================================================================== */

    function init() {
        renderCollections('collectionsGrid');
        renderProducts('productsGrid');
        renderAccessories('accessoriesGrid');
        bindViewDetails();
    }

    /* ================================================================== */
    /*  PUBLIC API                                                         */
    /* ================================================================== */

    window.KanzumallProducts = {
        init: init,
        getWhatsAppLink: getWhatsAppLink,
        renderProducts: renderProducts,
        renderCollections: renderCollections,
        renderAccessories: renderAccessories
    };
})();
