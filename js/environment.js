(function () {
  var CHUNK_SIZE = 80;
  var CHUNK_RES = 20;
  var VIEW_DIST = 2;

  function Environment(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();

    this.chunks = {};

    // ── Materials ──
    this.snowMat = new THREE.MeshStandardMaterial({ color: 0xE8E8F0, roughness: 0.92, metalness: 0.02 });
    this.iceMat = new THREE.MeshStandardMaterial({ color: 0x88AACC, roughness: 0.15, metalness: 0.7, transparent: true, opacity: 0.85 });
    this.bunkerWallMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.45, metalness: 0.85 });
    this.bunkerFloorMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.55, metalness: 0.8 });
    this.doorSteelMat = new THREE.MeshStandardMaterial({ color: 0x3a3a4a, roughness: 0.35, metalness: 0.9 });
    this.hazardYellowMat = new THREE.MeshStandardMaterial({ color: 0xddcc22, roughness: 0.7, metalness: 0.3 });
    this.hazardBlackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7, metalness: 0.3 });
    this.warningRedMat = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff2200, emissiveIntensity: 1.5, roughness: 0.3, metalness: 0.2 });
    this.emergencyOrangeMat = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff6600, emissiveIntensity: 1.0, roughness: 0.3, metalness: 0.2 });
    this.greenLightMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 1.0, roughness: 0.3, metalness: 0.2 });
    this.pipeMat = new THREE.MeshStandardMaterial({ color: 0x5a5a6a, roughness: 0.4, metalness: 0.85 });
    this.deadTrunkMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.95, metalness: 0.0 });
    this.corpseDarkMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3a, roughness: 0.6, metalness: 0.7 });
    this.corpseDarkerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.65, metalness: 0.65 });
    this.oilRedMat = new THREE.MeshStandardMaterial({ color: 0xaa2200, emissive: 0xaa2200, emissiveIntensity: 0.8, roughness: 0.5, metalness: 0.3 });
    this.concreteMat = new THREE.MeshStandardMaterial({ color: 0x6a6a72, roughness: 0.9, metalness: 0.1 });
    this.debrisMat = new THREE.MeshStandardMaterial({ color: 0x4a4a5a, roughness: 0.5, metalness: 0.8 });
    this.signMat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.6, metalness: 0.5 });
    this.signTextMat = new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffcc44, emissiveIntensity: 0.6, roughness: 0.5, metalness: 0.2 });
    this.podMat = new THREE.MeshStandardMaterial({ color: 0x8888aa, roughness: 0.3, metalness: 0.9 });
    this.logoMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, emissive: 0x6666aa, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.5 });
    this.grateMat = new THREE.MeshStandardMaterial({ color: 0x3a3a42, roughness: 0.5, metalness: 0.85 });
    this.rivetMat = new THREE.MeshStandardMaterial({ color: 0x55555f, roughness: 0.35, metalness: 0.9 });
    this.pistonMat = new THREE.MeshStandardMaterial({ color: 0x666678, roughness: 0.3, metalness: 0.92 });

    // Classroom specific
    this.blackboardMat = new THREE.MeshStandardMaterial({ color: 0x1a2e1a, roughness: 0.9, metalness: 0.1 });
    this.deskWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8, metalness: 0.1 });
    this.deskMetalMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.8 });
    this.lockerMat = new THREE.MeshStandardMaterial({ color: 0x404050, roughness: 0.6, metalness: 0.5 });
    
    this.starfield = null;
    this.blastDoors = null;
    this._time = 0;
  }

  Environment.prototype.init = function () {
    this.scene.background = new THREE.Color(0x0a0812);
    this.scene.fog = new THREE.FogExp2(0x120a1e, 0.0025);

    this._createStarfield();
    this._createNebula();
    this._createOrbitalRing();
    this._createClassroom();
    this._createHallway();
    this._createBlastDoors();
    this._createCorpseSpire();
  };

  Environment.prototype.getGroundY = function (x, z) {
    if (!window.Utils || !window.Utils.Noise) return 0;
    
    // Flat area inside the bunker (z < 60)
    if (z < 60 && Math.abs(x) < 40) {
      return 0;
    }

    var nx = x * 0.005;
    var nz = z * 0.005;

    var h1 = window.Utils.Noise.simplex2(nx, nz) * 12.0;
    var h2 = window.Utils.Noise.simplex2(nx * 4.0, nz * 4.0) * 1.5;
    var h3 = window.Utils.Noise.simplex2(nx * 0.15 + 50, nz * 0.15 + 50);
    h3 = Math.max(0, h3) * 45.0;

    return h1 + h2 + h3;
  };

  Environment.prototype._getChunkId = function (cx, cz) {
    return cx + ',' + cz;
  };

  Environment.prototype.update = function (delta, playerPos) {
    this._time += delta;
    if (!playerPos) return;

    var pCX = Math.floor(playerPos.x / CHUNK_SIZE);
    var pCZ = Math.floor(playerPos.z / CHUNK_SIZE);

    var needed = {};
    for (var dx = -VIEW_DIST; dx <= VIEW_DIST; dx++) {
      for (var dz = -VIEW_DIST; dz <= VIEW_DIST; dz++) {
        var cx = pCX + dx;
        var cz = pCZ + dz;
        var id = this._getChunkId(cx, cz);
        needed[id] = true;
        if (!this.chunks[id]) {
          this._loadChunk(cx, cz, id);
        }
      }
    }

    var chunksToRemove = [];
    for (var cid in this.chunks) {
      if (!needed[cid]) chunksToRemove.push(cid);
    }
    for (var i = 0; i < chunksToRemove.length; i++) {
      this._unloadChunk(chunksToRemove[i]);
    }

    if (this.starfield) {
      this.starfield.rotation.y += delta * 0.0005;
    }

    // Animate the 3 Blast Doors
    if (this.blastDoors) {
      this._animateDoor(this.blastDoors, '1', delta);
      this._animateDoor(this.blastDoors, '2', delta);
      this._animateDoor(this.blastDoors, '3', delta);
    }
  };

  Environment.prototype._animateDoor = function(doorsGroup, doorId, delta) {
    var isOpen = doorsGroup.userData['door' + doorId + 'Open'];
    var prog = doorsGroup.userData['door' + doorId + 'Prog'] || 0;

    if (isOpen && prog < 1) {
      prog = Math.min(1, prog + delta * 0.5);
    } else if (!isOpen && prog > 0) {
      prog = Math.max(0, prog - delta * 0.5);
    }
    doorsGroup.userData['door' + doorId + 'Prog'] = prog;

    var leftD = doorsGroup.getObjectByName('door' + doorId + 'Left');
    var rightD = doorsGroup.getObjectByName('door' + doorId + 'Right');
    
    // Each door half is width 8
    if (leftD) leftD.position.x = -4 - prog * 8.5;
    if (rightD) rightD.position.x = 4 + prog * 8.5;
  };

  Environment.prototype._loadChunk = function (cx, cz, id) {
    var group = new THREE.Group();
    group.position.set(cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE);
    group.name = 'chunk_' + id;

    var geo = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE, CHUNK_RES, CHUNK_RES);
    geo.rotateX(-Math.PI / 2);

    var pos = geo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var vx = pos.getX(i) + cx * CHUNK_SIZE;
      var vz = pos.getZ(i) + cz * CHUNK_SIZE;
      var vy = this.getGroundY(vx, vz);
      pos.setY(i, vy);
    }
    geo.computeVertexNormals();

    var mesh = new THREE.Mesh(geo, this.snowMat);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    this._decorateChunk(group, cx, cz);

    this.scene.add(group);
    this.chunks[id] = group;
  };

  Environment.prototype._unloadChunk = function (id) {
    var group = this.chunks[id];
    if (group) {
      window.Utils.disposeMesh(group);
      delete this.chunks[id];
    }
  };

  Environment.prototype._decorateChunk = function (group, cx, cz) {
    var self = this;
    var seed = Math.abs(cx * 73856093 ^ cz * 19349663);
    function rand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280.0;
    }

    var chunkCenterX = cx * CHUNK_SIZE;
    var chunkCenterZ = cz * CHUNK_SIZE;
    if (chunkCenterZ < 80 && Math.abs(chunkCenterX) < 60) return;

    var numProps = Math.floor(rand() * 6) + 1;
    for (var i = 0; i < numProps; i++) {
      var lx = (rand() - 0.5) * CHUNK_SIZE * 0.8;
      var lz = (rand() - 0.5) * CHUNK_SIZE * 0.8;
      var wx = lx + cx * CHUNK_SIZE;
      var wz = lz + cz * CHUNK_SIZE;
      var wy = this.getGroundY(wx, wz);

      var type = rand();
      if (type > 0.65) {
        this._createDeadTree(group, lx, wy, lz, rand);
      } else if (type > 0.4) {
        var debris = new THREE.Group();
        var numParts = Math.floor(rand() * 4) + 1;
        for (var j = 0; j < numParts; j++) {
          var part = new THREE.Mesh(new THREE.BoxGeometry(0.5+rand(), 0.5+rand(), 0.5+rand()), self.debrisMat);
          part.position.set((rand() - 0.5) * 1.5, rand() * 0.3, (rand() - 0.5) * 1.5);
          part.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
          debris.add(part);
        }
        debris.position.set(lx, wy, lz);
        group.add(debris);
      } else {
        var ice = new THREE.Mesh(new THREE.BoxGeometry(4 + rand() * 10, 0.08, 4 + rand() * 10), self.iceMat);
        ice.position.set(lx, wy + 0.04, lz);
        group.add(ice);
      }
    }
  };

  Environment.prototype._createDeadTree = function (parent, lx, wy, lz, rand) {
    var tree = new THREE.Group();
    var trunkH = 3 + rand() * 5;
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, trunkH, 5), this.deadTrunkMat);
    trunk.position.y = trunkH * 0.5;
    tree.add(trunk);
    var numBranches = Math.floor(rand() * 4) + 1;
    for (var b = 0; b < numBranches; b++) {
      var branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.15, 1+rand()*2.5, 4), this.deadTrunkMat);
      branch.position.y = trunkH * (0.4 + rand() * 0.5);
      branch.position.x = (rand() - 0.5) * 0.8;
      branch.rotation.z = (rand() - 0.5) * 1.2;
      branch.rotation.y = rand() * Math.PI * 2;
      tree.add(branch);
    }
    tree.position.set(lx, wy, lz);
    tree.scale.setScalar(0.8 + rand() * 0.6);
    parent.add(tree);
  };

  Environment.prototype._createStarfield = function () {
    var count = 3500;
    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.random() * Math.PI * 0.5;
      var r = 500 + Math.random() * 300;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) + 50;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      sizes[i] = Math.random() * 2.5 + 0.5;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: true, transparent: true, opacity: 0.85 });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);
  };

  Environment.prototype._createNebula = function () {
    var nebula = new THREE.Mesh(new THREE.SphereGeometry(480, 32, 16), new THREE.MeshBasicMaterial({ color: 0x3a1535, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }));
    nebula.position.y = 80;
    this.scene.add(nebula);
    var nebula2 = new THREE.Mesh(new THREE.SphereGeometry(460, 32, 16), new THREE.MeshBasicMaterial({ color: 0x4a1020, transparent: true, opacity: 0.08, side: THREE.BackSide, depthWrite: false }));
    nebula2.position.y = 100;
    nebula2.rotation.z = 0.5;
    this.scene.add(nebula2);
  };

  Environment.prototype._createOrbitalRing = function () {
    var count = 1200;
    var positions = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 0.6 + 0.4;
      var r = 420 + (Math.random() - 0.5) * 30;
      var spread = (Math.random() - 0.5) * 12;
      positions[i * 3]     = r * Math.cos(angle);
      positions[i * 3 + 1] = 250 + spread + Math.sin(angle) * 80;
      positions[i * 3 + 2] = r * Math.sin(angle) * 0.4 - 100;
    }
    var ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var ringMat = new THREE.PointsMaterial({ color: 0x9988aa, size: 1.5, sizeAttenuation: true, transparent: true, opacity: 0.5 });
    this.scene.add(new THREE.Points(ringGeo, ringMat));
  };

  Environment.prototype._createClassroom = function () {
    var crGroup = new THREE.Group();
    crGroup.name = "classroom";
    // Centered at Z = -40, width 20, depth 20
    crGroup.position.set(0, 0, -40);
    
    // Floor
    var floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 20), this.bunkerFloorMat);
    floor.position.y = -0.15;
    crGroup.add(floor);
    
    // Ceiling
    var ceiling = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 20), this.bunkerWallMat);
    ceiling.position.y = 6;
    crGroup.add(ceiling);

    // Walls
    var wallN = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.5), this.bunkerWallMat);
    wallN.position.set(0, 3, -10);
    crGroup.add(wallN);
    
    var wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 20), this.bunkerWallMat);
    wallE.position.set(10, 3, 0);
    crGroup.add(wallE);
    
    var wallW = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 20), this.bunkerWallMat);
    wallW.position.set(-10, 3, 0);
    crGroup.add(wallW);
    
    // Wall S (with doorway)
    var wallSL = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.5), this.bunkerWallMat);
    wallSL.position.set(-6.5, 3, 10);
    crGroup.add(wallSL);
    
    var wallSR = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.5), this.bunkerWallMat);
    wallSR.position.set(6.5, 3, 10);
    crGroup.add(wallSR);

    var wallSTop = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 0.5), this.bunkerWallMat);
    wallSTop.position.set(0, 5, 10);
    crGroup.add(wallSTop);

    // Blackboard on North wall
    var blackboard = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.2), this.blackboardMat);
    blackboard.position.set(0, 3, -9.7);
    crGroup.add(blackboard);

    // Teacher Desk
    var tDesk = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), this.deskWoodMat);
    tDesk.position.set(0, 0.6, -7);
    crGroup.add(tDesk);

    // Student Desks
    for (var x = -5; x <= 5; x += 5) {
      for (var z = -2; z <= 6; z += 4) {
        var desk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 1.5), this.deskWoodMat);
        desk.position.set(x, 0.5, z);
        crGroup.add(desk);
      }
    }

    var light = new THREE.PointLight(0xffffee, 0.8, 40);
    light.position.set(0, 5, 0);
    crGroup.add(light);

    this.scene.add(crGroup);
  };

  Environment.prototype._createHallway = function () {
    var hwGroup = new THREE.Group();
    hwGroup.name = "hallway";
    // Hallway connects classroom (Z=-30) to Blast Door 1 (Z=10)
    // Depth = 40, Width = 6
    hwGroup.position.set(0, 0, -10); // Center at Z=-10

    var floor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 40), this.bunkerFloorMat);
    floor.position.y = -0.15;
    hwGroup.add(floor);

    var ceiling = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 40), this.bunkerWallMat);
    ceiling.position.y = 6;
    hwGroup.add(ceiling);

    var wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 40), this.bunkerWallMat);
    wallE.position.set(3, 3, 0);
    hwGroup.add(wallE);

    var wallW = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 40), this.bunkerWallMat);
    wallW.position.set(-3, 3, 0);
    hwGroup.add(wallW);

    // Lockers
    for(var z = -15; z <= 15; z += 2) {
      var lockerW = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4, 1.8), this.lockerMat);
      lockerW.position.set(-2.5, 2, z);
      hwGroup.add(lockerW);

      var lockerE = new THREE.Mesh(new THREE.BoxGeometry(0.8, 4, 1.8), this.lockerMat);
      lockerE.position.set(2.5, 2, z);
      hwGroup.add(lockerE);
    }

    // Lights
    for(var lz = -15; lz <= 15; lz += 10) {
      var hLight = new THREE.PointLight(0xffffee, 0.6, 20);
      hLight.position.set(0, 5, lz);
      hwGroup.add(hLight);
    }

    this.scene.add(hwGroup);
  };

  Environment.prototype._createBlastDoors = function () {
    this.blastDoors = new THREE.Group();
    this.blastDoors.name = "blastDoorsGroup";

    this.blastDoors.userData.door1Open = false;
    this.blastDoors.userData.door2Open = false;
    this.blastDoors.userData.door3Open = false;

    // Door 1: Z=10
    // Door 2: Z=25
    // Door 3: Z=40
    this._createSingleBlastDoor(this.blastDoors, 1, 10);
    this._createSingleBlastDoor(this.blastDoors, 2, 25);
    this._createSingleBlastDoor(this.blastDoors, 3, 40);

    // Walls connecting the doors
    var fWallE1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 15), this.bunkerWallMat);
    fWallE1.position.set(4, 3, 17.5);
    this.blastDoors.add(fWallE1);

    var fWallW1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 15), this.bunkerWallMat);
    fWallW1.position.set(-4, 3, 17.5);
    this.blastDoors.add(fWallW1);

    var fWallE2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 15), this.bunkerWallMat);
    fWallE2.position.set(4, 3, 32.5);
    this.blastDoors.add(fWallE2);

    var fWallW2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6, 15), this.bunkerWallMat);
    fWallW2.position.set(-4, 3, 32.5);
    this.blastDoors.add(fWallW2);
    
    // Floors for connecting sections
    var floor1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 15), this.bunkerFloorMat);
    floor1.position.set(0, -0.15, 17.5);
    this.blastDoors.add(floor1);

    var floor2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 15), this.bunkerFloorMat);
    floor2.position.set(0, -0.15, 32.5);
    this.blastDoors.add(floor2);

    // Ceilings
    var ceil1 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 15), this.bunkerWallMat);
    ceil1.position.set(0, 6, 17.5);
    this.blastDoors.add(ceil1);

    var ceil2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 15), this.bunkerWallMat);
    ceil2.position.set(0, 6, 32.5);
    this.blastDoors.add(ceil2);

    this.scene.add(this.blastDoors);
  };

  Environment.prototype._createSingleBlastDoor = function(parentGroup, idNum, zPos) {
    var doorW = 8;
    var doorH = 6;
    var doorT = 0.5;

    // Door structure frame
    var frameWallE = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 1), this.bunkerWallMat);
    frameWallE.position.set(6.5, 3, zPos);
    parentGroup.add(frameWallE);
    
    var frameWallW = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 1), this.bunkerWallMat);
    frameWallW.position.set(-6.5, 3, zPos);
    parentGroup.add(frameWallW);

    var frameTop = new THREE.Mesh(new THREE.BoxGeometry(8, 2, 1), this.bunkerWallMat);
    frameTop.position.set(0, 7, zPos);
    parentGroup.add(frameTop);

    // Left Panel
    var leftDoor = new THREE.Group();
    leftDoor.name = "door" + idNum + "Left";
    var lPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorT), this.doorSteelMat);
    lPanel.position.set(0, doorH/2, 0);
    leftDoor.add(lPanel);
    leftDoor.position.set(-doorW/2, 0, zPos);
    parentGroup.add(leftDoor);

    // Right Panel
    var rightDoor = new THREE.Group();
    rightDoor.name = "door" + idNum + "Right";
    var rPanel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, doorT), this.doorSteelMat);
    rPanel.position.set(0, doorH/2, 0);
    rightDoor.add(rPanel);
    rightDoor.position.set(doorW/2, 0, zPos);
    parentGroup.add(rightDoor);

    // Control panel nearby
    var cPanel = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.2), this.warningRedMat);
    cPanel.position.set(3, 1.5, zPos - 0.6);
    parentGroup.add(cPanel);
  };

  Environment.prototype._createCorpseSpire = function () {
    var spire = new THREE.Group();
    spire.name = 'corpseSpire';
    var spireX = 0;
    var spireZ = 200;
    spire.position.set(spireX, 0, spireZ);

    var totalHeight = 90;
    var baseRadius = 15;
    var topRadius = 3;
    var layerCount = 60;

    var bodyBoxGeo = new THREE.BoxGeometry(1, 0.6, 0.8);

    for (var layer = 0; layer < layerCount; layer++) {
      var t = layer / layerCount;
      var y = t * totalHeight;
      var radius = baseRadius * (1 - t) + topRadius * t;
      var circumference = 2 * Math.PI * radius;
      var bodiesInRing = Math.max(3, Math.floor(circumference / 1.2));

      for (var b = 0; b < bodiesInRing; b++) {
        var angle = (b / bodiesInRing) * Math.PI * 2 + t * 1.5;
        var r = radius + (Math.random() - 0.5) * 2;
        var bx = Math.cos(angle) * r;
        var bz = Math.sin(angle) * r;
        var by = y + (Math.random() - 0.5) * 1.5;

        var mat = Math.random() > 0.5 ? this.corpseDarkMat : this.corpseDarkerMat;
        var body = new THREE.Mesh(bodyBoxGeo, mat);
        body.position.set(bx, by, bz);
        body.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        spire.add(body);
      }
    }

    // Landing pod
    var podGroup = new THREE.Group();
    podGroup.position.y = totalHeight + 2;
    var podBody = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 6, 12), this.podMat);
    podGroup.add(podBody);
    spire.add(podGroup);

    var topGlow = new THREE.PointLight(0xff2255, 2.0, 50);
    topGlow.position.set(0, totalHeight + 5, 0);
    spire.add(topGlow);

    this.scene.add(spire);
  };

  Environment.prototype.getSpawnPoints = function () {
    return [new THREE.Vector3(0, 0.5, -40)];
  };

  Environment.prototype.getBounds = function () {
    return { minX: -99999, maxX: 99999, minZ: -99999, maxZ: 99999 };
  };

  window.Environment = Environment;

})();
