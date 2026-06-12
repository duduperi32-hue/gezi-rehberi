// =============================================================================
// Murder Drones 3D - Scene Manager (Three.js Scene Setup)
// =============================================================================

(function () {

  function SceneManager() {
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.ambientLight = null;
    this.dirLight = null;
    this.pointLightPurple = null;
    this.pointLightRed = null;
    this._container = null;
    this._clock = new THREE.Clock();
  }

  SceneManager.prototype.init = function (container) {
    this._container = container;

    var width = container.clientWidth;
    var height = container.clientHeight;

    // ---- Renderer ----
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // ---- Camera ----
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    this.camera.position.set(0, 3, 12);
    this.camera.lookAt(0, 2, 30);

    // ---- Scene ----
    this.scene = new THREE.Scene();

    // Dark purple-black fog
    this.scene.fog = new THREE.FogExp2(0x0a0612, 0.008);

    // ---- Background: dark gradient canvas texture ----
    this._createBackground();

    // ---- Lights ----

    // Ambient: cold blue, low intensity
    this.ambientLight = new THREE.AmbientLight(0x4466aa, 0.15);
    this.scene.add(this.ambientLight);

    // Directional: pale blue moonlight with shadows
    this.dirLight = new THREE.DirectionalLight(0x8899cc, 0.6);
    this.dirLight.position.set(-30, 50, -20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 200;
    this.dirLight.shadow.camera.left = -80;
    this.dirLight.shadow.camera.right = 80;
    this.dirLight.shadow.camera.top = 80;
    this.dirLight.shadow.camera.bottom = -80;
    this.dirLight.shadow.bias = -0.001;
    this.dirLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirLight);

    // Point light 1: Purple atmospheric glow
    this.pointLightPurple = new THREE.PointLight(0x9944ff, 1.2, 120);
    this.pointLightPurple.position.set(40, 20, -30);
    this.scene.add(this.pointLightPurple);

    // Point light 2: Red danger accent
    this.pointLightRed = new THREE.PointLight(0xff2244, 0.8, 100);
    this.pointLightRed.position.set(-35, 15, 25);
    this.scene.add(this.pointLightRed);

    // Hemisphere light for ambient sky/ground color
    var hemiLight = new THREE.HemisphereLight(0x334466, 0x222233, 0.4);
    this.scene.add(hemiLight);

    // Bunker interior light (warm, positioned inside the bunker)
    this.bunkerLight = new THREE.PointLight(0xFFAA66, 1.5, 80);
    this.bunkerLight.position.set(0, 5, 30);
    this.scene.add(this.bunkerLight);

    // Handle window resize
    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
  };

  /**
   * Creates a dark gradient background using a canvas texture.
   */
  SceneManager.prototype._createBackground = function () {
    var canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    var ctx2d = canvas.getContext('2d');

    var gradient = ctx2d.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0.0, '#020008');   // near-black at top
    gradient.addColorStop(0.3, '#0a0618');   // very dark purple
    gradient.addColorStop(0.6, '#120a28');   // deep purple
    gradient.addColorStop(0.85, '#180e30');  // slightly lighter purple
    gradient.addColorStop(1.0, '#1a1028');   // horizon purple tint

    ctx2d.fillStyle = gradient;
    ctx2d.fillRect(0, 0, 2, 512);

    var tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    this.scene.background = tex;
  };

  /**
   * Update loop - called each frame with delta time.
   * Subtly animates atmospheric point lights for a living feel.
   */
  SceneManager.prototype.update = function (delta) {
    var time = this._clock.getElapsedTime();

    // Gently pulse the purple light
    if (this.pointLightPurple) {
      this.pointLightPurple.intensity = 1.2 + Math.sin(time * 0.5) * 0.3;
    }

    // Gently pulse the red light
    if (this.pointLightRed) {
      this.pointLightRed.intensity = 0.8 + Math.sin(time * 0.7 + 1.5) * 0.2;
    }
  };

  /**
   * Handles window resize.
   */
  SceneManager.prototype.resize = function () {
    if (!this._container || !this.renderer || !this.camera) return;

    var width = this._container.clientWidth;
    var height = this._container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Add an Object3D to the scene.
   */
  SceneManager.prototype.addToScene = function (object) {
    if (object) this.scene.add(object);
  };

  /**
   * Remove an Object3D from the scene.
   */
  SceneManager.prototype.removeFromScene = function (object) {
    if (object) this.scene.remove(object);
  };

  /**
   * @returns {THREE.Scene}
   */
  SceneManager.prototype.getScene = function () {
    return this.scene;
  };

  /**
   * @returns {THREE.PerspectiveCamera}
   */
  SceneManager.prototype.getCamera = function () {
    return this.camera;
  };

  /**
   * @returns {THREE.WebGLRenderer}
   */
  SceneManager.prototype.getRenderer = function () {
    return this.renderer;
  };

  window.SceneManager = SceneManager;

})();
