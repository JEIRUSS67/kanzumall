// KanzumallHeroScene - Cinematic 3D hero environment
// Luxury menswear atmospheric showroom with Islamic geometric patterns
(function () {
    'use strict';

    // ─── Configuration ───────────────────────────────────────────────
    const CONFIG = {
        // Colors
        bgDeep: 0x151311,
        bgWarm: 0x38261D,
        gold: 0xD4B46A,
        warmGold: 0xFFE4B5,

        // Fog
        fogColor: 0x151311,
        fogDensity: 0.04,

        // Camera
        fov: 50,
        near: 0.1,
        far: 100,
        cameraPos: { x: 0, y: 0.5, z: 12 },
        lookAt: { x: 0, y: 0.5, z: 0 },

        // Camera drift
        driftSpeedX: 0.15,
        driftAmplitudeX: 0.3,
        driftSpeedY: 0.2,
        driftAmplitudeY: 0.15,

        // Mouse parallax
        mouseInfluence: 0.5,
        mouseLerp: 0.05,

        // Geometric wall
        wallZ: -10,
        wallWidth: 40,
        wallHeight: 25,
        patternCols: 14,
        patternRows: 9,
        patternOpacity: 0.10,

        // Image panel
        imagePath: 'assets/images/hero/hero-ceremonial-robe.jpg',
        panelWidth: 9.6,
        panelHeight: 12,
        panelPos: { x: 5, y: 0, z: -3 },

        // Particles
        particleCount: 70,
        particleSizeMin: 0.02,
        particleSizeMax: 0.05,
        particleOpacityMin: 0.15,
        particleOpacityMax: 0.4,
        particleSpreadX: 30,
        particleSpreadY: 30,
        particleSpreadZ: 20,
        particleSpeedY: 0.3,
        particleResetY: 15,
        particleStartY: -15,

        // Lighting
        ambientColor: 0x38261D,
        ambientIntensity: 0.3,
        keyLightColor: 0xFFE4B5,
        keyLightIntensity: 1.5,
        keyLightPos: { x: -10, y: 12, z: 8 },
        keyLightAngle: Math.PI / 5,
        keyLightPenumbra: 0.6,
        rimLightColor: 0xD4B46A,
        rimLightIntensity: 0.8,
        rimLightPos: { x: 8, y: 3, z: 2 },
        accentLightColor: 0xD4B46A,
        accentLightIntensity: 0.4,
        accentLightPos: { x: -5, y: -3, z: 5 },

        // Performance
        maxPixelRatio: 2,
        mobileBreakpoint: 768,
        resizeThrottleMs: 200
    };

    // ─── State ───────────────────────────────────────────────────────
    let scene, camera, renderer;
    let particleSystem, particlePositions, particleSpeeds, particlePhases;
    let geometricWall;
    let imagePanel;
    let animationFrameId;
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let clock;
    let isDestroyed = false;
    let reducedMotion = false;
    let resizeTimeout = null;
    let loadedTextures = [];
    let loadedGeometries = [];
    let loadedMaterials = [];

    // ─── Initialisation ──────────────────────────────────────────────

    /**
     * Bootstrap the hero scene.
     * Checks for WebGL support, mobile, and reduced-motion before building.
     */
    function init() {
        // 1. WebGL check
        if (!isWebGLAvailable()) {
            showFallback();
            return;
        }

        // 2. Mobile check — skip heavy 3D on small screens
        if (window.innerWidth < CONFIG.mobileBreakpoint) {
            showFallback();
            return;
        }

        // 3. Reduced-motion preference
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        try {
            // 4. Renderer
            const canvas = document.getElementById('heroCanvas');
            if (!canvas) {
                console.warn('[KanzumallHero] #heroCanvas not found');
                showFallback();
                return;
            }

            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            sizeRenderer();

            // 5. Scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(CONFIG.bgDeep);
            scene.fog = new THREE.FogExp2(CONFIG.fogColor, CONFIG.fogDensity);

            // 6. Camera
            camera = new THREE.PerspectiveCamera(
                CONFIG.fov,
                rendererAspect(),
                CONFIG.near,
                CONFIG.far
            );
            camera.position.set(CONFIG.cameraPos.x, CONFIG.cameraPos.y, CONFIG.cameraPos.z);
            camera.lookAt(CONFIG.lookAt.x, CONFIG.lookAt.y, CONFIG.lookAt.z);

            // 7. Clock
            clock = new THREE.Clock();

            // 8. Build scene contents
            setupLighting();
            geometricWall = createGeometricPattern();
            scene.add(geometricWall);
            createImagePanel();   // async texture load
            createParticles();

            // 9. Events
            window.addEventListener('resize', onResize);
            window.addEventListener('mousemove', onMouseMove);
            document.addEventListener('visibilitychange', onVisibility);

            // 10. Start render loop
            animate();

        } catch (err) {
            console.error('[KanzumallHero] Initialisation failed:', err);
            showFallback();
        }
    }

    // ─── WebGL Detection ─────────────────────────────────────────────

    function isWebGLAvailable() {
        try {
            var c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext &&
                (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // ─── Renderer Helpers ────────────────────────────────────────────

    function rendererAspect() {
        var el = renderer.domElement.parentElement || document.body;
        return el.clientWidth / (el.clientHeight || 1);
    }

    function sizeRenderer() {
        var el = renderer.domElement.parentElement || document.body;
        var w = el.clientWidth;
        var h = el.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
    }

    // ─── Islamic Geometric Pattern ───────────────────────────────────

    /**
     * Procedurally generates an Islamic geometric pattern of interlocking
     * eight-pointed stars and cross shapes using LineSegments.
     * Returns a THREE.Group positioned at the back wall.
     */
    function createGeometricPattern() {
        var group = new THREE.Group();
        var cols = CONFIG.patternCols;
        var rows = CONFIG.patternRows;
        var cellW = CONFIG.wallWidth / cols;
        var cellH = CONFIG.wallHeight / rows;
        var halfW = CONFIG.wallWidth / 2;
        var halfH = CONFIG.wallHeight / 2;

        // Collect all line-segment vertices
        var verts = [];

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                var cx = col * cellW - halfW + cellW / 2;
                var cy = row * cellH - halfH + cellH / 2;
                addStarCell(verts, cx, cy, cellW, cellH);
            }
        }

        // Build a single BufferGeometry for performance
        var positions = new Float32Array(verts.length * 3);
        for (var i = 0; i < verts.length; i++) {
            positions[i * 3] = verts[i][0];
            positions[i * 3 + 1] = verts[i][1];
            positions[i * 3 + 2] = 0;
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        loadedGeometries.push(geometry);

        var material = new THREE.LineBasicMaterial({
            color: CONFIG.gold,
            transparent: true,
            opacity: CONFIG.patternOpacity,
            depthWrite: false
        });
        loadedMaterials.push(material);

        var lines = new THREE.LineSegments(geometry, material);
        group.add(lines);

        group.position.z = CONFIG.wallZ;
        return group;
    }

    /**
     * Adds vertices for one cell of the eight-pointed star / cross pattern.
     * Each pair of consecutive vertices forms one line segment.
     */
    function addStarCell(verts, cx, cy, w, h) {
        // Proportions for the star construction
        // An eight-pointed star is formed by two overlapping squares rotated 45°.
        // We define it via octagonal outer vertices and inner intersection vertices.
        var rOuter = Math.min(w, h) * 0.48;  // radius to star tips
        var rInner = rOuter * 0.42;           // radius to inner vertices

        // 16 vertices alternating between outer tips and inner notches
        var pts = [];
        for (var i = 0; i < 16; i++) {
            var angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
            var r = (i % 2 === 0) ? rOuter : rInner;
            pts.push([
                cx + Math.cos(angle) * r,
                cy + Math.sin(angle) * r
            ]);
        }

        // Connect all 16 vertices to form the star outline
        for (var i = 0; i < 16; i++) {
            var next = (i + 1) % 16;
            verts.push(pts[i], pts[next]);
        }

        // Inner octagon connecting the inner vertices (the notch points)
        var innerPts = [];
        for (var i = 1; i < 16; i += 2) {
            innerPts.push(pts[i]);
        }
        for (var i = 0; i < innerPts.length; i++) {
            var next = (i + 1) % innerPts.length;
            verts.push(innerPts[i], innerPts[next]);
        }

        // Cross-lines through centre for added density
        for (var i = 0; i < 8; i += 2) {
            var a = pts[i * 2];       // outer tip
            var opp = pts[((i + 4) % 8) * 2]; // opposite tip
            verts.push(a, opp);
        }

        // Small decorative octagon at the very centre
        var rTiny = rOuter * 0.15;
        var ctrPts = [];
        for (var i = 0; i < 8; i++) {
            var angle = (Math.PI * 2 * i) / 8 - Math.PI / 16;
            ctrPts.push([
                cx + Math.cos(angle) * rTiny,
                cy + Math.sin(angle) * rTiny
            ]);
        }
        for (var i = 0; i < 8; i++) {
            var next = (i + 1) % 8;
            verts.push(ctrPts[i], ctrPts[next]);
        }
    }

    // ─── Image Panel ─────────────────────────────────────────────────

    /**
     * Loads the hero product image and displays it on a vertical plane
     * with warm emissive material. Handles load errors gracefully.
     */
    function createImagePanel() {
        var loader = new THREE.TextureLoader();
        loader.load(
            CONFIG.imagePath,
            // onLoad
            function (texture) {
                if (isDestroyed) return;
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                loadedTextures.push(texture);

                var geometry = new THREE.PlaneGeometry(CONFIG.panelWidth, CONFIG.panelHeight);
                loadedGeometries.push(geometry);

                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    toneMapped: false,
                    side: THREE.FrontSide
                });
                loadedMaterials.push(material);

                imagePanel = new THREE.Mesh(geometry, material);
                imagePanel.position.set(
                    CONFIG.panelPos.x,
                    CONFIG.panelPos.y,
                    CONFIG.panelPos.z
                );
                imagePanel.receiveShadow = true;
                imagePanel.castShadow = true;
                scene.add(imagePanel);

                // Subtle ground shadow beneath the panel
                var shadowGeo = new THREE.PlaneGeometry(CONFIG.panelWidth * 1.2, 2);
                loadedGeometries.push(shadowGeo);
                var shadowMat = new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.25,
                    depthWrite: false
                });
                loadedMaterials.push(shadowMat);
                var shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
                shadowPlane.position.set(
                    CONFIG.panelPos.x,
                    CONFIG.panelPos.y - CONFIG.panelHeight / 2 - 0.1,
                    CONFIG.panelPos.z + 0.05
                );
                shadowPlane.rotation.x = -Math.PI * 0.08;
                scene.add(shadowPlane);
            },
            // onProgress — unused
            undefined,
            // onError
            function (err) {
                console.warn('[KanzumallHero] Hero image failed to load:', err);
                // Scene continues without the panel
            }
        );
    }

    // ─── Particles ───────────────────────────────────────────────────

    /**
     * Creates a Points-based particle system for floating gold dust.
     * Uses a single geometry for minimal draw calls.
     */
    function createParticles() {
        var count = CONFIG.particleCount;
        particlePositions = new Float32Array(count * 3);
        var sizes = new Float32Array(count);
        var opacities = new Float32Array(count);
        particleSpeeds = new Float32Array(count);
        particlePhases = new Float32Array(count);

        for (var i = 0; i < count; i++) {
            // Random starting positions spread across the scene
            particlePositions[i * 3] = (Math.random() - 0.5) * CONFIG.particleSpreadX;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * CONFIG.particleSpreadY;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * CONFIG.particleSpreadZ - 2;

            sizes[i] = CONFIG.particleSizeMin + Math.random() * (CONFIG.particleSizeMax - CONFIG.particleSizeMin);
            opacities[i] = CONFIG.particleOpacityMin + Math.random() * (CONFIG.particleOpacityMax - CONFIG.particleOpacityMin);
            particleSpeeds[i] = 0.5 + Math.random() * 1.0;  // relative speed multiplier
            particlePhases[i] = Math.random() * Math.PI * 2;  // sine offset
        }

        var geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
        loadedGeometries.push(geometry);

        // Custom ShaderMaterial for per-particle size and opacity
        var material = new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(CONFIG.gold) },
                uPixelRatio: { value: renderer.getPixelRatio() }
            },
            vertexShader: [
                'attribute float aSize;',
                'attribute float aOpacity;',
                'varying float vOpacity;',
                'uniform float uPixelRatio;',
                'void main() {',
                '    vOpacity = aOpacity;',
                '    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
                '    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);',
                '    gl_PointSize = max(gl_PointSize, 1.0);',
                '    gl_Position = projectionMatrix * mvPosition;',
                '}'
            ].join('\n'),
            fragmentShader: [
                'uniform vec3 uColor;',
                'varying float vOpacity;',
                'void main() {',
                '    // Soft circle shape',
                '    float d = length(gl_PointCoord - vec2(0.5));',
                '    if (d > 0.5) discard;',
                '    float alpha = smoothstep(0.5, 0.15, d) * vOpacity;',
                '    gl_FragColor = vec4(uColor, alpha);',
                '}'
            ].join('\n'),
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        loadedMaterials.push(material);

        particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);
    }

    // ─── Lighting ────────────────────────────────────────────────────

    function setupLighting() {
        // Ambient fill
        var ambient = new THREE.AmbientLight(CONFIG.ambientColor, CONFIG.ambientIntensity);
        scene.add(ambient);

        // Key spotlight — warm gold, targets the image panel area
        var keyLight = new THREE.SpotLight(
            CONFIG.keyLightColor,
            CONFIG.keyLightIntensity,
            0,                      // distance (0 = infinite)
            CONFIG.keyLightAngle,
            CONFIG.keyLightPenumbra
        );
        keyLight.position.set(
            CONFIG.keyLightPos.x,
            CONFIG.keyLightPos.y,
            CONFIG.keyLightPos.z
        );
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 1;
        keyLight.shadow.camera.far = 40;
        keyLight.shadow.bias = -0.001;
        // Target near the image panel position
        keyLight.target.position.set(CONFIG.panelPos.x, CONFIG.panelPos.y, CONFIG.panelPos.z);
        scene.add(keyLight);
        scene.add(keyLight.target);

        // Rim light — behind/beside the image panel
        var rimLight = new THREE.PointLight(
            CONFIG.rimLightColor,
            CONFIG.rimLightIntensity,
            30  // distance
        );
        rimLight.position.set(
            CONFIG.rimLightPos.x,
            CONFIG.rimLightPos.y,
            CONFIG.rimLightPos.z
        );
        scene.add(rimLight);

        // Accent light — warm glow near camera bottom-left
        var accentLight = new THREE.PointLight(
            CONFIG.accentLightColor,
            CONFIG.accentLightIntensity,
            25
        );
        accentLight.position.set(
            CONFIG.accentLightPos.x,
            CONFIG.accentLightPos.y,
            CONFIG.accentLightPos.z
        );
        scene.add(accentLight);
    }

    // ─── Animation Loop ──────────────────────────────────────────────

    function animate() {
        if (isDestroyed) return;

        animationFrameId = requestAnimationFrame(animate);

        // Skip rendering when tab is hidden
        if (document.hidden) return;

        var elapsed = clock.getElapsedTime();
        var delta = clock.getDelta();

        updateCamera(elapsed);
        updateParticles(elapsed, delta);

        renderer.render(scene, camera);
    }

    /**
     * Applies slow cinematic drift and mouse parallax to the camera.
     */
    function updateCamera(t) {
        // Base position
        var bx = CONFIG.cameraPos.x;
        var by = CONFIG.cameraPos.y;
        var bz = CONFIG.cameraPos.z;

        if (!reducedMotion) {
            // Gentle oscillation
            bx += Math.sin(t * CONFIG.driftSpeedX) * CONFIG.driftAmplitudeX;
            by += Math.sin(t * CONFIG.driftSpeedY) * CONFIG.driftAmplitudeY;
        }

        // Mouse parallax — lerp toward target for smoothness
        mouse.x += (mouse.targetX - mouse.x) * CONFIG.mouseLerp;
        mouse.y += (mouse.targetY - mouse.y) * CONFIG.mouseLerp;

        bx += mouse.x * CONFIG.mouseInfluence;
        by += mouse.y * CONFIG.mouseInfluence;

        camera.position.set(bx, by, bz);
        camera.lookAt(CONFIG.lookAt.x, CONFIG.lookAt.y, CONFIG.lookAt.z);
    }

    /**
     * Drifts particles upward with sine-wave lateral motion.
     * Resets particles that leave the top of the scene.
     */
    function updateParticles(t, dt) {
        if (!particleSystem) return;
        var count = CONFIG.particleCount;
        var posAttr = particleSystem.geometry.getAttribute('position');
        var arr = posAttr.array;

        for (var i = 0; i < count; i++) {
            var ix = i * 3;
            var iy = ix + 1;
            var iz = ix + 2;

            // Upward drift
            arr[iy] += CONFIG.particleSpeedY * particleSpeeds[i] * dt;

            // Lateral sine-wave sway
            arr[ix] += Math.sin(t * 0.5 + particlePhases[i]) * 0.003;

            // Gentle depth oscillation
            arr[iz] += Math.cos(t * 0.3 + particlePhases[i]) * 0.001;

            // Reset when out of top bound
            if (arr[iy] > CONFIG.particleResetY) {
                arr[iy] = CONFIG.particleStartY + Math.random() * 2;
                arr[ix] = (Math.random() - 0.5) * CONFIG.particleSpreadX;
                arr[iz] = (Math.random() - 0.5) * CONFIG.particleSpreadZ - 2;
            }
        }

        posAttr.needsUpdate = true;
    }

    // ─── Event Handlers ──────────────────────────────────────────────

    /**
     * Throttled resize handler — updates renderer size and camera aspect.
     */
    function onResize() {
        if (resizeTimeout) return;
        resizeTimeout = setTimeout(function () {
            resizeTimeout = null;
            if (isDestroyed || !renderer) return;
            sizeRenderer();
            camera.aspect = rendererAspect();
            camera.updateProjectionMatrix();
        }, CONFIG.resizeThrottleMs);
    }

    /**
     * Normalised mouse position for parallax (-1 to 1).
     * Disabled on mobile-width viewports.
     */
    function onMouseMove(e) {
        if (window.innerWidth < CONFIG.mobileBreakpoint) return;
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
    }

    /**
     * Pauses / resumes rendering based on tab visibility.
     * The animate() loop already checks document.hidden, but we also
     * restart the clock to avoid a large delta spike on resume.
     */
    function onVisibility() {
        if (!document.hidden && clock) {
            clock.getDelta(); // consume accumulated delta
        }
    }

    // ─── Fallback ────────────────────────────────────────────────────

    /**
     * Hides the WebGL canvas and activates the CSS fallback element.
     */
    function showFallback() {
        var canvas = document.getElementById('heroCanvas');
        var fallback = document.getElementById('heroFallback');
        if (canvas) canvas.style.display = 'none';
        if (fallback) fallback.classList.add('is-active');
    }

    // ─── Cleanup ─────────────────────────────────────────────────────

    /**
     * Disposes all Three.js resources, removes event listeners, and
     * cancels the animation frame. Safe to call multiple times.
     */
    function destroy() {
        if (isDestroyed) return;
        isDestroyed = true;

        // Cancel render loop
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Remove event listeners
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('visibilitychange', onVisibility);

        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
            resizeTimeout = null;
        }

        // Dispose textures
        loadedTextures.forEach(function (tex) {
            tex.dispose();
        });
        loadedTextures = [];

        // Dispose geometries
        loadedGeometries.forEach(function (geo) {
            geo.dispose();
        });
        loadedGeometries = [];

        // Dispose materials
        loadedMaterials.forEach(function (mat) {
            mat.dispose();
        });
        loadedMaterials = [];

        // Traverse scene and dispose anything remaining
        if (scene) {
            scene.traverse(function (obj) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(function (m) { m.dispose(); });
                    } else {
                        obj.material.dispose();
                    }
                }
            });
        }

        // Dispose renderer
        if (renderer) {
            renderer.dispose();
            renderer.forceContextLoss();
            renderer = null;
        }

        scene = null;
        camera = null;
        particleSystem = null;
        geometricWall = null;
        imagePanel = null;
    }

    // ─── Public API ──────────────────────────────────────────────────

    window.KanzumallHero = { init: init, destroy: destroy };

})();
