// =============================================================================
// Murder Drones 3D - Utility Functions
// =============================================================================

window.Utils = {

  /**
   * Returns a random float between min (inclusive) and max (exclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randomRange: function (min, max) {
    return min + Math.random() * (max - min);
  },

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randomInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Euclidean distance between two THREE.Vector3 objects.
   * @param {THREE.Vector3} a
   * @param {THREE.Vector3} b
   * @returns {number}
   */
  distance: function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  /**
   * Linear interpolation between a and b by factor t.
   * @param {number} a
   * @param {number} b
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number}
   */
  lerp: function (a, b, t) {
    return a + (b - a) * t;
  },

  /**
   * Clamps val between min and max.
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp: function (val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  /**
   * Ease-out quadratic: decelerating to zero velocity.
   * @param {number} t - Progress (0-1)
   * @returns {number}
   */
  easeOutQuad: function (t) {
    return t * (2 - t);
  },

  /**
   * Creates a MeshStandardMaterial with emissive glow.
   * @param {number|string} color - Hex color for the glow
   * @param {number} intensity - Emissive intensity (default 2)
   * @returns {THREE.MeshStandardMaterial}
   */
  createGlowMaterial: function (color, intensity) {
    if (intensity === undefined) intensity = 2;
    var col = new THREE.Color(color);
    return new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: intensity,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95
    });
  },

  /**
   * Properly disposes a mesh's geometry and material(s) to free GPU memory.
   * Recursively handles groups / children.
   * @param {THREE.Object3D} mesh
   */
  disposeMesh: function (mesh) {
    if (!mesh) return;

    // Recurse into children first
    if (mesh.children && mesh.children.length > 0) {
      // Iterate backwards because removing children mutates the array
      for (var i = mesh.children.length - 1; i >= 0; i--) {
        window.Utils.disposeMesh(mesh.children[i]);
      }
    }

    // Dispose geometry
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    // Dispose material(s)
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        for (var j = 0; j < mesh.material.length; j++) {
          window.Utils._disposeMaterial(mesh.material[j]);
        }
      } else {
        window.Utils._disposeMaterial(mesh.material);
      }
    }

    // Remove from parent
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
  },

  /**
   * Internal: disposes a single material and its textures.
   * @param {THREE.Material} material
   */
  _disposeMaterial: function (material) {
    if (!material) return;

    // Dispose any textures the material holds
    var textureKeys = [
      'map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap',
      'envMap', 'alphaMap', 'aoMap', 'displacementMap',
      'emissiveMap', 'gradientMap', 'metalnessMap', 'roughnessMap'
    ];

    for (var i = 0; i < textureKeys.length; i++) {
      var tex = material[textureKeys[i]];
      if (tex) {
        tex.dispose();
      }
    }

    material.dispose();
  },

  Noise: new (function() {
    var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var p = new Uint8Array(256);
    for (var i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
    var perm = new Uint8Array(512);
    var permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
        permMod12[i] = (perm[i] % 12);
    }
    // Gradients for 2D. 12 vectors.
    var grad3 = [
        [1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0],
        [1,0,1], [-1,0,1], [1,0,-1], [-1,0,-1],
        [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]
    ];
    this.simplex2 = function(xin, yin) {
        var n0, n1, n2;
        var s = (xin + yin) * F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t;
        var Y0 = j - t;
        var x0 = xin - X0;
        var y0 = yin - Y0;
        var i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
        var x1 = x0 - i1 + G2;
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2;
        var y2 = y0 - 1.0 + 2.0 * G2;
        var ii = i & 255;
        var jj = j & 255;
        var gi0 = permMod12[ii + perm[jj]];
        var gi1 = permMod12[ii + i1 + perm[jj + j1]];
        var gi2 = permMod12[ii + 1 + perm[jj + 1]];
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0][0] * x0 + grad3[gi0][1] * y0);
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1][0] * x1 + grad3[gi1][1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2][0] * x2 + grad3[gi2][1] * y2);
        }
        return 70.0 * (n0 + n1 + n2);
    };
  })()
};
