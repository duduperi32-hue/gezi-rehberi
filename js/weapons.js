// =============================================================================
// weapons.js - Weapon / Combat Visual-Effects System for Murder Drones 3D
// =============================================================================
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Shared geometry pools (created once, reused)                       */
  /* ------------------------------------------------------------------ */
  var _particleGeo  = null;
  var _laserGeo     = null;

  function getParticleGeo() {
    if (!_particleGeo) _particleGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    return _particleGeo;
  }

  function getLaserGeo() {
    if (!_laserGeo) _laserGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 6, 1);
    // Rotate so it faces forward along Z
    _laserGeo.rotateX(Math.PI / 2);
    return _laserGeo;
  }

  /* ================================================================== */
  /*  WeaponSystem                                                       */
  /* ================================================================== */
  function WeaponSystem(sceneManager) {
    this.sceneManager  = sceneManager;
    this.projectiles   = []; // { mesh, trail[], direction, speed, damage, owner, life }
    this.effects       = []; // { group, update(delta)->bool, life }
    this.screenShake   = { active: false, intensity: 0, duration: 0, elapsed: 0 };
  }

  WeaponSystem.prototype.init = function () {
    // Pre-warm geometry pools
    getParticleGeo();
    getLaserGeo();
  };

  /* ------------------------------------------------------------------ */
  /*  fireLaser                                                          */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.fireLaser = function (origin, direction, damage, color, speed, owner) {
    var scene = this.sceneManager.getScene();

    // --- Core bolt ---
    var coreColor = color || 0xffdd00;
    var coreMat   = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 1
    });
    var core = new THREE.Mesh(getLaserGeo(), coreMat);

    // --- Glow shell ---
    var glowGeo = new THREE.CylinderGeometry(0.22, 0.22, 2.8, 6, 1);
    glowGeo.rotateX(Math.PI / 2);
    var glowMat = new THREE.MeshBasicMaterial({
      color: coreColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var glow = new THREE.Mesh(glowGeo, glowMat);

    var group = new THREE.Group();
    group.add(core);
    group.add(glow);
    group.position.copy(origin);

    // Orient along direction
    var target = origin.clone().add(direction);
    group.lookAt(target);

    // Point light for extra glow
    var light = new THREE.PointLight(coreColor, 2, 8);
    light.position.set(0, 0, 0);
    group.add(light);

    scene.add(group);

    var proj = {
      mesh:      group,
      direction: direction.clone().normalize(),
      speed:     speed || 80,
      damage:    damage || 15,
      owner:     owner || 'player',
      life:      3.0, // seconds before auto-despawn
      trail:     [],
      _trailTimer: 0
    };

    this.projectiles.push(proj);
    return proj;
  };

  /* ------------------------------------------------------------------ */
  /*  clawAttack                                                         */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.clawAttack = function (position, direction, range, angle, damage) {
    var scene = this.sceneManager.getScene();

    // --- Visual: 3 curved slash arcs ---
    var group = new THREE.Group();
    group.position.copy(position);
    group.position.y += 2;

    // Orient slash toward direction
    var aimAngle = Math.atan2(direction.x, direction.z);
    group.rotation.y = aimAngle;

    for (var i = 0; i < 3; i++) {
      var arcAngle   = angle * 0.9;
      var startAngle = -arcAngle / 2 + (i - 1) * 0.15;
      var segments   = 16;
      var arcRadius  = range * (0.6 + i * 0.15);

      var points = [];
      for (var s = 0; s <= segments; s++) {
        var t   = s / segments;
        var a   = startAngle + t * arcAngle;
        var r   = arcRadius * (0.4 + t * 0.6);
        var y   = (Math.random() - 0.5) * 0.3 + (i - 1) * 0.4;
        points.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r));
      }

      var curve = new THREE.CatmullRomCurve3(points);
      var tubeGeo = new THREE.TubeGeometry(curve, 20, 0.06 + i * 0.02, 4, false);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var tube = new THREE.Mesh(tubeGeo, tubeMat);
      group.add(tube);
    }

    scene.add(group);

    // Sparks at the arc edges
    this.createSparks(position.clone().add(new THREE.Vector3(0, 2, 0)), 12, 0xdddddd);

    // Track as effect
    var life = 0.35;
    var elapsed = 0;
    this.effects.push({
      group: group,
      life:  life,
      update: function (dt) {
        elapsed += dt;
        var t = elapsed / life;
        // Fade out
        group.traverse(function (c) {
          if (c.material && c.material.opacity !== undefined) {
            c.material.opacity = Math.max(0, 1 - t);
          }
        });
        // Expand slightly
        group.scale.setScalar(1 + t * 0.3);
        return elapsed < life;
      }
    });

    // Return hit info (the actual cone check is done here for convenience)
    return {
      position:  position.clone(),
      direction: direction.clone(),
      range:     range,
      angle:     angle,
      damage:    damage
    };
  };

  /* ------------------------------------------------------------------ */
  /*  createExplosion                                                     */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.createExplosion = function (position, radius, color) {
    var scene = this.sceneManager.getScene();
    color = color || 0xffdd00;

    var group = new THREE.Group();
    group.position.copy(position);
    scene.add(group);

    var particles = [];
    var count = 40;

    // --- Layer 1: bright core particles ---
    for (var i = 0; i < count; i++) {
      var size = 0.15 + Math.random() * 0.25;
      var mat  = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var mesh = new THREE.Mesh(getParticleGeo(), mat);
      mesh.scale.setScalar(size / 0.12); // scale relative to geo

      var vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(radius * (1.5 + Math.random() * 2));

      particles.push({ mesh: mesh, vel: vel, life: 0.4 + Math.random() * 0.3 });
      group.add(mesh);
    }

    // --- Layer 2: faint glow ring ---
    var ringGeo = new THREE.RingGeometry(0.1, radius * 0.5, 32);
    var ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    // --- Layer 3: expanding sphere flash ---
    var flashGeo = new THREE.SphereGeometry(radius * 0.3, 16, 12);
    var flashMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var flash = new THREE.Mesh(flashGeo, flashMat);
    group.add(flash);

    // Point light burst
    var light = new THREE.PointLight(color, 5, radius * 3);
    group.add(light);

    // Screen shake
    this.triggerScreenShake(0.5, 0.3);

    var elapsed = 0;
    var duration = 0.6;
    var self = this;

    this.effects.push({
      group: group,
      life: duration,
      update: function (dt) {
        elapsed += dt;
        var t = elapsed / duration;

        // Particles
        for (var k = 0; k < particles.length; k++) {
          var pp = particles[k];
          pp.life -= dt;
          if (pp.life <= 0) { pp.mesh.visible = false; continue; }
          pp.vel.y -= 15 * dt;
          pp.mesh.position.x += pp.vel.x * dt;
          pp.mesh.position.y += pp.vel.y * dt;
          pp.mesh.position.z += pp.vel.z * dt;
          pp.mesh.material.opacity = Math.max(0, pp.life / 0.6);
          pp.mesh.rotation.x += dt * 8;
        }

        // Ring expand
        ring.scale.setScalar(1 + t * 3);
        ring.material.opacity = Math.max(0, 0.5 * (1 - t));

        // Flash shrink
        flash.scale.setScalar(1 + t * 2);
        flash.material.opacity = Math.max(0, 0.6 * (1 - t * 2));

        // Light fade
        light.intensity = Math.max(0, 5 * (1 - t));

        return elapsed < duration;
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*  createEMPWave                                                      */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.createEMPWave = function (position, radius) {
    var scene = this.sceneManager.getScene();

    var group = new THREE.Group();
    group.position.copy(position);
    scene.add(group);

    // --- Expanding wireframe sphere ---
    var sphereGeo = new THREE.SphereGeometry(1, 24, 16);
    var sphereMat = new THREE.MeshBasicMaterial({
      color: 0x44ddff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphere);

    // --- Inner glow sphere ---
    var innerGeo = new THREE.SphereGeometry(1, 16, 12);
    var innerMat = new THREE.MeshBasicMaterial({
      color: 0x2288ff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    var inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    // --- Electric arc lines ---
    var arcs = [];
    var arcCount = 12;
    for (var i = 0; i < arcCount; i++) {
      var points = [];
      var segCount = 8;
      for (var s = 0; s <= segCount; s++) {
        var t = s / segCount;
        var theta = Math.random() * Math.PI * 2;
        var phi   = Math.random() * Math.PI;
        var r     = t; // grows with sphere
        points.push(new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.cos(phi) * r,
          Math.sin(phi) * Math.sin(theta) * r
        ));
      }
      var curve   = new THREE.CatmullRomCurve3(points);
      var tubeGeo = new THREE.TubeGeometry(curve, segCount * 2, 0.03, 3, false);
      var tubeMat = new THREE.MeshBasicMaterial({
        color: 0x88eeff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var tube = new THREE.Mesh(tubeGeo, tubeMat);
      arcs.push({ mesh: tube, basePoints: points });
      group.add(tube);
    }

    // Point light
    var light = new THREE.PointLight(0x44ddff, 4, radius * 2);
    group.add(light);

    // Screen shake
    this.triggerScreenShake(0.3, 0.4);

    var elapsed  = 0;
    var duration = 0.5;

    this.effects.push({
      group: group,
      life:  duration,
      update: function (dt) {
        elapsed += dt;
        var t = elapsed / duration;
        var currentRadius = radius * t;

        // Expand
        sphere.scale.setScalar(currentRadius);
        inner.scale.setScalar(currentRadius * 0.95);

        // Fade
        sphereMat.opacity = Math.max(0, 0.8 * (1 - t));
        innerMat.opacity  = Math.max(0, 0.25 * (1 - t));

        // Scale arcs
        for (var a = 0; a < arcs.length; a++) {
          arcs[a].mesh.scale.setScalar(currentRadius);
          arcs[a].mesh.material.opacity = Math.max(0, 0.9 * (1 - t));
          // Jitter arcs by randomly rotating
          arcs[a].mesh.rotation.x += (Math.random() - 0.5) * 0.5;
          arcs[a].mesh.rotation.y += (Math.random() - 0.5) * 0.5;
        }

        // Light
        light.intensity = Math.max(0, 4 * (1 - t));
        light.distance  = currentRadius * 2;

        return elapsed < duration;
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*  createSparks                                                       */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.createSparks = function (position, count, color) {
    var scene = this.sceneManager.getScene();
    count = count || 8;
    color = color || 0xffdd44;

    var group = new THREE.Group();
    group.position.copy(position);
    scene.add(group);

    var sparks = [];
    for (var i = 0; i < count; i++) {
      var mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      var size = 0.05 + Math.random() * 0.08;
      var mesh = new THREE.Mesh(getParticleGeo(), mat);
      mesh.scale.setScalar(size / 0.12);

      var vel = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 10
      );

      sparks.push({ mesh: mesh, vel: vel, life: 0.3 + Math.random() * 0.2 });
      group.add(mesh);
    }

    var elapsed  = 0;
    var maxLife  = 0.6;

    this.effects.push({
      group: group,
      life:  maxLife,
      update: function (dt) {
        elapsed += dt;
        var allDead = true;
        for (var k = 0; k < sparks.length; k++) {
          var s = sparks[k];
          s.life -= dt;
          if (s.life <= 0) { s.mesh.visible = false; continue; }
          allDead = false;
          s.vel.y -= 20 * dt; // gravity
          s.mesh.position.x += s.vel.x * dt;
          s.mesh.position.y += s.vel.y * dt;
          s.mesh.position.z += s.vel.z * dt;
          s.mesh.material.opacity = Math.max(0, s.life / 0.4);
        }
        return !allDead;
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*  update - main tick                                                 */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.update = function (delta) {
    var scene = this.sceneManager.getScene();

    // --- Update projectiles ---
    var aliveProjectiles = [];
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      p.life -= delta;

      // Move
      p.mesh.position.x += p.direction.x * p.speed * delta;
      p.mesh.position.y += p.direction.y * p.speed * delta;
      p.mesh.position.z += p.direction.z * p.speed * delta;

      // Bounds check
      var pos = p.mesh.position;
      var outOfBounds = Math.abs(pos.x) > 120 || Math.abs(pos.z) > 120 || pos.y < -5 || pos.y > 60;

      if (p.life <= 0 || outOfBounds) {
        // Remove
        scene.remove(p.mesh);
        p.mesh.traverse(function (c) {
          if (c.geometry)  c.geometry.dispose();
          if (c.material)  c.material.dispose();
        });
        // Remove trail
        for (var t = 0; t < p.trail.length; t++) {
          scene.remove(p.trail[t]);
          p.trail[t].traverse(function (c) {
            if (c.geometry)  c.geometry.dispose();
            if (c.material)  c.material.dispose();
          });
        }
      } else {
        // --- Trail effect ---
        p._trailTimer += delta;
        if (p._trailTimer >= 0.02) {
          p._trailTimer = 0;
          this._spawnTrailSegment(p, scene);
        }

        // --- Update trail ---
        var cleanTrail = [];
        for (var j = 0; j < p.trail.length; j++) {
          var seg = p.trail[j];
          seg.userData._life -= delta;
          if (seg.userData._life <= 0) {
            scene.remove(seg);
            seg.traverse(function (c) {
              if (c.geometry)  c.geometry.dispose();
              if (c.material)  c.material.dispose();
            });
          } else {
            seg.material.opacity = seg.userData._life / seg.userData._maxLife;
            seg.scale.setScalar(seg.userData._life / seg.userData._maxLife);
            cleanTrail.push(seg);
          }
        }
        p.trail = cleanTrail;

        aliveProjectiles.push(p);
      }
    }
    this.projectiles = aliveProjectiles;

    // --- Update effects ---
    var aliveEffects = [];
    for (var k = 0; k < this.effects.length; k++) {
      var eff = this.effects[k];
      var alive = eff.update(delta);
      if (!alive) {
        // Remove
        if (eff.group && eff.group.parent) {
          eff.group.parent.remove(eff.group);
        }
        if (eff.group) {
          eff.group.traverse(function (c) {
            if (c.geometry)  c.geometry.dispose();
            if (c.material)  c.material.dispose();
          });
        }
      } else {
        aliveEffects.push(eff);
      }
    }
    this.effects = aliveEffects;

    // --- Screen shake ---
    if (this.screenShake.active) {
      this.screenShake.elapsed += delta;
      if (this.screenShake.elapsed >= this.screenShake.duration) {
        this.screenShake.active = false;
        this.screenShake.intensity = 0;
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  _spawnTrailSegment (internal)                                      */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype._spawnTrailSegment = function (proj, scene) {
    var color = 0xffdd00;
    // Determine color from the core mesh
    if (proj.mesh.children && proj.mesh.children[0] && proj.mesh.children[0].material) {
      color = proj.mesh.children[0].material.color.getHex();
    }

    var trailMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var trailGeo = new THREE.SphereGeometry(0.12, 4, 3);
    var trail    = new THREE.Mesh(trailGeo, trailMat);
    trail.position.copy(proj.mesh.position);
    trail.userData._life    = 0.15;
    trail.userData._maxLife = 0.15;

    scene.add(trail);
    proj.trail.push(trail);

    // Cap trail length
    if (proj.trail.length > 20) {
      var old = proj.trail.shift();
      scene.remove(old);
      old.geometry.dispose();
      old.material.dispose();
    }
  };

  /* ------------------------------------------------------------------ */
  /*  checkProjectileHits                                                */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.checkProjectileHits = function (entities, ownerType) {
    var hits = [];
    var hitRadius = 2;
    var scene = this.sceneManager.getScene();

    var remainingProjectiles = [];
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      if (p.owner !== ownerType) {
        remainingProjectiles.push(p);
        continue;
      }

      var wasHit = false;
      for (var j = 0; j < entities.length; j++) {
        var e = entities[j];
        if (!e.isAlive) continue;

        var ePos = e.position || (e.model ? e.model.position : null);
        if (!ePos) continue;

        var dist = p.mesh.position.distanceTo(ePos);
        if (dist <= hitRadius) {
          hits.push({
            entity:     e,
            damage:     p.damage,
            projectile: p,
            hitPos:     p.mesh.position.clone()
          });
          wasHit = true;

          // Remove projectile
          scene.remove(p.mesh);
          p.mesh.traverse(function (c) {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
          });
          for (var t = 0; t < p.trail.length; t++) {
            scene.remove(p.trail[t]);
            p.trail[t].traverse(function (c) {
              if (c.geometry) c.geometry.dispose();
              if (c.material) c.material.dispose();
            });
          }
          p.trail = [];
          break; // one hit per projectile
        }
      }

      if (!wasHit) {
        remainingProjectiles.push(p);
      }
    }

    this.projectiles = remainingProjectiles;
    return hits;
  };

  /* ------------------------------------------------------------------ */
  /*  triggerScreenShake                                                  */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.triggerScreenShake = function (intensity, duration) {
    this.screenShake.active    = true;
    this.screenShake.intensity = Math.max(this.screenShake.intensity, intensity);
    this.screenShake.duration  = Math.max(this.screenShake.duration, duration);
    this.screenShake.elapsed   = 0;
  };

  /* ------------------------------------------------------------------ */
  /*  dispose                                                            */
  /* ------------------------------------------------------------------ */
  WeaponSystem.prototype.dispose = function () {
    var scene = this.sceneManager.getScene();

    // Projectiles
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      if (p.mesh && p.mesh.parent) p.mesh.parent.remove(p.mesh);
      p.mesh.traverse(function (c) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      for (var t = 0; t < p.trail.length; t++) {
        if (p.trail[t].parent) p.trail[t].parent.remove(p.trail[t]);
        p.trail[t].traverse(function (c) {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      }
    }
    this.projectiles = [];

    // Effects
    for (var j = 0; j < this.effects.length; j++) {
      var eff = this.effects[j];
      if (eff.group && eff.group.parent) eff.group.parent.remove(eff.group);
      if (eff.group) {
        eff.group.traverse(function (c) {
          if (c.geometry) c.geometry.dispose();
          if (c.material) c.material.dispose();
        });
      }
    }
    this.effects = [];

    this.screenShake.active = false;
  };

  /* ------------------------------------------------------------------ */
  /*  Expose                                                             */
  /* ------------------------------------------------------------------ */
  window.WeaponSystem = WeaponSystem;

})();
