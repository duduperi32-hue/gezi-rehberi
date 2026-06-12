// =============================================================================
// player.js - Player Controller for Murder Drones 3D
// Character: Uzi (Main Protagonist)
// =============================================================================
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Helper constants                                                   */
  /* ------------------------------------------------------------------ */
  var MOVE_SPEED       = 20;
  var SPRINT_SPEED     = 35;
  var JUMP_HEIGHT      = 3;
  var GRAVITY          = 18;
  var CAM_OFFSET       = new THREE.Vector3(0, 12, 18);
  var CAM_LOOK_OFFSET  = new THREE.Vector3(0, 3, 0);
  var CAM_LERP         = 0.08;
  var INVINCIBLE_TIME  = 1.0;   // seconds
  var EMP_COOLDOWN_MAX = 10;    // seconds
  var PLAY_AREA        = 95;    // half-extent of allowed area
  var CLAW_RANGE       = 5;
  var CLAW_ANGLE       = Math.PI / 3;
  var CLAW_DAMAGE      = 25;
  var LASER_DAMAGE     = 15;
  var LASER_SPEED      = 80;

  /* ------------------------------------------------------------------ */
  /*  Player class                                                       */
  /* ------------------------------------------------------------------ */
  function Player(sceneManager) {
    this.sceneManager = sceneManager;

    // Stats
    this.health      = 100;
    this.maxHealth   = 100;
    this.score       = 0;
    this.isAlive     = true;

    // Movement
    this.position      = new THREE.Vector3(0, 0, 0);
    this.velocity      = new THREE.Vector3();
    this.verticalSpeed = 0;
    this.isGrounded    = true;
    this.isMoving      = false;
    this.isSprinting   = false;
    this.wantsInteract = false;

    // Model
    this.model = null;

    // Input state
    this._keys = {};
    this._mouseButtons = { left: false, right: false };

    // Camera / Facing
    this.isFirstPerson = true;
    this.pitch = 0;
    this.yaw = 0;
    this._facingAngle  = 0;
    this._aimDirection = new THREE.Vector3(0, 0, -1);

    // Combat
    this.empCooldownMax = EMP_COOLDOWN_MAX;
    this.empCooldown    = 0;
    this._currentAttack = null;
    this._clawCooldown  = 0;
    this._laserCooldown = 0;

    // Damage
    this._invincibleTimer = 0;
    this._flashTimer      = 0;
    this._originalMaterials = [];

    // Animation accumulators
    this._walkCycle = 0;
    this._armSwing  = 0;

    // Bound handlers (for removal later)
    this._onKeyDown   = this._handleKeyDown.bind(this);
    this._onKeyUp     = this._handleKeyUp.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseUp   = this._handleMouseUp.bind(this);
    this._onContext    = function (e) { e.preventDefault(); };

    // Helpers
    this._raycaster   = new THREE.Raycaster();
    this._groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this._intersect   = new THREE.Vector3();
  }

  /* ------------------------------------------------------------------ */
  /*  init                                                               */
  /* ------------------------------------------------------------------ */
  Player.prototype.init = function () {
    // Create the Uzi character model
    if (window.CharacterFactory && window.CharacterFactory.createNPCByName) {
      this.model = window.CharacterFactory.createNPCByName('Uzi');
    } else {
      // Fallback
      this.model = window.CharacterFactory.createN();
    }
    
    // Scale Uzi properly for the player
    this.model.scale.set(1, 1, 1);
    this.model.position.set(0, 0.5, -45); // Start in the Classroom
    this.position.set(0, 0.5, -45);
    this.sceneManager.getScene().add(this.model);

    // Extend camera far plane for Corpse Spire visibility
    var cam = this.sceneManager.getCamera();
    if (cam) cam.far = 2000;
    if (cam) cam.updateProjectionMatrix();

    // Snapshot original emissive colours for flashing
    this._snapshotMaterials();

    // Set up camera to initial position
    var cam = this.sceneManager.getCamera();
    var desiredPos = this.position.clone().add(CAM_OFFSET);
    cam.position.copy(desiredPos);
    cam.lookAt(this.position.clone().add(CAM_LOOK_OFFSET));

    // Input listeners
    window.addEventListener('keydown',     this._onKeyDown,   false);
    window.addEventListener('keyup',       this._onKeyUp,     false);
    window.addEventListener('mousemove',   this._onMouseMove, false);
    window.addEventListener('mousedown',   this._onMouseDown, false);
    window.addEventListener('mouseup',     this._onMouseUp,   false);
    window.addEventListener('contextmenu', this._onContext,    false);
  };

  /* ------------------------------------------------------------------ */
  /*  Input handlers                                                     */
  /* ------------------------------------------------------------------ */
  Player.prototype._handleKeyDown = function (e) {
    // FPS toggle is disabled, forced First Person View
    if (e.code === 'F5') {
        e.preventDefault();
        // this.isFirstPerson = !this.isFirstPerson; 
    }
    
    if (window.DialogueUI && window.DialogueUI.isOpen()) return; // block input if dialogue open
    this._keys[e.code] = true;
    if (e.code === 'KeyE') this.useEMP();
    if (e.code === 'KeyF') this.wantsInteract = true;
    if (e.code === 'Space' && this.isGrounded) {
      this.verticalSpeed = Math.sqrt(2 * GRAVITY * JUMP_HEIGHT);
      this.isGrounded = false;
    }
  };

  Player.prototype._handleKeyUp = function (e) {
    this._keys[e.code] = false;
  };

  Player.prototype._handleMouseMove = function (e) {
    if (document.pointerLockElement !== document.body) return;
    
    this.yaw -= e.movementX * 0.002;
    this.pitch -= e.movementY * 0.002;
    
    // Clamp pitch
    var PI_2 = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-PI_2, Math.min(PI_2, this.pitch));
  };

  Player.prototype._handleMouseDown = function (e) {
    if (!this.isAlive) return;
    if (e.button === 0) {
      this._mouseButtons.left = true;
      this._performClawAttack();
    } else if (e.button === 2) {
      this._mouseButtons.right = true;
      this._performLaserShot();
    }
  };

  Player.prototype._handleMouseUp = function (e) {
    if (e.button === 0) this._mouseButtons.left  = false;
    if (e.button === 2) this._mouseButtons.right = false;
  };

  /* ------------------------------------------------------------------ */
  /*  Combat actions                                                     */
  /* ------------------------------------------------------------------ */
  Player.prototype._performClawAttack = function () {
    if (this._clawCooldown > 0) return;
    this._clawCooldown = 0.35;

    // Arm swing animation
    this._armSwing = 1.0;

    if (window.AudioManager && window.AudioManager.playClaw) {
      window.AudioManager.playClaw();
    }

    this._currentAttack = {
      type:      'claw',
      position:  this.position.clone(),
      direction: this._aimDirection.clone(),
      range:     CLAW_RANGE,
      damage:    CLAW_DAMAGE,
      angle:     CLAW_ANGLE
    };
  };

  Player.prototype._performLaserShot = function () {
    if (this._laserCooldown > 0) return;
    this._laserCooldown = 0.25;

    if (window.AudioManager && window.AudioManager.playLaser) {
      window.AudioManager.playLaser();
    }

    // Origin: player arm position (slightly in front and to the right)
    var armOffset = new THREE.Vector3(1.2, 2.5, 0);
    armOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this._facingAngle);
    var origin = this.position.clone().add(armOffset);

    this._currentAttack = {
      type:      'laser',
      origin:    origin,
      direction: this._aimDirection.clone(),
      damage:    LASER_DAMAGE,
      speed:     LASER_SPEED,
      color:     0xffdd00,
      owner:     'player'
    };
  };

  Player.prototype.useEMP = function () {
    if (this.empCooldown > 0 || !this.isAlive) return null;
    this.empCooldown = this.empCooldownMax;

    if (window.AudioManager && window.AudioManager.playEMP) {
      window.AudioManager.playEMP();
    }

    this._currentAttack = {
      type:         'emp',
      position:     this.position.clone(),
      radius:       15,
      stunDuration: 3
    };

    return this._currentAttack;
  };

  /* ------------------------------------------------------------------ */
  /*  Damage / Healing                                                   */
  /* ------------------------------------------------------------------ */
  Player.prototype.takeDamage = function (amount) {
    if (this._invincibleTimer > 0 || !this.isAlive) return;

    this.health = Math.max(0, this.health - amount);
    this._invincibleTimer = INVINCIBLE_TIME;
    this._flashTimer = INVINCIBLE_TIME;

    if (window.AudioManager && window.AudioManager.playHit) {
      window.AudioManager.playHit();
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
    }
  };

  Player.prototype.heal = function (amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  };

  Player.prototype.addScore = function (points) {
    this.score += points;
  };

  Player.prototype.getAttackInfo = function () {
    var atk = this._currentAttack;
    this._currentAttack = null;
    return atk;
  };

  /* ------------------------------------------------------------------ */
  /*  Main update                                                        */
  /* ------------------------------------------------------------------ */
  Player.prototype.update = function (delta) {
    if (!this.isAlive || !this.model) return;
    if (window.DialogueUI && window.DialogueUI.isOpen()) return; // pause logic during dialogue


    // --- Movement direction (view-relative) ---
    var forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    var right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    var moveDir = new THREE.Vector3();
    
    if (this._keys['KeyW'] || this._keys['ArrowUp'])    moveDir.add(forward);
    if (this._keys['KeyS'] || this._keys['ArrowDown'])  moveDir.sub(forward);
    if (this._keys['KeyA'] || this._keys['ArrowLeft'])  moveDir.sub(right);
    if (this._keys['KeyD'] || this._keys['ArrowRight']) moveDir.add(right);

    this.isMoving = moveDir.lengthSq() > 0;
    if (this.isMoving) moveDir.normalize();

    this.isSprinting = !!(this._keys['ShiftLeft'] || this._keys['ShiftRight']);
    var speed = this.isSprinting ? SPRINT_SPEED : MOVE_SPEED;

    this.position.x += moveDir.x * speed * delta;
    this.position.z += moveDir.z * speed * delta;

    // --- Jump / gravity ---
    var groundY = this.environment ? this.environment.getGroundY(this.position.x, this.position.z) : 0;
    
    if (!this.isGrounded) {
      this.verticalSpeed -= GRAVITY * delta;
      this.position.y += this.verticalSpeed * delta;
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.verticalSpeed = 0;
        this.isGrounded = true;
      }
    } else {
      this.position.y = groundY;
    }

    // --- Bounds ---
    // No more strict bounds, world is infinite
    // this.position.x = Math.max(-PLAY_AREA, Math.min(PLAY_AREA, this.position.x));
    // this.position.z = Math.max(-PLAY_AREA, Math.min(PLAY_AREA, this.position.z));

    // --- Aim and Apply to model ---
    this._facingAngle = this.yaw;
    this.model.rotation.y = this.yaw;
    this._aimDirection.set(0, 0, -1).applyEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));

    // --- Camera (FPS/TPS Toggle) ---
    var cam = this.sceneManager.getCamera();
    if (this.isFirstPerson) {
        cam.position.copy(this.position);
        cam.position.y += 2.35 + (this.isMoving ? Math.abs(Math.sin(this._walkCycle)) * 0.1 : 0);
        cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
        this.model.visible = false;
    } else {
        var offset = new THREE.Vector3(0, 2, 8);
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        var desiredCamPos = this.position.clone().add(offset);
        cam.position.lerp(desiredCamPos, CAM_LERP);
        cam.lookAt(this.position.clone().add(new THREE.Vector3(0, 2.35, 0)));
        this.model.visible = true;
    }

    // --- Walk / idle animations ---
    this._animateCharacter(delta);

    // --- Cooldowns ---
    if (this.empCooldown > 0)    this.empCooldown    = Math.max(0, this.empCooldown - delta);
    if (this._clawCooldown > 0)  this._clawCooldown  = Math.max(0, this._clawCooldown - delta);
    if (this._laserCooldown > 0) this._laserCooldown = Math.max(0, this._laserCooldown - delta);

    // --- Invincibility flash ---
    if (this._invincibleTimer > 0) {
      this._invincibleTimer -= delta;
      this._flashTimer -= delta;
      // Flash the model – toggle visibility at high frequency
      var flashRate = 10; // flashes per second
      var show = Math.sin(this._flashTimer * flashRate * Math.PI * 2) > 0;
      this._setModelFlash(show ? 0xff3333 : null);
      if (this._invincibleTimer <= 0) {
        this._invincibleTimer = 0;
        this._setModelFlash(null); // restore
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Character animation helpers                                        */
  /* ------------------------------------------------------------------ */
  Player.prototype._animateCharacter = function (delta) {
    if (!this.model) return;

    // Walk cycle accumulator
    if (this.isMoving) {
      var cycleSpeed = this.isSprinting ? 14 : 10;
      this._walkCycle += delta * cycleSpeed;
    } else {
      // Slowly return to idle
      this._walkCycle *= 0.9;
    }

    // Arm swing on claw attack
    if (this._armSwing > 0) {
      this._armSwing = Math.max(0, this._armSwing - delta * 4);
    }

    // Traverse model children and animate named parts
    var cycle = this._walkCycle;
    var swing = this._armSwing;

    this.model.traverse(function (child) {
      if (!child.name) return;
      var n = child.name.toLowerCase();

      // Leg bob
      if (n.indexOf('leg') !== -1 || n.indexOf('foot') !== -1) {
        if (n.indexOf('left') !== -1 || n.indexOf('_l') !== -1) {
          child.rotation.x = Math.sin(cycle) * 0.4;
        } else if (n.indexOf('right') !== -1 || n.indexOf('_r') !== -1) {
          child.rotation.x = Math.sin(cycle + Math.PI) * 0.4;
        }
      }

      // Arm swing
      if (n.indexOf('arm') !== -1) {
        var armBase = Math.sin(cycle + Math.PI) * 0.25;
        if (n.indexOf('right') !== -1 || n.indexOf('_r') !== -1) {
          // Right arm: claw attack swing
          child.rotation.x = armBase + swing * -1.8;
          child.rotation.z = swing * 0.5;
        } else {
          child.rotation.x = Math.sin(cycle) * 0.25;
        }
      }

      // Head gentle bob
      if (n.indexOf('head') !== -1) {
        child.rotation.x = Math.sin(cycle * 0.5) * 0.03;
      }
    });

    // Slight body bob when moving
    if (this.isMoving) {
      this.model.position.y = this.position.y + Math.abs(Math.sin(cycle)) * 0.15;
    } else {
      this.model.position.y = this.position.y;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Material flash helpers                                             */
  /* ------------------------------------------------------------------ */
  Player.prototype._snapshotMaterials = function () {
    var mats = this._originalMaterials;
    this.model.traverse(function (child) {
      if (child.isMesh && child.material) {
        var m = child.material;
        mats.push({
          mesh: child,
          emissive: m.emissive ? m.emissive.clone() : null,
          color: m.color ? m.color.clone() : null
        });
      }
    });
  };

  Player.prototype._setModelFlash = function (color) {
    if (color === null) {
      // Restore originals
      for (var i = 0; i < this._originalMaterials.length; i++) {
        var info = this._originalMaterials[i];
        if (info.emissive && info.mesh.material.emissive) {
          info.mesh.material.emissive.copy(info.emissive);
        }
      }
    } else {
      var flashColor = new THREE.Color(color);
      for (var j = 0; j < this._originalMaterials.length; j++) {
        var mesh = this._originalMaterials[j].mesh;
        if (mesh.material.emissive) {
          mesh.material.emissive.copy(flashColor);
        }
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Dispose / cleanup                                                  */
  /* ------------------------------------------------------------------ */
  Player.prototype.dispose = function () {
    window.removeEventListener('keydown',     this._onKeyDown);
    window.removeEventListener('keyup',       this._onKeyUp);
    window.removeEventListener('mousemove',   this._onMouseMove);
    window.removeEventListener('mousedown',   this._onMouseDown);
    window.removeEventListener('mouseup',     this._onMouseUp);
    window.removeEventListener('contextmenu', this._onContext);

    if (this.model && this.model.parent) {
      this.model.parent.remove(this.model);
    }
    if (this.model) {
      this.model.traverse(function (child) {
        if (child.geometry)  child.geometry.dispose();
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

  /* ------------------------------------------------------------------ */
  /*  Expose                                                             */
  /* ------------------------------------------------------------------ */
  window.Player = Player;

})();
