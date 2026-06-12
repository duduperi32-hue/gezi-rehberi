// =============================================================================
// enemies.js - Enemy AI System for Murder Drones 3D
// Enemy types: Sentinel, V (aggressive), J (boss)
// =============================================================================
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Enemy stats table                                                  */
  /* ------------------------------------------------------------------ */
  var STATS = {
    sentinel: { health: 30, speed: 12, damage: 8,  points: 100, attackRate: 2.0,   preferredRange: 17, retreatRange: 10 },
    v:        { health: 80, speed: 18, damage: 20, points: 250, attackRate: 0.4,   meleeRange: 5,      retreatTime: 1.0 },
    j:        { health: 300, speed: 10, damage: 35, points: 1000, attackRate: 0.8, slamRadius: 8 }
  };

  var SEPARATION_RADIUS = 4;
  var ENEMY_Y_SENTINEL  = 4;   // sentinels hover
  var ENEMY_Y_GROUND    = 0;
  var PLAY_AREA         = 95;

  /* ================================================================== */
  /*  Enemy class                                                        */
  /* ================================================================== */
  function Enemy(type, position, scene) {
    var s = STATS[type];
    if (!s) throw new Error('Unknown enemy type: ' + type);

    this.type      = type;
    this.scene     = scene;
    this.health    = s.health;
    this.maxHealth = s.health;
    this.speed     = s.speed;
    this.damage    = s.damage;
    this.points    = s.points;
    this.isAlive   = true;
    this.isStunned = false;
    this.stunTimer = 0;
    this.position  = position.clone();
    this.model     = null;

    // Internal AI state
    this._attackTimer     = Math.random() * 1.5;
    this._currentAttack   = null;
    this._animCycle       = Math.random() * Math.PI * 2;
    this._flashTimer      = 0;
    this._originalMats    = [];
    this._deathTimer      = -1;

    // V-specific
    this._rushing         = false;
    this._meleeCombo      = 0;
    this._retreatTimer    = 0;
    this._meleeSwingTimer = 0;

    // J-specific
    this._phase           = 1;
    this._slamCooldown    = 0;
    this._phaseAnnounced  = false;
    this._enrageSpeedMul  = 1;

    // Health bar
    this._healthBar       = null;
    this._healthBarBg     = null;

    // Build model
    this._createModel();
    this.model.position.copy(this.position);
    scene.add(this.model);
  }

  /* ------------------------------------------------------------------ */
  /*  Model creation                                                     */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._createModel = function () {
    var factory = window.CharacterFactory;
    switch (this.type) {
      case 'sentinel':
        this.model = factory.createSentinel ? factory.createSentinel() : this._fallbackModel(0xff4444, 1.2);
        break;
      case 'v':
        this.model = factory.createV ? factory.createV() : this._fallbackModel(0xff0000, 1.8);
        break;
      case 'j':
        this.model = factory.createJ ? factory.createJ() : this._fallbackModel(0xffaa00, 2.4);
        break;
    }

    // Snapshot original materials for flash effects
    this._snapshotMats();

    // Create health bar above enemy
    this._createHealthBar();
  };

  Enemy.prototype._fallbackModel = function (color, scale) {
    var group = new THREE.Group();
    // Body
    var bodyGeo = new THREE.BoxGeometry(1.6, 2.0, 1.2);
    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x333344, emissive: 0x111122, metalness: 0.8, roughness: 0.3 });
    var body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.name   = 'body';
    body.position.y = 1.5;
    group.add(body);

    // Head
    var headGeo = new THREE.BoxGeometry(1.4, 1.0, 1.0);
    var headMat = new THREE.MeshStandardMaterial({ color: 0x222233, emissive: 0x0a0a15, metalness: 0.9, roughness: 0.2 });
    var head    = new THREE.Mesh(headGeo, headMat);
    head.name   = 'head';
    head.position.y = 2.8;
    group.add(head);

    // Eyes (X shape via two crossing bars)
    var eyeColor = color;
    var eyeMat   = new THREE.MeshStandardMaterial({ color: eyeColor, emissive: eyeColor, emissiveIntensity: 2.5 });
    for (var side = -1; side <= 1; side += 2) {
      for (var r = 0; r < 2; r++) {
        var bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.06), eyeMat);
        bar.rotation.z = (r === 0 ? Math.PI / 4 : -Math.PI / 4);
        bar.position.set(side * 0.35, 2.85, 0.52);
        bar.name = 'eye';
        group.add(bar);
      }
    }

    // Arms
    var armGeo = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    var armMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, metalness: 0.7, roughness: 0.4 });
    var leftArm  = new THREE.Mesh(armGeo, armMat.clone());
    leftArm.name = 'arm_left';
    leftArm.position.set(-1.1, 1.8, 0);
    group.add(leftArm);

    var rightArm = new THREE.Mesh(armGeo, armMat.clone());
    rightArm.name = 'arm_right';
    rightArm.position.set(1.1, 1.8, 0);
    group.add(rightArm);

    // Legs
    var legGeo = new THREE.BoxGeometry(0.4, 1.0, 0.4);
    var legMat = new THREE.MeshStandardMaterial({ color: 0x252535, metalness: 0.7, roughness: 0.4 });
    var leftLeg  = new THREE.Mesh(legGeo, legMat.clone());
    leftLeg.name = 'leg_left';
    leftLeg.position.set(-0.45, 0.5, 0);
    group.add(leftLeg);

    var rightLeg = new THREE.Mesh(legGeo, legMat.clone());
    rightLeg.name = 'leg_right';
    rightLeg.position.set(0.45, 0.5, 0);
    group.add(rightLeg);

    group.scale.setScalar(scale);
    return group;
  };

  Enemy.prototype._createHealthBar = function () {
    var barWidth = 2.0;
    if (this.type === 'j') barWidth = 3.5;

    var bgGeo = new THREE.PlaneGeometry(barWidth, 0.25);
    var bgMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide, depthTest: false });
    this._healthBarBg = new THREE.Mesh(bgGeo, bgMat);
    this._healthBarBg.renderOrder = 999;

    var fgGeo = new THREE.PlaneGeometry(barWidth, 0.2);
    var fgColor = this.type === 'j' ? 0xffaa00 : (this.type === 'v' ? 0xff3333 : 0xff5555);
    var fgMat = new THREE.MeshBasicMaterial({ color: fgColor, side: THREE.DoubleSide, depthTest: false });
    this._healthBar = new THREE.Mesh(fgGeo, fgMat);
    this._healthBar.renderOrder = 1000;

    var barY = this.type === 'j' ? 6.5 : (this.type === 'v' ? 5.0 : 3.5);
    this._healthBarBg.position.set(0, barY, 0);
    this._healthBar.position.set(0, barY, 0);

    this.model.add(this._healthBarBg);
    this.model.add(this._healthBar);
  };

  /* ------------------------------------------------------------------ */
  /*  Material helpers                                                   */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._snapshotMats = function () {
    var mats = this._originalMats;
    this.model.traverse(function (child) {
      if (child.isMesh && child.material) {
        mats.push({
          mesh: child,
          emissive: child.material.emissive ? child.material.emissive.clone() : null,
          color: child.material.color ? child.material.color.clone() : null
        });
      }
    });
  };

  Enemy.prototype._flashModel = function (color) {
    var c = new THREE.Color(color);
    for (var i = 0; i < this._originalMats.length; i++) {
      var m = this._originalMats[i].mesh.material;
      if (m.emissive) m.emissive.copy(c);
    }
  };

  Enemy.prototype._restoreMats = function () {
    for (var i = 0; i < this._originalMats.length; i++) {
      var info = this._originalMats[i];
      if (info.emissive && info.mesh.material.emissive) {
        info.mesh.material.emissive.copy(info.emissive);
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  update                                                             */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.update = function (delta, playerPosition, allEnemies) {
    if (!this.isAlive) return;
    this._currentAttack = null;

    // --- Flash timer ---
    if (this._flashTimer > 0) {
      this._flashTimer -= delta;
      if (this._flashTimer <= 0) this._restoreMats();
    }

    // --- Stun ---
    if (this.isStunned) {
      this.stunTimer -= delta;
      // Flash electric blue while stunned
      var stunFlash = Math.sin(this.stunTimer * 20) > 0;
      if (stunFlash) {
        this._flashModel(0x44aaff);
      } else {
        this._restoreMats();
      }
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.stunTimer = 0;
        this._restoreMats();
      }
      this.model.position.copy(this.position);
      this._updateHealthBar();
      this._billboardHealthBar();
      return;
    }

    // --- Separation force (prevent stacking) ---
    var sepForce = this._computeSeparation(allEnemies);

    // --- AI by type ---
    switch (this.type) {
      case 'sentinel': this._updateSentinel(delta, playerPosition, sepForce); break;
      case 'v':        this._updateV(delta, playerPosition, sepForce);        break;
      case 'j':        this._updateJ(delta, playerPosition, sepForce);        break;
    }

    // --- Bounds ---
    this.position.x = Math.max(-PLAY_AREA, Math.min(PLAY_AREA, this.position.x));
    this.position.z = Math.max(-PLAY_AREA, Math.min(PLAY_AREA, this.position.z));

    // --- Apply position ---
    this.model.position.copy(this.position);

    // --- Face player ---
    var toPlayer = new THREE.Vector3().subVectors(playerPosition, this.position);
    toPlayer.y = 0;
    if (toPlayer.lengthSq() > 0.1) {
      var angle = Math.atan2(toPlayer.x, toPlayer.z);
      this.model.rotation.y = angle;
    }

    // --- Animate ---
    this._animCycle += delta * 6;
    this._animateModel(delta);
    this._updateHealthBar();
    this._billboardHealthBar();
  };

  /* ------------------------------------------------------------------ */
  /*  Sentinel AI                                                        */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._updateSentinel = function (delta, playerPos, sep) {
    var toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
    toPlayer.y = 0;
    var dist = toPlayer.length();

    // Hover height
    this.position.y = ENEMY_Y_SENTINEL + Math.sin(this._animCycle * 0.8) * 0.5;

    // Move: maintain preferred range 15-20
    var s = STATS.sentinel;
    if (dist > s.preferredRange + 3) {
      // Move toward player
      var dir = toPlayer.normalize();
      this.position.x += (dir.x + sep.x) * this.speed * delta;
      this.position.z += (dir.z + sep.z) * this.speed * delta;
    } else if (dist < s.retreatRange) {
      // Retreat
      var away = toPlayer.normalize().negate();
      this.position.x += (away.x + sep.x) * this.speed * 0.6 * delta;
      this.position.z += (away.z + sep.z) * this.speed * 0.6 * delta;
    } else {
      // Strafe slightly
      var strafe = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
      this.position.x += (strafe.x * 3 + sep.x) * delta;
      this.position.z += (strafe.z * 3 + sep.z) * delta;
    }

    // Attack: fire laser
    this._attackTimer -= delta;
    if (this._attackTimer <= 0 && dist < 30) {
      this._attackTimer = s.attackRate + Math.random() * 0.5;
      var fireDir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
      this._currentAttack = {
        type:      'laser',
        origin:    this.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
        direction: fireDir,
        damage:    this.damage,
        speed:     50,
        color:     0xff4444,
        owner:     'enemy'
      };
      if (window.AudioManager && window.AudioManager.playLaser) {
        window.AudioManager.playLaser();
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  V AI                                                               */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._updateV = function (delta, playerPos, sep) {
    var toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
    toPlayer.y = 0;
    var dist = toPlayer.length();
    var s    = STATS.v;

    this.position.y = ENEMY_Y_GROUND;

    // Retreat cooldown
    if (this._retreatTimer > 0) {
      this._retreatTimer -= delta;
      // Move away from player
      var away = toPlayer.normalize().negate();
      this.position.x += (away.x + sep.x) * this.speed * 0.5 * delta;
      this.position.z += (away.z + sep.z) * this.speed * 0.5 * delta;
      return;
    }

    // Melee combo in progress
    if (this._meleeCombo > 0 && dist < s.meleeRange + 2) {
      this._meleeSwingTimer -= delta;
      if (this._meleeSwingTimer <= 0) {
        this._meleeSwingTimer = 0.15; // fast swings
        this._meleeCombo--;
        // Deliver melee hit
        this._currentAttack = {
          type:      'claw',
          position:  this.position.clone(),
          direction: toPlayer.clone().normalize(),
          range:     s.meleeRange,
          damage:    this.damage,
          angle:     Math.PI / 3
        };
        if (window.AudioManager && window.AudioManager.playClaw) {
          window.AudioManager.playClaw();
        }
        if (this._meleeCombo <= 0) {
          this._retreatTimer = s.retreatTime;
        }
      }
      return;
    }

    // Rush toward player
    if (dist > s.meleeRange) {
      var dir = toPlayer.normalize();
      var rushSpeed = this.speed * (dist < 12 ? 1.3 : 1.0); // burst when close
      this.position.x += (dir.x + sep.x) * rushSpeed * delta;
      this.position.z += (dir.z + sep.z) * rushSpeed * delta;
    } else {
      // In range -> start combo
      this._meleeCombo = 3;
      this._meleeSwingTimer = 0.1;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  J (Boss) AI                                                        */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._updateJ = function (delta, playerPos, sep) {
    var toPlayer = new THREE.Vector3().subVectors(playerPos, this.position);
    toPlayer.y = 0;
    var dist = toPlayer.length();
    var s    = STATS.j;

    this.position.y = ENEMY_Y_GROUND;

    // Determine phase
    var hpPct = this.health / this.maxHealth;
    if (hpPct > 0.6)       this._phase = 1;
    else if (hpPct > 0.3)  this._phase = 2;
    else                   this._phase = 3;

    this._slamCooldown = Math.max(0, this._slamCooldown - delta);
    this._attackTimer -= delta;

    switch (this._phase) {

      /* Phase 1: Ranged - stay at distance, rapid lasers */
      case 1:
        if (dist < 18) {
          // Back away
          var away1 = toPlayer.normalize().negate();
          this.position.x += (away1.x + sep.x) * this.speed * delta;
          this.position.z += (away1.z + sep.z) * this.speed * delta;
        } else if (dist > 28) {
          var toward1 = toPlayer.normalize();
          this.position.x += (toward1.x + sep.x) * this.speed * 0.7 * delta;
          this.position.z += (toward1.z + sep.z) * this.speed * 0.7 * delta;
        } else {
          // Strafe
          var strafe1 = new THREE.Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
          this.position.x += (strafe1.x * 5 + sep.x) * delta;
          this.position.z += (strafe1.z * 5 + sep.z) * delta;
        }

        if (this._attackTimer <= 0) {
          this._attackTimer = s.attackRate;
          var fireDir1 = toPlayer.clone().normalize();
          this._currentAttack = {
            type: 'laser', origin: this.position.clone().add(new THREE.Vector3(0, 3, 0)),
            direction: fireDir1, damage: this.damage * 0.6, speed: 60, color: 0xffaa00, owner: 'enemy'
          };
          if (window.AudioManager && window.AudioManager.playLaser) window.AudioManager.playLaser();
        }
        break;

      /* Phase 2: Alternate rush and ranged */
      case 2:
        this._enrageSpeedMul = 1.2;
        var doRush = (Math.floor(this._animCycle * 0.3) % 2 === 0);

        if (doRush) {
          // Rush like V
          if (dist > 5) {
            var dir2 = toPlayer.normalize();
            this.position.x += (dir2.x + sep.x) * this.speed * this._enrageSpeedMul * delta;
            this.position.z += (dir2.z + sep.z) * this.speed * this._enrageSpeedMul * delta;
          } else if (this._attackTimer <= 0) {
            this._attackTimer = 0.6;
            this._currentAttack = {
              type: 'claw', position: this.position.clone(),
              direction: toPlayer.clone().normalize(), range: 6, damage: this.damage, angle: Math.PI / 2.5
            };
            if (window.AudioManager && window.AudioManager.playClaw) window.AudioManager.playClaw();
          }
        } else {
          // Ranged
          if (dist < 12) {
            var away2 = toPlayer.normalize().negate();
            this.position.x += (away2.x + sep.x) * this.speed * delta;
            this.position.z += (away2.z + sep.z) * this.speed * delta;
          }
          if (this._attackTimer <= 0) {
            this._attackTimer = 0.6;
            this._currentAttack = {
              type: 'laser', origin: this.position.clone().add(new THREE.Vector3(0, 3, 0)),
              direction: toPlayer.clone().normalize(), damage: this.damage * 0.5, speed: 65,
              color: 0xff6600, owner: 'enemy'
            };
            if (window.AudioManager && window.AudioManager.playLaser) window.AudioManager.playLaser();
          }
        }
        break;

      /* Phase 3: Enraged - fast, slam AoE */
      case 3:
        this._enrageSpeedMul = 1.6;
        var rushSpeed3 = this.speed * this._enrageSpeedMul;

        // Always rush player
        if (dist > 4) {
          var dir3 = toPlayer.normalize();
          this.position.x += (dir3.x + sep.x) * rushSpeed3 * delta;
          this.position.z += (dir3.z + sep.z) * rushSpeed3 * delta;
        }

        // Slam AoE when close
        if (dist <= s.slamRadius && this._slamCooldown <= 0) {
          this._slamCooldown = 2.0;
          this._currentAttack = {
            type:      'slam',
            position:  this.position.clone(),
            radius:    s.slamRadius,
            damage:    this.damage * 1.2,
            owner:     'enemy'
          };
          if (window.AudioManager && window.AudioManager.playExplosion) window.AudioManager.playExplosion();
        } else if (this._attackTimer <= 0) {
          // Also fire lasers while rushing
          this._attackTimer = 0.5;
          this._currentAttack = {
            type: 'laser', origin: this.position.clone().add(new THREE.Vector3(0, 3, 0)),
            direction: toPlayer.clone().normalize(), damage: this.damage * 0.4, speed: 70,
            color: 0xff2200, owner: 'enemy'
          };
          if (window.AudioManager && window.AudioManager.playLaser) window.AudioManager.playLaser();
        }
        break;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Separation steering                                                */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._computeSeparation = function (allEnemies) {
    var force = new THREE.Vector3();
    if (!allEnemies) return force;
    for (var i = 0; i < allEnemies.length; i++) {
      var other = allEnemies[i];
      if (other === this || !other.isAlive) continue;
      var diff = new THREE.Vector3().subVectors(this.position, other.position);
      diff.y = 0;
      var d = diff.length();
      if (d < SEPARATION_RADIUS && d > 0.01) {
        diff.normalize().divideScalar(d); // stronger when closer
        force.add(diff);
      }
    }
    return force.multiplyScalar(8); // separation strength
  };

  /* ------------------------------------------------------------------ */
  /*  Animate model                                                      */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._animateModel = function (delta) {
    var cycle = this._animCycle;
    var self  = this;

    this.model.traverse(function (child) {
      if (!child.name) return;
      var n = child.name.toLowerCase();

      if (self.type === 'sentinel') {
        // Gentle hover bob (handled via position.y already)
        if (n.indexOf('arm') !== -1) {
          child.rotation.z = Math.sin(cycle) * 0.3;
        }
      } else {
        // Ground units: walk animation
        if (n.indexOf('leg') !== -1 || n.indexOf('foot') !== -1) {
          var legSign = (n.indexOf('left') !== -1 || n.indexOf('_l') !== -1) ? 1 : -1;
          child.rotation.x = Math.sin(cycle + legSign * Math.PI) * 0.5;
        }
        if (n.indexOf('arm') !== -1) {
          var armSign = (n.indexOf('right') !== -1 || n.indexOf('_r') !== -1) ? 1 : -1;
          var swingAmount = 0.3;
          // Extra swing during melee for V / J
          if ((self.type === 'v' && self._meleeCombo > 0) || (self.type === 'j' && self._slamCooldown > 1.5)) {
            swingAmount = 1.2;
          }
          child.rotation.x = Math.sin(cycle * 1.5 + armSign * Math.PI) * swingAmount;
        }
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Health bar                                                          */
  /* ------------------------------------------------------------------ */
  Enemy.prototype._updateHealthBar = function () {
    if (!this._healthBar) return;
    var pct = Math.max(0, this.health / this.maxHealth);
    this._healthBar.scale.x = pct;
    this._healthBar.position.x = -(1 - pct) * (this.type === 'j' ? 1.75 : 1.0);

    // Color gradient: green > yellow > red
    var r = pct < 0.5 ? 1 : (1 - pct) * 2;
    var g = pct > 0.5 ? 1 : pct * 2;
    this._healthBar.material.color.setRGB(r, g, 0.1);
  };

  Enemy.prototype._billboardHealthBar = function () {
    // Make health bars face camera (approximation: cancel parent Y rotation)
    if (this._healthBarBg) {
      this._healthBarBg.rotation.y = -this.model.rotation.y;
      this._healthBar.rotation.y   = -this.model.rotation.y;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  takeDamage                                                         */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.takeDamage = function (amount) {
    if (!this.isAlive) return;
    this.health -= amount;
    this._flashTimer = 0.15;
    this._flashModel(0xffffff);

    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  };

  /* ------------------------------------------------------------------ */
  /*  stun                                                               */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.stun = function (duration) {
    this.isStunned = true;
    this.stunTimer = duration;
  };

  /* ------------------------------------------------------------------ */
  /*  getAttackInfo                                                      */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.getAttackInfo = function () {
    var atk = this._currentAttack;
    this._currentAttack = null;
    return atk;
  };

  /* ------------------------------------------------------------------ */
  /*  die                                                                */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.die = function () {
    this.isAlive = false;

    if (window.AudioManager && window.AudioManager.playExplosion) {
      window.AudioManager.playExplosion();
    }

    // Death: spawn particle explosion and remove model
    this._spawnDeathParticles();

    if (this.model && this.model.parent) {
      this.model.parent.remove(this.model);
    }
  };

  Enemy.prototype._spawnDeathParticles = function () {
    var particleCount = this.type === 'j' ? 80 : (this.type === 'v' ? 50 : 30);
    var colors = {
      sentinel: 0xff4444,
      v:        0xff0000,
      j:        0xffaa00
    };
    var color = colors[this.type] || 0xff4444;

    // Create a temporary group of particles
    var group = new THREE.Group();
    group.position.copy(this.position);
    group.position.y += 2;
    this.scene.add(group);

    var particles = [];
    for (var i = 0; i < particleCount; i++) {
      var size = 0.1 + Math.random() * 0.3;
      var geo  = new THREE.BoxGeometry(size, size, size);
      var mat  = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 1
      });
      var p    = new THREE.Mesh(geo, mat);
      p.position.set(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      var vel = new THREE.Vector3(
        (Math.random() - 0.5) * 15,
        Math.random() * 12 + 4,
        (Math.random() - 0.5) * 15
      );
      particles.push({ mesh: p, vel: vel, life: 0.8 + Math.random() * 0.5 });
      group.add(p);
    }

    // Animate via a self-removing updater on the scene userData
    var elapsed = 0;
    var scene   = this.scene;
    var id      = '_deathParticles_' + Date.now() + '_' + Math.random();
    scene.userData[id] = function (dt) {
      elapsed += dt;
      var allDead = true;
      for (var k = 0; k < particles.length; k++) {
        var pp = particles[k];
        pp.life -= dt;
        if (pp.life <= 0) {
          pp.mesh.visible = false;
          continue;
        }
        allDead = false;
        pp.vel.y -= 18 * dt; // gravity
        pp.mesh.position.x += pp.vel.x * dt;
        pp.mesh.position.y += pp.vel.y * dt;
        pp.mesh.position.z += pp.vel.z * dt;
        pp.mesh.material.opacity = Math.max(0, pp.life / 1.0);
        pp.mesh.rotation.x += dt * 5;
        pp.mesh.rotation.z += dt * 3;
      }
      if (allDead) {
        scene.remove(group);
        group.traverse(function (c) {
          if (c.geometry)  c.geometry.dispose();
          if (c.material)  c.material.dispose();
        });
        delete scene.userData[id];
      }
    };
  };

  /* ------------------------------------------------------------------ */
  /*  dispose                                                            */
  /* ------------------------------------------------------------------ */
  Enemy.prototype.dispose = function () {
    if (this.model && this.model.parent) {
      this.model.parent.remove(this.model);
    }
    if (this.model) {
      this.model.traverse(function (child) {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(function (m) { m.dispose(); });
          } else {
            child.material.dispose();
          }
        }
      });
    }
    this.model = null;
  };

  /* ================================================================== */
  /*  EnemyManager class                                                 */
  /* ================================================================== */
  function EnemyManager(sceneManager) {
    this.sceneManager     = sceneManager;
    this.enemies          = [];
    this.currentWave      = 0;
    this.enemiesRemaining = 0;
    this.waveActive       = false;
    this.spawnPoints      = [];

    this.onWaveComplete   = null; // callback()
    this.onEnemyKilled    = null; // callback(points)

    this._spawnQueue      = [];
    this._spawnDelay      = 0;
  }

  /* ------------------------------------------------------------------ */
  /*  setSpawnPoints                                                     */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.setSpawnPoints = function (points) {
    this.spawnPoints = points;
  };

  /* ------------------------------------------------------------------ */
  /*  spawnWave                                                          */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.spawnWave = function (waveNumber) {
    this.currentWave = waveNumber;
    this.waveActive  = true;

    var sentinels = 0;
    var vs        = 0;
    var bosses    = 0;

    switch (waveNumber) {
      case 1: sentinels = 5; break;
      case 2: sentinels = 8;  vs = 1; break;
      case 3: sentinels = 6;  vs = 2; break;
      case 4: sentinels = 10; vs = 3; break;
      case 5: sentinels = 5;  vs = 2; bosses = 1; break;
      default:
        sentinels = waveNumber * 2;
        vs        = Math.floor(waveNumber / 2);
        bosses    = (waveNumber % 5 === 0) ? 1 : 0;
        break;
    }

    this.enemiesRemaining = sentinels + vs + bosses;

    // Build spawn queue with delays
    this._spawnQueue = [];
    var idx = 0;
    for (var i = 0; i < sentinels; i++) {
      this._spawnQueue.push({ type: 'sentinel', delay: idx * 0.3 });
      idx++;
    }
    for (var j = 0; j < vs; j++) {
      this._spawnQueue.push({ type: 'v', delay: idx * 0.4 });
      idx++;
    }
    for (var k = 0; k < bosses; k++) {
      this._spawnQueue.push({ type: 'j', delay: idx * 0.5 + 1.0 });
      idx++;
    }

    this._spawnDelay = 0;
  };

  /* ------------------------------------------------------------------ */
  /*  spawnBossFight (Story Specific)                                    */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.spawnBossFight = function (fightId) {
    this.enemies = []; // Clear current enemies
    this._spawnQueue = [];
    
    if (fightId === 'J_and_V') {
      // Episode 1 Pilot Boss: J and V attack
      this._spawnQueue.push({ type: 'j', delay: 0.5 });
      this._spawnQueue.push({ type: 'v', delay: 2.0 });
    }

    this._spawnDelay = 0;
  };

  /* ------------------------------------------------------------------ */
  /*  _getSpawnPosition                                                  */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype._getSpawnPosition = function () {
    if (this.spawnPoints.length > 0) {
      var idx = Math.floor(Math.random() * this.spawnPoints.length);
      var sp  = this.spawnPoints[idx];
      return new THREE.Vector3(
        sp.x + (Math.random() - 0.5) * 8,
        0,
        sp.z + (Math.random() - 0.5) * 8
      );
    }
    // Fallback: spawn around edges
    var angle  = Math.random() * Math.PI * 2;
    var radius = 40 + Math.random() * 30;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
  };

  /* ------------------------------------------------------------------ */
  /*  update                                                             */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.update = function (delta, playerPosition) {
    var scene = this.sceneManager.getScene();

    // --- Process spawn queue ---
    if (this._spawnQueue.length > 0) {
      this._spawnDelay += delta;
      while (this._spawnQueue.length > 0 && this._spawnDelay >= this._spawnQueue[0].delay) {
        var spawnInfo = this._spawnQueue.shift();
        var pos = this._getSpawnPosition();
        var enemy = new Enemy(spawnInfo.type, pos, scene);
        this.enemies.push(enemy);
      }
    }

    // --- Update death particle systems stored in scene.userData ---
    var ud = scene.userData;
    for (var key in ud) {
      if (key.indexOf('_deathParticles_') === 0 && typeof ud[key] === 'function') {
        ud[key](delta);
      }
    }

    // --- Update alive enemies ---
    var aliveList = [];
    for (var i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].isAlive) aliveList.push(this.enemies[i]);
    }

    for (var j = 0; j < aliveList.length; j++) {
      aliveList[j].update(delta, playerPosition, aliveList);
    }

    // --- Collect dead enemies ---
    var self = this;
    var cleanList = [];
    for (var k = 0; k < this.enemies.length; k++) {
      var e = this.enemies[k];
      if (!e.isAlive) {
        // Notify
        if (e.points > 0) {
          if (self.onEnemyKilled) self.onEnemyKilled(e.points);
          e.points = 0; // prevent double-counting
        }
        self.enemiesRemaining = Math.max(0, self.enemiesRemaining - 1);
        e.dispose();
      } else {
        cleanList.push(e);
      }
    }
    this.enemies = cleanList;

    // --- Check wave complete ---
    if (this.waveActive && this.enemies.length === 0 && this._spawnQueue.length === 0) {
      this.waveActive = false;
      if (this.onWaveComplete) this.onWaveComplete();
    }
  };

  /* ------------------------------------------------------------------ */
  /*  getEnemies                                                         */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.getEnemies = function () {
    var alive = [];
    for (var i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].isAlive) alive.push(this.enemies[i]);
    }
    return alive;
  };

  /* ------------------------------------------------------------------ */
  /*  applyEMP                                                           */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.applyEMP = function (position, radius, stunDuration) {
    for (var i = 0; i < this.enemies.length; i++) {
      var e = this.enemies[i];
      if (!e.isAlive) continue;
      var dist = e.position.distanceTo(position);
      if (dist <= radius) {
        e.stun(stunDuration);
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  dispose                                                            */
  /* ------------------------------------------------------------------ */
  EnemyManager.prototype.dispose = function () {
    for (var i = 0; i < this.enemies.length; i++) {
      this.enemies[i].dispose();
    }
    this.enemies = [];
    this._spawnQueue = [];
  };

  /* ------------------------------------------------------------------ */
  /*  Expose                                                             */
  /* ------------------------------------------------------------------ */
  window.Enemy        = Enemy;
  window.EnemyManager = EnemyManager;

})();
