(function () {
  'use strict';

  // ═══════════════════════════════════════════════════
  //  LOADING SCREEN
  // ═══════════════════════════════════════════════════
  var loadingScreen = document.getElementById('loading-screen');
  var loadingBar = document.getElementById('loading-bar');
  var loadProgress = 0;

  function updateLoading(progress) {
    loadProgress = Math.min(100, progress);
    if (loadingBar) loadingBar.style.width = loadProgress + '%';
  }

  updateLoading(10);

  // ═══════════════════════════════════════════════════
  //  INITIALIZE CORE SYSTEMS
  // ═══════════════════════════════════════════════════
  var container = document.getElementById('game-container');

  var sceneManager = new window.SceneManager();
  sceneManager.init(container);
  updateLoading(20);

  var environment = new window.Environment(sceneManager);
  environment.init();
  updateLoading(45);

  var weaponSystem = new window.WeaponSystem(sceneManager);
  weaponSystem.init();
  updateLoading(55);

  var player = new window.Player(sceneManager);
  player.environment = environment;
  player.init();
  updateLoading(65);

  var enemyManager = new window.EnemyManager(sceneManager);
  enemyManager.environment = environment;
  enemyManager.setSpawnPoints(environment.getSpawnPoints());
  updateLoading(75);

  enemyManager.onWaveComplete = function () {
    setTimeout(function () {
      if (gameState.storyPhase === 3) {
        showStoryBanner('BÖLÜM 1 TAMAMLANDI', 'Tebrikler Uzi, hayatta kaldın!', 5000);
        gameState.storyPhase = 4;
      }
    }, 3000);
  };

  enemyManager.onEnemyKilled = function (points) {
    player.addScore(points);
    showHitMarker();
  };

  if (window.AudioManager) {
    window.AudioManager.init();
  }
  updateLoading(80);

  var clock = new THREE.Clock();

  // ═══════════════════════════════════════════════════
  //  SPAWN NPCs INSIDE THE BUNKER
  // ═══════════════════════════════════════════════════
  var npcs = [];
  var npcs = [];
  // Correct pilot characters: Teacher (Classroom), Thad (Hallway), Khan (Doors), N (Outside)
  var npcNames = ['Teacher', 'Thad', 'Khan', 'N'];
  var npcPositions = [
    { x: 0, z: -45 },  // Teacher in Classroom
    { x: -5, z: -20 }, // Thad in Hallway
    { x: 0, z: -5 },   // Khan at Blast Door 1
    { x: 0, z: 80 }    // N outside in the snow
  ];

  for (var i = 0; i < npcNames.length; i++) {
    var n = window.CharacterFactory.createNPCByName(npcNames[i]);
    if (n) {
      var pos = npcPositions[i];
      n.position.set(pos.x, 0.1, pos.z);
      sceneManager.getScene().add(n);
      npcs.push(n);
    }
  }
  updateLoading(90);

  // ═══════════════════════════════════════════════════
  //  UI ELEMENTS
  // ═══════════════════════════════════════════════════
  var startScreen = document.getElementById('start-screen');
  var startBtn = document.getElementById('start-btn');
  var crosshair = document.getElementById('crosshair');
  var hud = document.getElementById('hud');
  var vignette = document.getElementById('vignette');
  var camMode = document.getElementById('cam-mode');
  var storyBanner = document.getElementById('story-banner');
  var gameOverScreen = document.getElementById('game-over');
  var restartBtn = document.getElementById('restart-btn');

  // HUD elements
  var healthBar = document.getElementById('health-bar');
  var healthText = document.getElementById('health-text');
  var scoreDisplay = document.getElementById('score-display');
  var waveDisplay = document.getElementById('wave-display');
  var locationDisplay = document.getElementById('location-display');
  var empBar = document.getElementById('emp-bar');
  var goScore = document.getElementById('go-score');

  // Interaction Prompt
  var interactPrompt = document.createElement('div');
  interactPrompt.style.cssText = 'position:fixed;bottom:18%;left:50%;transform:translateX(-50%);padding:10px 28px;' +
    'background:rgba(10,10,20,0.85);color:#BB7DE8;border:1px solid rgba(155,89,182,0.3);border-radius:4px;' +
    'font-size:16px;font-family:Orbitron,monospace;letter-spacing:3px;display:none;pointer-events:none;z-index:20;';
  document.body.appendChild(interactPrompt);

  // Hit marker
  var hitMarker = document.getElementById('hit-marker');
  var hitMarkerTimeout = null;
  function showHitMarker() {
    if (hitMarker) {
      hitMarker.classList.add('show');
      if (hitMarkerTimeout) clearTimeout(hitMarkerTimeout);
      hitMarkerTimeout = setTimeout(function () {
        hitMarker.classList.remove('show');
      }, 150);
    }
  }

  // Story banner
  var bannerTimeout = null;
  function showStoryBanner(title, subtitle, duration) {
    if (!storyBanner) return;
    storyBanner.innerHTML = title + (subtitle ? '<div class="banner-sub">' + subtitle + '</div>' : '');
    storyBanner.classList.add('show');
    if (bannerTimeout) clearTimeout(bannerTimeout);
    bannerTimeout = setTimeout(function () {
      storyBanner.classList.remove('show');
    }, duration || 3000);
  }

  // Initialize Dialogue UI
  if (window.DialogueUI) {
    window.DialogueUI.init();
  }

  // ═══════════════════════════════════════════════════
  //  GAME STATE
  // ═══════════════════════════════════════════════════
  var gameState = {
    started: false,
    doorsOpened: false,
    firstWaveTriggered: false,
    storyPhase: 0 // 0=bunker, 1=doors opening, 2=outside, 3=combat
  };

  // ═══════════════════════════════════════════════════
  //  LOADING COMPLETE → SHOW START SCREEN
  // ═══════════════════════════════════════════════════
  updateLoading(100);
  setTimeout(function () {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(function () { loadingScreen.style.display = 'none'; }, 600);
    }
    startScreen.style.display = 'flex';
  }, 800);

  // ═══════════════════════════════════════════════════
  //  START BUTTON & POINTER LOCK
  // ═══════════════════════════════════════════════════
  startBtn.addEventListener('click', function () {
    document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
    document.body.requestPointerLock();
  });

  if (restartBtn) {
    restartBtn.addEventListener('click', function () {
      location.reload();
    });
  }

  document.addEventListener('pointerlockchange', function () {
    if (document.pointerLockElement === document.body) {
      startScreen.style.display = 'none';
      crosshair.style.display = 'block';
      hud.classList.add('active');
      if (vignette) vignette.style.display = 'block';
      if (camMode) camMode.style.display = 'block';

      if (!gameState.started) {
        gameState.started = true;
        showStoryBanner('OUTPOST 3 — SIĞINAK', 'Copper-9 Yüzeyi Altı', 4000);
      }
    } else {
      crosshair.style.display = 'none';
      if (window.DialogueUI && !window.DialogueUI.isOpen()) {
        startScreen.style.display = 'flex';
        hud.classList.remove('active');
        if (vignette) vignette.style.display = 'none';
        if (camMode) camMode.style.display = 'none';
      }
    }
  });

  // ═══════════════════════════════════════════════════
  //  COMBAT HELPERS
  // ═══════════════════════════════════════════════════
  function checkMeleeHit(attackerPos, direction, range, angle, targetPos) {
    var toTarget = new THREE.Vector3().subVectors(targetPos, attackerPos);
    toTarget.y = 0;
    var dist = toTarget.length();
    if (dist > range) return false;
    toTarget.normalize();
    var dot = direction.dot(toTarget);
    var hitAngle = Math.acos(Math.max(-1, Math.min(1, dot)));
    return hitAngle <= angle / 2;
  }

  function handleAttack(atk) {
    if (!atk) return;

    if (atk.type === 'laser') {
      weaponSystem.fireLaser(atk.origin, atk.direction, atk.damage, atk.color, atk.speed, atk.owner);
    } else if (atk.type === 'claw') {
      weaponSystem.clawAttack(atk.position, atk.direction, atk.range, atk.angle, atk.damage);
      var isPlayerAttacking = (atk.damage === 25);
      if (isPlayerAttacking) {
        var enemies = enemyManager.getEnemies();
        for (var i = 0; i < enemies.length; i++) {
          if (checkMeleeHit(atk.position, atk.direction, atk.range, atk.angle, enemies[i].position)) {
            enemies[i].takeDamage(atk.damage);
            weaponSystem.createSparks(enemies[i].position, 5, 0xff0000);
            showHitMarker();
          }
        }
      } else {
        if (checkMeleeHit(atk.position, atk.direction, atk.range, atk.angle, player.position)) {
          player.takeDamage(atk.damage);
          weaponSystem.createSparks(player.position, 5, 0x00ff00);
        }
      }
    } else if (atk.type === 'slam') {
      weaponSystem.createExplosion(atk.position, atk.radius, 0xffaa00);
      if (player.position.distanceTo(atk.position) <= atk.radius) {
        player.takeDamage(atk.damage);
      }
    } else if (atk.type === 'emp') {
      weaponSystem.createEMPWave(atk.position, atk.radius);
      enemyManager.applyEMP(atk.position, atk.radius, atk.stunDuration);
    }
  }

  // ═══════════════════════════════════════════════════
  //  STORY TRIGGERS
  // ═══════════════════════════════════════════════════
  function checkStoryTriggers() {
    // If player walks near the doors (z > 50) and doors haven't opened yet
    if (!gameState.doorsOpened && player.position.z > 45) {
      gameState.doorsOpened = true;
      if (environment.bunkerDoors) {
        environment.bunkerDoors.userData.isOpen = true;
      }
      showStoryBanner('KAPILAR AÇILIYOR', 'Khan\'ın kapıları harekete geçti...', 4000);
      gameState.storyPhase = 1;
    }

    // If player exits bunker (z > 65)
    if (!gameState.firstWaveTriggered && player.position.z > 65) {
      // Just a warning, actual boss triggers via N dialogue
      showStoryBanner('DIŞ YÜZEY', 'Disassembly Drone\'lara dikkat et!', 3000);
      gameState.firstWaveTriggered = true; // Prevent re-triggering this banner
    }

    // Update location display
    if (locationDisplay) {
      if (player.position.z < 60) {
        locationDisplay.innerText = 'BUNKER — OUTPOST 3';
      } else if (player.position.z < 200) {
        locationDisplay.innerText = 'COPPER-9 YÜZEYİ';
      } else {
        locationDisplay.innerText = 'CESET KULESİ BÖLGE';
      }
    }
  }

  // ═══════════════════════════════════════════════════
  //  MAIN UPDATE LOOP
  // ═══════════════════════════════════════════════════
  function update() {
    requestAnimationFrame(update);

    var isPointerLocked = (document.pointerLockElement === document.body);
    var isDialogueOpen = (window.DialogueUI && window.DialogueUI.isOpen());

    if (!isPointerLocked && !isDialogueOpen) {
      return;
    }

    var delta = Math.min(clock.getDelta(), 0.1);

    sceneManager.update(delta);
    environment.update(delta, player.position);
    player.update(delta);
    enemyManager.update(delta, player.position);
    weaponSystem.update(delta);

    // Check story triggers
    checkStoryTriggers();

    // ── NPC interaction ──
    var closestNPC = null;
    var minDist = 6;

    for (var idx = 0; idx < npcs.length; idx++) {
      var npc = npcs[idx];
      // Keep NPCs grounded inside bunker
      if (npc.position.z < 60) {
        npc.position.y = 0.1;
      } else {
        npc.position.y = environment.getGroundY(npc.position.x, npc.position.z);
      }
      if (npc.mixer) npc.mixer.update(delta);

      var dist = player.position.distanceTo(npc.position);
      if (dist < minDist) {
        minDist = dist;
        closestNPC = npc;
      }
    }

    if (closestNPC && window.DialogueUI && !window.DialogueUI.isOpen()) {
      interactPrompt.style.display = 'block';
      interactPrompt.innerText = 'F — ' + closestNPC.characterName;
      if (player.wantsInteract) {
        player.wantsInteract = false;
        interactPrompt.style.display = 'none';
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        if (document.exitPointerLock) document.exitPointerLock();

        window.DialogueUI.show(closestNPC.characterName, function (choice) {
          if (choice && choice.action === 'boss_fight_cyn') {
            showStoryBanner('BOSS SAVAŞI', 'Cyn aktifleşti!', 3000);
          } else if (choice && choice.action === 'get_master_key') {
            gameState.hasMasterKey = true;
            showStoryBanner('MASTER KEY ALINDI', 'Kapılar Açılıyor...', 4000);
            if (environment.blastDoors) {
              environment.blastDoors.userData.door1Open = true;
              setTimeout(function() { environment.blastDoors.userData.door2Open = true; }, 2000);
              setTimeout(function() { environment.blastDoors.userData.door3Open = true; }, 4000);
            }
          } else if (choice && choice.action === 'start_wave') {
            if (!gameState.firstWaveTriggered) {
              gameState.firstWaveTriggered = true;
              gameState.storyPhase = 3;
              showStoryBanner('BOSS SAVAŞI', 'J ve V Saldırıyor!', 4000);
              setTimeout(function () { enemyManager.spawnBossFight('J_and_V'); }, 2000);
            }
          }
          document.body.requestPointerLock();
        });
      }
    } else {
      interactPrompt.style.display = 'none';
      player.wantsInteract = false;
    }

    // ── Process attacks ──
    var pAttack = player.getAttackInfo();
    if (pAttack) handleAttack(pAttack);

    var enemies = enemyManager.getEnemies();
    for (var ei = 0; ei < enemies.length; ei++) {
      var eAttack = enemies[ei].getAttackInfo();
      if (eAttack) handleAttack(eAttack);
    }

    // Enemy hitting player
    var playerHits = weaponSystem.checkProjectileHits([{
      isAlive: player.isAlive,
      position: player.position,
      takeDamage: function (dmg) { player.takeDamage(dmg); }
    }], 'enemy');

    for (var j = 0; j < playerHits.length; j++) {
      playerHits[j].entity.takeDamage(playerHits[j].damage);
      weaponSystem.createSparks(playerHits[j].hitPos, 5, 0x00ff00);
    }

    // Player hitting enemies
    var enemyHits = weaponSystem.checkProjectileHits(enemyManager.getEnemies(), 'player');
    for (var k = 0; k < enemyHits.length; k++) {
      enemyHits[k].entity.takeDamage(enemyHits[k].damage);
      weaponSystem.createSparks(enemyHits[k].hitPos, 5, 0xff0000);
      showHitMarker();
    }

    // ── Update HUD ──
    var healthPct = Math.max(0, player.health / player.maxHealth * 100);
    if (healthBar) {
      healthBar.style.width = healthPct + '%';
      if (healthPct < 30) {
        healthBar.classList.add('low');
      } else {
        healthBar.classList.remove('low');
      }
    }
    if (healthText) healthText.innerText = Math.floor(player.health);
    if (scoreDisplay) scoreDisplay.innerText = player.score;
    if (waveDisplay) waveDisplay.innerText = 'WAVE ' + enemyManager.currentWave;

    // EMP bar
    if (empBar) {
      var empPct = player.empCooldown > 0
        ? Math.max(0, (1 - player.empCooldown / player.empCooldownMax) * 100)
        : 100;
      empBar.style.width = empPct + '%';
    }

    // Camera mode display
    if (camMode) {
      camMode.innerText = player.isFirstPerson ? 'FPS' : 'TPS';
    }

    // ── Game Over ──
    if (!player.isAlive) {
      if (gameOverScreen) {
        gameOverScreen.style.display = 'flex';
        if (goScore) goScore.innerText = 'SKOR: ' + player.score;
      }
      crosshair.style.display = 'none';
    }

    // ── Scene animations ──
    var scene = sceneManager.getScene();
    for (var key in scene.userData) {
      if (typeof scene.userData[key] === 'function') {
        scene.userData[key](delta);
      }
    }

    // ── Screen shake ──
    var cam = sceneManager.getCamera();
    if (weaponSystem.screenShake && weaponSystem.screenShake.active) {
      var intensity = weaponSystem.screenShake.intensity;
      cam.position.x += (Math.random() - 0.5) * intensity;
      cam.position.y += (Math.random() - 0.5) * intensity;
      cam.position.z += (Math.random() - 0.5) * intensity;
    }

    // ── Damage vignette ──
    if (vignette) {
      if (player.health < 30 && player.isAlive) {
        var pulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
        vignette.style.background = 'radial-gradient(ellipse at center, transparent 40%, rgba(150,20,20,' + pulse + ') 100%)';
      } else {
        vignette.style.background = 'radial-gradient(ellipse at center, transparent 60%, rgba(5,5,16,0.5) 100%)';
      }
    }

    sceneManager.getRenderer().render(scene, cam);
  }

  update();
})();
