// =============================================================================
// npc_characters.js - NPC Character Models for Murder Drones 3D
// Extends window.CharacterFactory (defined in characters.js)
// Characters: Uzi, Thad, Khan, Lizzy, Doll, Teacher, Tessa, Cyn, Nori
// =============================================================================
(function () {
  'use strict';

  // Ensure CharacterFactory exists
  if (!window.CharacterFactory) {
    window.CharacterFactory = {};
  }
  var CF = window.CharacterFactory;

  // =========================================================================
  //  SHARED HELPERS
  // =========================================================================

  /** Apply castShadow / receiveShadow recursively */
  function enableShadows(obj) {
    obj.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  /** Shortcut for creating a MeshStandardMaterial */
  function mat(color, opts) {
    var defaults = {
      color: color,
      metalness: 0.7,
      roughness: 0.35
    };
    if (opts) {
      for (var k in opts) {
        if (opts.hasOwnProperty(k)) defaults[k] = opts[k];
      }
    }
    return new THREE.MeshStandardMaterial(defaults);
  }

  /** Shortcut for emissive material (eyes, glows) */
  function emissiveMat(color, intensity) {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: intensity || 2,
      metalness: 0.3,
      roughness: 0.4
    });
  }

  /** Create a worker drone round eye (small sphere) */
  function createRoundEye(color, radius, intensity) {
    var r = radius || 0.18;
    var geo = new THREE.SphereGeometry(r, 12, 12);
    var m = emissiveMat(color, intensity || 2);
    var mesh = new THREE.Mesh(geo, m);
    mesh.castShadow = true;
    return mesh;
  }

  /** Create simple 3-finger hand */
  function createWorkerHand(bodyColor) {
    var hand = new THREE.Group();
    // palm
    var palm = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      mat(bodyColor)
    );
    hand.add(palm);
    // 3 fingers
    for (var i = -1; i <= 1; i++) {
      var finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.035, 0.3, 6),
        mat(bodyColor)
      );
      finger.position.set(i * 0.1, -0.25, 0);
      finger.rotation.z = i * 0.2;
      hand.add(finger);
    }
    return hand;
  }

  /** Create worker-drone legs (pair), returns group with named leftLeg/rightLeg */
  function createWorkerLegs(bodyColor, legHeight) {
    var lh = legHeight || 0.9;
    var legs = new THREE.Group();

    // Left leg
    var leftLeg = new THREE.Group();
    leftLeg.name = 'leftLeg';
    var leftUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, lh * 0.55, 8),
      mat(bodyColor)
    );
    leftUpper.position.y = -lh * 0.275;
    leftLeg.add(leftUpper);
    var leftLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, lh * 0.55, 8),
      mat(bodyColor)
    );
    leftLower.position.y = -lh * 0.55;
    leftLeg.add(leftLower);
    var leftFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.1, 0.35),
      mat(bodyColor, { metalness: 0.8, roughness: 0.25 })
    );
    leftFoot.position.set(0, -lh * 0.825, 0.05);
    leftLeg.add(leftFoot);
    leftLeg.position.set(-0.35, 0, 0);
    legs.add(leftLeg);

    // Right leg
    var rightLeg = new THREE.Group();
    rightLeg.name = 'rightLeg';
    var rightUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.15, lh * 0.55, 8),
      mat(bodyColor)
    );
    rightUpper.position.y = -lh * 0.275;
    rightLeg.add(rightUpper);
    var rightLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, lh * 0.55, 8),
      mat(bodyColor)
    );
    rightLower.position.y = -lh * 0.55;
    rightLeg.add(rightLower);
    var rightFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.1, 0.35),
      mat(bodyColor, { metalness: 0.8, roughness: 0.25 })
    );
    rightFoot.position.set(0, -lh * 0.825, 0.05);
    rightLeg.add(rightFoot);
    rightLeg.position.set(0.35, 0, 0);
    legs.add(rightLeg);

    return legs;
  }

  /** Create worker-drone arms (pair), returns object {leftArm, rightArm} */
  function createWorkerArms(bodyColor, armLength) {
    var al = armLength || 0.75;
    var result = {};

    // Left arm
    var leftArm = new THREE.Group();
    leftArm.name = 'leftArm';
    var leftShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      mat(bodyColor)
    );
    leftArm.add(leftShoulder);
    var leftForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.09, al, 8),
      mat(bodyColor)
    );
    leftForearm.position.y = -al * 0.5;
    leftArm.add(leftForearm);
    var leftHand = createWorkerHand(bodyColor);
    leftHand.position.y = -al - 0.1;
    leftArm.add(leftHand);
    result.leftArm = leftArm;

    // Right arm
    var rightArm = new THREE.Group();
    rightArm.name = 'rightArm';
    var rightShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      mat(bodyColor)
    );
    rightArm.add(rightShoulder);
    var rightForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.09, al, 8),
      mat(bodyColor)
    );
    rightForearm.position.y = -al * 0.5;
    rightArm.add(rightForearm);
    var rightHand = createWorkerHand(bodyColor);
    rightHand.position.y = -al - 0.1;
    rightArm.add(rightHand);
    result.rightArm = rightArm;

    return result;
  }

  /** Create worker drone visor/face plate */
  function createVisor(color) {
    var visorColor = color || 0x2a2a3a;
    var visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.45, 0.15),
      mat(visorColor, { metalness: 0.9, roughness: 0.15 })
    );
    visor.position.set(0, 0.05, 0.38);
    return visor;
  }

  /** Create floating 3D name tag (Sprite with CanvasTexture) */
  function createNameTag(nameText, color) {
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    var ctx = canvas.getContext('2d');
    
    // Background (optional, keeping it transparent for a cleaner look)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.roundRect(0, 0, canvas.width, canvas.height, 30);
    ctx.fill();

    // Text
    ctx.font = 'bold 70px "Orbitron", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = color || '#ffffff';
    ctx.fillText(nameText, canvas.width / 2, canvas.height / 2);

    var texture = new THREE.CanvasTexture(canvas);
    var spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    var sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale the sprite appropriately
    sprite.scale.set(4, 1, 1);
    
    return sprite;
  }


  // =========================================================================
  //  1. UZI DOORMAN — Fully Detailed Accurate 3D Model
  //  Reference: Purple worker drone, emo teenager, oversized black hoodie,
  //  battery+crossbones logo, dark plaid skirt, purple striped leggings,
  //  black boots, purple beanie with stripes, messy purple hair, purple eyes,
  //  railgun on back. Short stature compared to other drones.
  // =========================================================================
  CF.createUzi = function () {
    var group = new THREE.Group();
    group.characterName = 'Uzi';
    group.characterType = 'worker';

    // --- COLOR PALETTE (accurate to show) ---
    var droneBodyColor = 0x6B4D8A;     // Purple metallic drone body
    var hoodieColor = 0x1A1A1E;        // Black oversized hoodie
    var hoodieAccent = 0x2A2A30;       // Slightly lighter hoodie folds
    var skirtColor = 0x2A1A2A;         // Dark plaid skirt base
    var skirtPlaid = 0x4A2A4A;         // Plaid lines
    var leggingBase = 0x3A2A4A;        // Dark purple legging base
    var leggingStripe = 0x8B5DAA;      // Lighter purple stripes
    var bootColor = 0x1A1A1A;          // Black boots
    var bootSole = 0x0A0A0A;           // Boot sole
    var beanieBase = 0x2A2A2E;         // Dark beanie base (almost black)
    var beanieStripe = 0x6B4D8A;       // Purple stripes on beanie
    var hairColor = 0x7B4D9A;          // Messy purple hair
    var hairHighlight = 0x9B6DBA;      // Hair highlights
    var eyeColor = 0x9B59B6;           // Purple glowing eyes
    var visorColor = 0x1A1A2A;         // Dark visor/face plate
    var skinMetal = 0x7B5D9A;          // Exposed drone metal (face area)
    var gunMetal = 0x2A2A3A;           // Dark gun metal
    var gunGlow = 0x9B59B6;            // Purple railgun glow

    // --- PROPORTIONS (Uzi is SHORT ~2.2 units total) ---
    var legH = 0.75;
    var bootH = 0.22;
    var skirtH = 0.28;
    var bodyH = 0.82;
    var headR = 0.40;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.55;

    // =====================================================================
    //  BOOTS — Black combat boots with thick soles and laces
    // =====================================================================
    var bootsGroup = new THREE.Group();
    bootsGroup.name = 'boots';

    // Left boot
    var leftBoot = new THREE.Group();
    leftBoot.name = 'leftBoot';
    // Boot main body
    var lBootBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, bootH + 0.08, 0.38),
      mat(bootColor, { metalness: 0.6, roughness: 0.5 })
    );
    lBootBody.position.set(0, bootH * 0.5 + 0.04, 0.02);
    leftBoot.add(lBootBody);
    // Boot sole (thick)
    var lBootSole = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.06, 0.42),
      mat(bootSole, { metalness: 0.3, roughness: 0.9 })
    );
    lBootSole.position.set(0, 0.03, 0.02);
    leftBoot.add(lBootSole);
    // Boot toe cap
    var lBootToe = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
      mat(bootColor, { metalness: 0.6, roughness: 0.5 })
    );
    lBootToe.rotation.x = Math.PI;
    lBootToe.position.set(0, 0.08, 0.17);
    leftBoot.add(lBootToe);
    // Boot tongue
    var lBootTongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.04),
      mat(0x2A2A2E, { metalness: 0.4, roughness: 0.6 })
    );
    lBootTongue.position.set(0, bootH + 0.06, 0.16);
    leftBoot.add(lBootTongue);
    // Lace details (small crossing lines)
    for (var lace = 0; lace < 3; lace++) {
      var laceL = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.015, 0.015),
        mat(0x4A4A4A)
      );
      laceL.position.set(0, bootH * 0.3 + lace * 0.06, 0.2);
      laceL.rotation.z = 0.3;
      leftBoot.add(laceL);
      var laceR = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.015, 0.015),
        mat(0x4A4A4A)
      );
      laceR.position.set(0, bootH * 0.3 + lace * 0.06, 0.2);
      laceR.rotation.z = -0.3;
      leftBoot.add(laceR);
    }
    leftBoot.position.set(-0.22, 0, 0);
    bootsGroup.add(leftBoot);

    // Right boot (mirror)
    var rightBoot = leftBoot.clone();
    rightBoot.name = 'rightBoot';
    rightBoot.position.set(0.22, 0, 0);
    bootsGroup.add(rightBoot);

    group.add(bootsGroup);

    // =====================================================================
    //  LEGS — Purple striped leggings
    // =====================================================================
    var legsGroup = new THREE.Group();
    legsGroup.name = 'legs';

    function createStripedLeg(xPos) {
      var leg = new THREE.Group();
      // Main leg cylinder
      var legCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.13, legH - bootH, 10),
        mat(leggingBase, { metalness: 0.5, roughness: 0.4 })
      );
      legCyl.position.y = bootH + (legH - bootH) * 0.5;
      leg.add(legCyl);
      // Purple stripes (7 rings around leg)
      for (var stripe = 0; stripe < 7; stripe++) {
        var stripeRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.015, 6, 12),
          mat(leggingStripe, { metalness: 0.5, roughness: 0.4 })
        );
        stripeRing.rotation.x = Math.PI * 0.5;
        stripeRing.position.y = bootH + 0.05 + stripe * ((legH - bootH - 0.1) / 6);
        leg.add(stripeRing);
      }
      // Knee joint (small sphere)
      var knee = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 6),
        mat(droneBodyColor, { metalness: 0.8, roughness: 0.2 })
      );
      knee.position.set(0, bootH + (legH - bootH) * 0.55, 0.04);
      leg.add(knee);
      leg.position.set(xPos, 0, 0);
      return leg;
    }

    legsGroup.add(createStripedLeg(-0.2));
    legsGroup.add(createStripedLeg(0.2));
    group.add(legsGroup);

    // =====================================================================
    //  SKIRT — Dark plaid skirt
    // =====================================================================
    var skirtGroup = new THREE.Group();
    skirtGroup.name = 'skirt';
    skirtGroup.position.y = legH;

    // Main skirt shape (truncated cone)
    var skirtGeo = new THREE.CylinderGeometry(0.3, 0.45, skirtH, 12);
    var skirtMesh = new THREE.Mesh(skirtGeo, mat(skirtColor, { metalness: 0.3, roughness: 0.7 }));
    skirtMesh.position.y = skirtH * 0.5;
    skirtGroup.add(skirtMesh);

    // Plaid pattern lines (vertical and horizontal thin boxes)
    for (var pl = 0; pl < 8; pl++) {
      var angle = (pl / 8) * Math.PI * 2;
      var plaidLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, skirtH * 0.9, 0.015),
        mat(skirtPlaid, { metalness: 0.3, roughness: 0.7 })
      );
      plaidLine.position.set(
        Math.sin(angle) * 0.38,
        skirtH * 0.5,
        Math.cos(angle) * 0.38
      );
      plaidLine.rotation.y = angle;
      skirtGroup.add(plaidLine);
    }
    // Horizontal plaid lines
    for (var ph = 0; ph < 3; ph++) {
      var plaidH = new THREE.Mesh(
        new THREE.TorusGeometry(0.32 + ph * 0.04, 0.008, 6, 16),
        mat(skirtPlaid, { metalness: 0.3, roughness: 0.7 })
      );
      plaidH.rotation.x = Math.PI * 0.5;
      plaidH.position.y = skirtH * 0.25 + ph * (skirtH * 0.25);
      skirtGroup.add(plaidH);
    }
    // Waistband
    var waistband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.31, 0.05, 12),
      mat(0x2A2A2E, { metalness: 0.5, roughness: 0.5 })
    );
    waistband.position.y = skirtH - 0.02;
    skirtGroup.add(waistband);
    // Skirt hem
    var skirtHem = new THREE.Mesh(
      new THREE.TorusGeometry(0.44, 0.015, 6, 16),
      mat(skirtPlaid, { metalness: 0.3, roughness: 0.7 })
    );
    skirtHem.rotation.x = Math.PI * 0.5;
    skirtHem.position.y = 0.02;
    skirtGroup.add(skirtHem);

    group.add(skirtGroup);

    // =====================================================================
    //  BODY / HOODIE — Oversized black hoodie with battery+crossbones logo
    // =====================================================================
    var body = new THREE.Group();
    body.name = 'body';
    body.position.set(0, bodyY, 0);

    // Main hoodie torso (slightly oversized, boxy)
    var hoodieTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, bodyH, 0.58),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    body.add(hoodieTorso);

    // Hoodie bottom hem (extends slightly past waist, overlapping skirt)
    var hoodieHem = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.08, 0.6),
      mat(hoodieAccent, { metalness: 0.25, roughness: 0.8 })
    );
    hoodieHem.position.set(0, -bodyH * 0.5 + 0.04, 0);
    body.add(hoodieHem);

    // Hoodie front pocket (kangaroo pocket)
    var pocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.2, 0.05),
      mat(hoodieAccent, { metalness: 0.25, roughness: 0.8 })
    );
    pocket.position.set(0, -0.12, 0.3);
    body.add(pocket);
    // Pocket opening line
    var pocketLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.015, 0.01),
      mat(0x3A3A3E)
    );
    pocketLine.position.set(0, -0.03, 0.33);
    body.add(pocketLine);

    // === BATTERY + CROSSBONES LOGO on chest ===
    var logoGroup = new THREE.Group();
    logoGroup.name = 'batteryLogo';
    logoGroup.position.set(0, 0.12, 0.3);

    // Battery body
    var batteryBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.1, 0.02),
      mat(0xCCCCCC, { metalness: 0.3, roughness: 0.6 })
    );
    logoGroup.add(batteryBody);
    // Battery terminal/nub
    var batteryNub = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.06, 0.02),
      mat(0xCCCCCC, { metalness: 0.3, roughness: 0.6 })
    );
    batteryNub.position.set(0.1, 0, 0);
    logoGroup.add(batteryNub);
    // Battery charge level (filled part, purple)
    var batteryFill = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.025),
      emissiveMat(0x9B59B6, 1.5)
    );
    batteryFill.position.set(-0.02, 0, 0.005);
    logoGroup.add(batteryFill);

    // Crossbones behind battery
    var bone1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6),
      mat(0xCCCCCC, { metalness: 0.3, roughness: 0.6 })
    );
    bone1.rotation.z = Math.PI * 0.25;
    bone1.position.set(0, 0, -0.01);
    logoGroup.add(bone1);
    var bone2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.25, 6),
      mat(0xCCCCCC, { metalness: 0.3, roughness: 0.6 })
    );
    bone2.rotation.z = -Math.PI * 0.25;
    bone2.position.set(0, 0, -0.01);
    logoGroup.add(bone2);
    // Bone ends (small spheres at each end)
    var boneEnds = [
      { x: -0.085, y: 0.085 }, { x: 0.085, y: -0.085 },
      { x: 0.085, y: 0.085 }, { x: -0.085, y: -0.085 }
    ];
    for (var be = 0; be < boneEnds.length; be++) {
      var boneEnd = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 6, 6),
        mat(0xCCCCCC, { metalness: 0.3, roughness: 0.6 })
      );
      boneEnd.position.set(boneEnds[be].x, boneEnds[be].y, -0.01);
      logoGroup.add(boneEnd);
    }
    body.add(logoGroup);

    // Hoodie collar / neckline (higher, oversized)
    var hoodieCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.12, 12),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    hoodieCollar.position.set(0, bodyH * 0.48, 0);
    body.add(hoodieCollar);

    // Hood (draped on back, not pulled up)
    var hoodBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.35, 0.15),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    hoodBack.position.set(0, bodyH * 0.35, -0.3);
    hoodBack.rotation.x = 0.2;
    body.add(hoodBack);
    // Hood folds
    var hoodFold = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.08, 0.12),
      mat(hoodieAccent, { metalness: 0.2, roughness: 0.85 })
    );
    hoodFold.position.set(0, bodyH * 0.5, -0.28);
    body.add(hoodFold);

    // Hoodie wrinkle/fold lines on body
    for (var wrinkle = 0; wrinkle < 3; wrinkle++) {
      var wLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.01, 0.01),
        mat(hoodieAccent, { metalness: 0.2, roughness: 0.9 })
      );
      wLine.position.set(0, -0.1 + wrinkle * 0.15, 0.3);
      body.add(wLine);
    }

    group.add(body);

    // =====================================================================
    //  ARMS — Oversized hoodie sleeves covering most of the arms
    // =====================================================================
    // Left arm
    var leftArm = new THREE.Group();
    leftArm.name = 'leftArm';
    leftArm.position.set(-0.58, bodyY + bodyH * 0.32, 0);

    // Shoulder joint (hidden under hoodie)
    var lShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    leftArm.add(lShoulder);

    // Hoodie sleeve (oversized, covers upper + most of forearm)
    var lSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.7, 10),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    lSleeve.position.y = -0.35;
    leftArm.add(lSleeve);

    // Sleeve cuff (slightly rolled up, looser)
    var lCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.17, 0.08, 10),
      mat(hoodieAccent, { metalness: 0.25, roughness: 0.8 })
    );
    lCuff.position.y = -0.72;
    leftArm.add(lCuff);

    // Exposed drone forearm (purple metal, just the wrist area)
    var lWrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.15, 8),
      mat(droneBodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    lWrist.position.y = -0.82;
    leftArm.add(lWrist);

    // Hand (3-finger drone hand)
    var lHand = createWorkerHand(droneBodyColor);
    lHand.position.y = -0.95;
    lHand.scale.setScalar(0.85);
    leftArm.add(lHand);

    group.add(leftArm);

    // Right arm (mirror)
    var rightArm = new THREE.Group();
    rightArm.name = 'rightArm';
    rightArm.position.set(0.58, bodyY + bodyH * 0.32, 0);

    var rShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    rightArm.add(rShoulder);
    var rSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 0.7, 10),
      mat(hoodieColor, { metalness: 0.25, roughness: 0.8 })
    );
    rSleeve.position.y = -0.35;
    rightArm.add(rSleeve);
    var rCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.17, 0.08, 10),
      mat(hoodieAccent, { metalness: 0.25, roughness: 0.8 })
    );
    rCuff.position.y = -0.72;
    rightArm.add(rCuff);
    var rWrist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.15, 8),
      mat(droneBodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    rWrist.position.y = -0.82;
    rightArm.add(rWrist);
    var rHand = createWorkerHand(droneBodyColor);
    rHand.position.y = -0.95;
    rHand.scale.setScalar(0.85);
    rightArm.add(rHand);

    group.add(rightArm);

    // =====================================================================
    //  HEAD — Detailed drone head with visor, purple eyes, expressions
    // =====================================================================
    var head = new THREE.Group();
    head.name = 'head';
    head.position.set(0, headY, 0);

    // Skull / head shell (slightly flattened sphere)
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 18, 16),
      mat(skinMetal, { metalness: 0.8, roughness: 0.2 })
    );
    skull.scale.set(1, 0.92, 0.95);
    head.add(skull);

    // Face visor (dark screen where eyes display)
    var visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.38, 0.12),
      mat(visorColor, { metalness: 0.95, roughness: 0.08 })
    );
    visor.position.set(0, 0.02, 0.32);
    head.add(visor);

    // Visor frame (slightly larger, metallic border)
    var visorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.42, 0.08),
      mat(droneBodyColor, { metalness: 0.85, roughness: 0.15 })
    );
    visorFrame.position.set(0, 0.02, 0.3);
    head.add(visorFrame);

    // Left eye (purple, round, glowing with inner detail)
    var leftEyeOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 10),
      emissiveMat(eyeColor, 3)
    );
    leftEyeOuter.position.set(-0.18, 0.05, 0.39);
    head.add(leftEyeOuter);
    // Eye pupil (darker center)
    var leftPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      emissiveMat(0xBB7DE8, 4)
    );
    leftPupil.position.set(-0.18, 0.05, 0.42);
    head.add(leftPupil);
    // Eye reflection highlight
    var leftReflect = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      emissiveMat(0xFFFFFF, 5)
    );
    leftReflect.position.set(-0.15, 0.08, 0.43);
    head.add(leftReflect);

    // Right eye (mirror)
    var rightEyeOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 12, 10),
      emissiveMat(eyeColor, 3)
    );
    rightEyeOuter.position.set(0.18, 0.05, 0.39);
    head.add(rightEyeOuter);
    var rightPupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      emissiveMat(0xBB7DE8, 4)
    );
    rightPupil.position.set(0.18, 0.05, 0.42);
    head.add(rightPupil);
    var rightReflect = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      emissiveMat(0xFFFFFF, 5)
    );
    rightReflect.position.set(0.21, 0.08, 0.43);
    head.add(rightReflect);

    // Cheek panels (side of face, metallic)
    var cheekL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.2, 0.2),
      mat(droneBodyColor, { metalness: 0.85, roughness: 0.2 })
    );
    cheekL.position.set(-0.37, -0.02, 0.18);
    head.add(cheekL);
    var cheekR = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.2, 0.2),
      mat(droneBodyColor, { metalness: 0.85, roughness: 0.2 })
    );
    cheekR.position.set(0.37, -0.02, 0.18);
    head.add(cheekR);

    // Chin detail
    var chin = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.06, 0.1),
      mat(skinMetal, { metalness: 0.8, roughness: 0.25 })
    );
    chin.position.set(0, -0.2, 0.28);
    head.add(chin);

    // =====================================================================
    //  HAIR — Messy purple hair sticking out from under beanie
    // =====================================================================
    var hairGroup = new THREE.Group();
    hairGroup.name = 'hair';

    // Front bangs (asymmetric, messy, covering parts of visor)
    // Left side bangs (longer, swept)
    var bangL1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.22, 0.06),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    bangL1.position.set(-0.25, 0.12, 0.3);
    bangL1.rotation.z = 0.15;
    bangL1.rotation.x = -0.2;
    hairGroup.add(bangL1);

    var bangL2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.28, 0.05),
      mat(hairHighlight, { metalness: 0.4, roughness: 0.65 })
    );
    bangL2.position.set(-0.18, 0.08, 0.32);
    bangL2.rotation.z = 0.25;
    bangL2.rotation.x = -0.15;
    hairGroup.add(bangL2);

    var bangL3 = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.2, 0.04),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    bangL3.position.set(-0.32, 0.14, 0.25);
    bangL3.rotation.z = 0.35;
    hairGroup.add(bangL3);

    // Right side bangs (shorter, choppier)
    var bangR1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.18, 0.05),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    bangR1.position.set(0.22, 0.14, 0.3);
    bangR1.rotation.z = -0.2;
    bangR1.rotation.x = -0.15;
    hairGroup.add(bangR1);

    var bangR2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.15, 0.04),
      mat(hairHighlight, { metalness: 0.4, roughness: 0.65 })
    );
    bangR2.position.set(0.28, 0.16, 0.28);
    bangR2.rotation.z = -0.3;
    hairGroup.add(bangR2);

    // Center fringe
    var bangC = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.12, 0.04),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    bangC.position.set(-0.05, 0.2, 0.34);
    bangC.rotation.x = -0.25;
    hairGroup.add(bangC);

    // Side hair (peeking from under beanie on sides)
    var sideHairL = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.3, 0.15),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    sideHairL.position.set(-0.38, -0.02, 0.05);
    sideHairL.rotation.z = 0.08;
    hairGroup.add(sideHairL);

    var sideHairR = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.25, 0.12),
      mat(hairColor, { metalness: 0.4, roughness: 0.65 })
    );
    sideHairR.position.set(0.38, 0, 0.05);
    sideHairR.rotation.z = -0.08;
    hairGroup.add(sideHairR);

    // Back hair spikes (messy, sticking out backward from beanie)
    for (var hs = 0; hs < 5; hs++) {
      var spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.06 + Math.random() * 0.03, 0.35 + Math.random() * 0.2, 6),
        mat(hs % 2 === 0 ? hairColor : hairHighlight, { metalness: 0.4, roughness: 0.65 })
      );
      spike.rotation.x = Math.PI * 0.6 + (Math.random() - 0.5) * 0.3;
      spike.rotation.z = (hs - 2) * 0.18;
      spike.position.set(
        (hs - 2) * 0.12,
        0.12 + Math.random() * 0.05,
        -0.3 - Math.random() * 0.08
      );
      hairGroup.add(spike);
    }

    head.add(hairGroup);

    // =====================================================================
    //  BEANIE — Detailed striped beanie with battery icon
    // =====================================================================
    var beanieGroup = new THREE.Group();
    beanieGroup.name = 'beanie';

    // Main beanie dome (half sphere, sits on top of head)
    var beanieDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      mat(beanieBase, { metalness: 0.3, roughness: 0.75 })
    );
    beanieDome.position.set(0, 0.08, -0.02);
    beanieGroup.add(beanieDome);

    // Beanie stripes (alternating dark/purple rings)
    var stripeYPositions = [0.22, 0.28, 0.34, 0.40];
    for (var bs = 0; bs < stripeYPositions.length; bs++) {
      var stripeRadius = 0.38 - bs * 0.04;
      var bStripe = new THREE.Mesh(
        new THREE.TorusGeometry(stripeRadius, 0.022, 8, 18),
        mat(bs % 2 === 0 ? beanieStripe : beanieBase, { metalness: 0.3, roughness: 0.75 })
      );
      bStripe.rotation.x = Math.PI * 0.5;
      bStripe.position.set(0, stripeYPositions[bs], -0.02);
      beanieGroup.add(bStripe);
    }

    // Beanie rim (folded cuff at bottom, thicker)
    var beanieRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.43, 0.1, 16),
      mat(beanieBase, { metalness: 0.35, roughness: 0.7 })
    );
    beanieRim.position.set(0, 0.13, -0.02);
    beanieGroup.add(beanieRim);

    // Battery icon on beanie front (embroidered look)
    var beanieLogoGroup = new THREE.Group();
    beanieLogoGroup.position.set(0, 0.2, 0.38);
    // Tiny battery outline
    var bBatt = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.055, 0.015),
      mat(beanieStripe, { metalness: 0.3, roughness: 0.7 })
    );
    beanieLogoGroup.add(bBatt);
    var bBattNub = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.035, 0.015),
      mat(beanieStripe, { metalness: 0.3, roughness: 0.7 })
    );
    bBattNub.position.set(0.055, 0, 0);
    beanieLogoGroup.add(bBattNub);
    beanieGroup.add(beanieLogoGroup);

    // Top pom-pom (small fuzzy ball)
    var pomPom = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      mat(beanieStripe, { metalness: 0.2, roughness: 0.9 })
    );
    pomPom.position.set(0, 0.48, -0.02);
    beanieGroup.add(pomPom);

    head.add(beanieGroup);

    group.add(head);

    // =====================================================================
    //  RAILGUN — Uzi's signature weapon, strapped to her back
    // =====================================================================
    var railgun = new THREE.Group();
    railgun.name = 'railgun';

    // Main barrel (long cylinder)
    var barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 1.4, 10),
      mat(gunMetal, { metalness: 0.92, roughness: 0.12 })
    );
    barrel.rotation.x = Math.PI * 0.12;
    railgun.add(barrel);

    // Barrel muzzle (flared end)
    var muzzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.05, 0.1, 10),
      mat(gunMetal, { metalness: 0.92, roughness: 0.12 })
    );
    muzzle.position.set(0, 0.72, -0.08);
    muzzle.rotation.x = Math.PI * 0.12;
    railgun.add(muzzle);

    // Barrel inner glow (visible at muzzle)
    var muzzleGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      emissiveMat(gunGlow, 4)
    );
    muzzleGlow.position.set(0, 0.78, -0.1);
    railgun.add(muzzleGlow);

    // Gun body / receiver (boxy)
    var gunBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.2, 0.35),
      mat(gunMetal, { metalness: 0.92, roughness: 0.12 })
    );
    gunBody.position.set(0, 0, -0.05);
    railgun.add(gunBody);

    // Side rails (two thin boxes on sides of barrel)
    var railL = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 1.0, 0.04),
      mat(0x4A4A5A, { metalness: 0.85, roughness: 0.2 })
    );
    railL.position.set(-0.06, 0.1, 0);
    railL.rotation.x = Math.PI * 0.12;
    railgun.add(railL);
    var railR = railL.clone();
    railR.position.set(0.06, 0.1, 0);
    railgun.add(railR);

    // Energy coils (purple glowing rings around barrel)
    for (var coil = 0; coil < 4; coil++) {
      var coilRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.065, 0.012, 6, 12),
        emissiveMat(gunGlow, 2 + coil * 0.3)
      );
      coilRing.position.set(0, 0.2 + coil * 0.15, -0.02 - coil * 0.018);
      coilRing.rotation.x = Math.PI * 0.5 + 0.12;
      railgun.add(coilRing);
    }

    // Grip / handle
    var grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.18, 0.1),
      mat(0x3A3A3A, { metalness: 0.7, roughness: 0.4 })
    );
    grip.position.set(0, -0.15, 0.05);
    grip.rotation.x = 0.15;
    railgun.add(grip);

    // Stock (back end)
    var stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.14, 0.3),
      mat(gunMetal, { metalness: 0.9, roughness: 0.15 })
    );
    stock.position.set(0, -0.5, 0);
    railgun.add(stock);

    // Stock butt plate
    var buttPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.04),
      mat(0x4A3A4A, { metalness: 0.7, roughness: 0.4 })
    );
    buttPlate.position.set(0, -0.58, -0.02);
    railgun.add(buttPlate);

    // Scope (small cylinder on top)
    var scope = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.2, 8),
      mat(gunMetal, { metalness: 0.95, roughness: 0.08 })
    );
    scope.position.set(0, 0.3, 0.08);
    scope.rotation.x = Math.PI * 0.12;
    railgun.add(scope);
    // Scope lens
    var scopeLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 8, 8),
      emissiveMat(gunGlow, 2)
    );
    scopeLens.position.set(0, 0.42, 0.06);
    railgun.add(scopeLens);

    // Strap (thin box connecting gun to body)
    var strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.5, 0.02),
      mat(0x3A3A3A, { metalness: 0.4, roughness: 0.7 })
    );
    strap.position.set(0.08, 0.1, 0.15);
    strap.rotation.z = 0.2;
    railgun.add(strap);

    // Position railgun on back (slightly angled)
    railgun.position.set(0.12, bodyY + 0.1, -0.42);
    railgun.rotation.z = 0.12;
    railgun.rotation.y = Math.PI * 0.03;
    group.add(railgun);

    // =====================================================================
    //  FINAL ADJUSTMENTS
    // =====================================================================
    // Uzi is shorter than other drones (scale down slightly)
    group.scale.setScalar(0.9);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  2. THAD
  // =========================================================================
  CF.createThad = function () {
    var group = new THREE.Group();
    group.characterName = 'Thad';
    group.characterType = 'worker';

    var bodyColor = 0x8A8A9A;
    var legH = 0.85;
    var bodyH = 0.95;
    var headR = 0.45;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY (slightly wider, sporty) ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, bodyH, 0.6),
      mat(bodyColor)
    );
    body.add(torso);
    // Wider shoulders plate
    var shoulders = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.12, 0.55),
      mat(bodyColor, { metalness: 0.8 })
    );
    shoulders.position.set(0, bodyH * 0.42, 0);
    body.add(shoulders);
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor());
    // Eyes - green, bigger
    var leftEye = createRoundEye(0x2ECC71, 0.15, 2.5);
    leftEye.position.set(-0.2, 0.08, 0.44);
    head.add(leftEye);
    var rightEye = createRoundEye(0x2ECC71, 0.15, 2.5);
    rightEye.position.set(0.2, 0.08, 0.44);
    head.add(rightEye);
    // Short antenna
    var antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.02, 0.45, 6),
      mat(0x6A6A7A, { metalness: 0.9 })
    );
    antenna.position.set(0.08, headR + 0.2, 0);
    head.add(antenna);
    var antTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      emissiveMat(0x2ECC71, 1.5)
    );
    antTip.position.set(0.08, headR + 0.42, 0);
    head.add(antTip);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS (slightly larger) ---
    var arms = createWorkerArms(bodyColor, 0.75);
    arms.leftArm.position.set(-0.7, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.7, bodyY + bodyH * 0.35, 0);
    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    group.add(legs);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  3. KHAN DOORMAN
  // =========================================================================
  CF.createKhan = function () {
    var group = new THREE.Group();
    group.characterName = 'Khan';
    group.characterType = 'worker';

    var bodyColor = 0x5A5A6A;
    var legH = 0.95;
    var bodyH = 1.0;
    var headR = 0.48;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY (broader, father figure) ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, bodyH, 0.65),
      mat(bodyColor)
    );
    body.add(torso);
    // Broader shoulder plates
    var shoulderPlate = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.12, 0.6),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    shoulderPlate.position.set(0, bodyH * 0.43, 0);
    body.add(shoulderPlate);
    // Tool belt (torus around waist)
    var belt = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.04, 8, 20),
      mat(0x4A3A2A, { metalness: 0.6, roughness: 0.5 })
    );
    belt.position.set(0, -bodyH * 0.35, 0);
    belt.rotation.x = Math.PI * 0.5;
    body.add(belt);
    // Belt tool pouches
    for (var bp = 0; bp < 3; bp++) {
      var pouch = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.12, 0.08),
        mat(0x4A3A2A, { metalness: 0.5, roughness: 0.6 })
      );
      var angle = (bp - 1) * 0.7;
      pouch.position.set(Math.sin(angle) * 0.52, -bodyH * 0.38, Math.cos(angle) * 0.52);
      body.add(pouch);
    }
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor(0x2A2A3A));
    // Yellow round eyes
    var leftEye = createRoundEye(0xF1C40F, 0.14, 2);
    leftEye.position.set(-0.22, 0.06, 0.46);
    head.add(leftEye);
    var rightEye = createRoundEye(0xF1C40F, 0.14, 2);
    rightEye.position.set(0.22, 0.06, 0.46);
    head.add(rightEye);
    // Mustache - two small curved cylinders
    var mustacheL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.015, 0.2, 6),
      mat(0x3A3A3A)
    );
    mustacheL.position.set(-0.12, -0.12, 0.44);
    mustacheL.rotation.z = -Math.PI * 0.35;
    mustacheL.rotation.x = -0.2;
    head.add(mustacheL);
    var mustacheR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.015, 0.2, 6),
      mat(0x3A3A3A)
    );
    mustacheR.position.set(0.12, -0.12, 0.44);
    mustacheR.rotation.z = Math.PI * 0.35;
    mustacheR.rotation.x = -0.2;
    head.add(mustacheR);
    // Mustache center
    var mustacheCenter = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.06),
      mat(0x3A3A3A)
    );
    mustacheCenter.position.set(0, -0.08, 0.44);
    head.add(mustacheCenter);
    // Hard hat / construction helmet (yellow half-sphere)
    var helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
      mat(0xF1C40F, { metalness: 0.4, roughness: 0.5 })
    );
    helmet.position.set(0, 0.08, 0);
    head.add(helmet);
    // Helmet brim
    var brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.56, 0.04, 18),
      mat(0xF1C40F, { metalness: 0.4, roughness: 0.5 })
    );
    brim.position.set(0, 0.06, 0.05);
    head.add(brim);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS ---
    var arms = createWorkerArms(bodyColor, 0.8);
    arms.leftArm.position.set(-0.75, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.75, bodyY + bodyH * 0.35, 0);
    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    group.add(legs);

    // --- DOOR on back ---
    var door = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 1.2, 0.08),
      mat(0x8B6C42, { metalness: 0.2, roughness: 0.75 })
    );
    door.position.set(0, bodyY + 0.1, -0.5);
    // Door knob
    var knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 6),
      mat(0xC8A832, { metalness: 0.9, roughness: 0.1 })
    );
    knob.position.set(0.3, 0, 0.05);
    door.add(knob);
    // Door panel lines
    var panelLine1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.02),
      mat(0x7A5C32)
    );
    panelLine1.position.set(0, 0.25, 0.05);
    door.add(panelLine1);
    var panelLine2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.02),
      mat(0x7A5C32)
    );
    panelLine2.position.set(0, -0.25, 0.05);
    door.add(panelLine2);
    group.add(door);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  4. LIZZY
  // =========================================================================
  CF.createLizzy = function () {
    var group = new THREE.Group();
    group.characterName = 'Lizzy';
    group.characterType = 'worker';

    var bodyColor = 0x9A6B8A;
    var legH = 0.85;
    var bodyH = 0.85;
    var headR = 0.42;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY (slimmer) ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, bodyH, 0.5),
      mat(bodyColor)
    );
    body.add(torso);
    // Slightly fashionable waist accent
    var waistAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.08, 0.52),
      mat(0xBA8BAA, { metalness: 0.5 })
    );
    waistAccent.position.set(0, -bodyH * 0.2, 0);
    body.add(waistAccent);
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor());
    // Eyes - pink
    var leftEye = createRoundEye(0xFF69B4, 0.13, 2.5);
    leftEye.position.set(-0.18, 0.06, 0.42);
    head.add(leftEye);
    var rightEye = createRoundEye(0xFF69B4, 0.13, 2.5);
    rightEye.position.set(0.18, 0.06, 0.42);
    head.add(rightEye);
    // Long hair extensions (5 thin cones hanging from back)
    for (var lh = 0; lh < 5; lh++) {
      var hairStrand = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.65, 6),
        mat(0xCC4488)
      );
      hairStrand.rotation.x = Math.PI * 0.85 + (lh - 2) * 0.08;
      hairStrand.rotation.z = (lh - 2) * 0.12;
      hairStrand.position.set(
        (lh - 2) * 0.12,
        -0.05,
        -0.3 - Math.abs(lh - 2) * 0.04
      );
      head.add(hairStrand);
    }
    // Bow on head (two small triangles)
    var bowLeft = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.2, 3),
      mat(0xFF69B4, { metalness: 0.3, roughness: 0.6 })
    );
    bowLeft.position.set(-0.12, headR + 0.08, 0.05);
    bowLeft.rotation.z = Math.PI * 0.5 + 0.3;
    bowLeft.rotation.x = 0.2;
    head.add(bowLeft);
    var bowRight = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.2, 3),
      mat(0xFF69B4, { metalness: 0.3, roughness: 0.6 })
    );
    bowRight.position.set(0.12, headR + 0.08, 0.05);
    bowRight.rotation.z = -(Math.PI * 0.5 + 0.3);
    bowRight.rotation.x = 0.2;
    head.add(bowRight);
    // Bow center knot
    var bowCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      mat(0xFF69B4)
    );
    bowCenter.position.set(0, headR + 0.08, 0.05);
    head.add(bowCenter);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS (slimmer) ---
    var arms = createWorkerArms(bodyColor, 0.65);
    arms.leftArm.position.set(-0.55, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.55, bodyY + bodyH * 0.35, 0);
    // Phone in right hand
    var phone = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.25, 0.03),
      mat(0x2A2A2A, { metalness: 0.9, roughness: 0.1 })
    );
    phone.position.set(0, -0.85, 0.1);
    // Phone screen glow
    var screen = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.2, 0.005),
      emissiveMat(0x44AAFF, 1.5)
    );
    screen.position.set(0, 0, 0.018);
    phone.add(screen);
    arms.rightArm.add(phone);
    // Angle right arm slightly to hold phone
    arms.rightArm.rotation.x = 0.4;

    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    group.add(legs);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  5. DOLL
  // =========================================================================
  CF.createDoll = function () {
    var group = new THREE.Group();
    group.characterName = 'Doll';
    group.characterType = 'worker';

    var bodyColor = 0xC0C0D0;
    var legH = 0.85;
    var bodyH = 0.88;
    var headR = 0.43;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, bodyH, 0.52),
      mat(bodyColor)
    );
    body.add(torso);
    // Darker color accents (gothic accents)
    var darkStripe1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.06, 0.53),
      mat(0x4A4A5A, { metalness: 0.8 })
    );
    darkStripe1.position.set(0, bodyH * 0.15, 0);
    body.add(darkStripe1);
    var darkStripe2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.06, 0.53),
      mat(0x4A4A5A, { metalness: 0.8 })
    );
    darkStripe2.position.set(0, -bodyH * 0.15, 0);
    body.add(darkStripe2);
    // AbsoluteSolver symbol on chest (tiny octahedron, red emissive)
    var solver = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.08, 0),
      emissiveMat(0xFF0000, 3)
    );
    solver.position.set(0, 0.15, 0.28);
    solver.rotation.y = Math.PI * 0.25;
    body.add(solver);
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor());
    // Left eye - normal yellow
    var leftEye = createRoundEye(0xF1C40F, 0.13, 2);
    leftEye.position.set(-0.18, 0.06, 0.43);
    head.add(leftEye);
    // Right eye - special: ring/torus, red glow
    var rightEyeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.1, 0.025, 8, 16),
      emissiveMat(0xFF0000, 3)
    );
    rightEyeRing.position.set(0.18, 0.06, 0.44);
    head.add(rightEyeRing);
    // Inner glow for the special eye
    var rightEyeCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      emissiveMat(0xFF0000, 2)
    );
    rightEyeCenter.position.set(0.18, 0.06, 0.445);
    head.add(rightEyeCenter);
    // Long straight hair (flat box panels hanging from head, silver-white)
    for (var dh = 0; dh < 5; dh++) {
      var hairPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.7, 0.03),
        mat(0xD0D0E0, { metalness: 0.5, roughness: 0.4 })
      );
      hairPanel.position.set(
        (dh - 2) * 0.14,
        -0.2,
        -0.32 - Math.abs(dh - 2) * 0.03
      );
      hairPanel.rotation.x = 0.15;
      head.add(hairPanel);
    }
    // Side hair panels
    var sideHairL = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.55, 0.12),
      mat(0xD0D0E0, { metalness: 0.5, roughness: 0.4 })
    );
    sideHairL.position.set(-0.4, -0.1, -0.05);
    head.add(sideHairL);
    var sideHairR = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.55, 0.12),
      mat(0xD0D0E0, { metalness: 0.5, roughness: 0.4 })
    );
    sideHairR.position.set(0.4, -0.1, -0.05);
    head.add(sideHairR);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS ---
    var arms = createWorkerArms(bodyColor, 0.7);
    arms.leftArm.position.set(-0.58, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.58, bodyY + bodyH * 0.35, 0);
    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    group.add(legs);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  6. TEACHER
  // =========================================================================
  CF.createTeacher = function () {
    var group = new THREE.Group();
    group.characterName = 'Teacher';
    group.characterType = 'worker';

    var bodyColor = 0x7A6A5A;
    var legH = 0.95;
    var bodyH = 1.0;
    var headR = 0.46;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, bodyH, 0.58),
      mat(bodyColor)
    );
    body.add(torso);
    // Professional collar
    var tCollar = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.1, 0.2),
      mat(0xDDDDCC, { metalness: 0.3, roughness: 0.6 })
    );
    tCollar.position.set(0, bodyH * 0.43, 0.18);
    body.add(tCollar);
    // Button line down center
    for (var btn = 0; btn < 3; btn++) {
      var button = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        mat(0x3A3A3A)
      );
      button.position.set(0, 0.2 - btn * 0.22, 0.3);
      body.add(button);
    }
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor());
    // Eyes - white glow
    var leftEye = createRoundEye(0xFFFFFF, 0.13, 1.8);
    leftEye.position.set(-0.2, 0.06, 0.44);
    head.add(leftEye);
    var rightEye = createRoundEye(0xFFFFFF, 0.13, 1.8);
    rightEye.position.set(0.2, 0.06, 0.44);
    head.add(rightEye);
    // Glasses - two torus shapes + wire bridge
    var glassL = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.015, 8, 16),
      mat(0x888888, { metalness: 0.9, roughness: 0.1 })
    );
    glassL.position.set(-0.2, 0.06, 0.46);
    head.add(glassL);
    var glassR = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.015, 8, 16),
      mat(0x888888, { metalness: 0.9, roughness: 0.1 })
    );
    glassR.position.set(0.2, 0.06, 0.46);
    head.add(glassR);
    // Bridge between glasses
    var bridge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4),
      mat(0x888888, { metalness: 0.9, roughness: 0.1 })
    );
    bridge.rotation.z = Math.PI * 0.5;
    bridge.position.set(0, 0.06, 0.47);
    head.add(bridge);
    // Earpieces (sides of glasses)
    var earL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4),
      mat(0x888888, { metalness: 0.9 })
    );
    earL.rotation.z = Math.PI * 0.5;
    earL.rotation.y = Math.PI * 0.35;
    earL.position.set(-0.32, 0.06, 0.35);
    head.add(earL);
    var earR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4),
      mat(0x888888, { metalness: 0.9 })
    );
    earR.rotation.z = -Math.PI * 0.5;
    earR.rotation.y = -Math.PI * 0.35;
    earR.position.set(0.32, 0.06, 0.35);
    head.add(earR);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS ---
    var arms = createWorkerArms(bodyColor, 0.78);
    arms.leftArm.position.set(-0.65, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.65, bodyY + bodyH * 0.35, 0);

    // Book in left hand
    var book = new THREE.Group();
    var bookCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.32, 0.06),
      mat(0x8B4513, { metalness: 0.2, roughness: 0.8 })
    );
    book.add(bookCover);
    // Pages (lighter interior)
    var pages = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.3, 0.04),
      mat(0xFFF8E7, { metalness: 0.1, roughness: 0.9 })
    );
    pages.position.set(0, 0, 0.01);
    book.add(pages);
    // Spine
    var spine = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.32, 0.06),
      mat(0x6B3310, { metalness: 0.3, roughness: 0.7 })
    );
    spine.position.set(-0.14, 0, 0);
    book.add(spine);
    book.position.set(0, -0.9, 0.15);
    book.rotation.x = 0.3;
    arms.leftArm.add(book);
    arms.leftArm.rotation.x = 0.5;
    arms.leftArm.rotation.z = 0.15;

    // Pointer stick in right hand
    var pointer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.012, 1.2, 6),
      mat(0x4A3A2A, { metalness: 0.3, roughness: 0.7 })
    );
    pointer.position.set(0, -0.6, 0.05);
    pointer.rotation.x = -0.5;
    arms.rightArm.add(pointer);
    // Pointer tip
    var pTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      mat(0xCC0000)
    );
    pTip.position.set(0, -0.6, 0);
    pointer.add(pTip);

    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    group.add(legs);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  7. TESSA (Human character)
  // =========================================================================
  CF.createTessa = function () {
    var group = new THREE.Group();
    group.characterName = 'Tessa';
    group.characterType = 'human';

    var skinColor = 0xFFD5B4;
    var hairColor = 0x8B4513;
    var uniformColor = 0xE8E8F0;
    var legH = 1.1;
    var bodyH = 1.05;
    var headR = 0.38;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.7;

    // --- BODY (human proportions, white suit, less metallic) ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, bodyH, 0.5),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    body.add(torso);
    // Neck
    var neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.18, 8),
      mat(skinColor, { metalness: 0.1, roughness: 0.8 })
    );
    neck.position.set(0, bodyH * 0.5 + 0.08, 0);
    body.add(neck);
    // JCJenson badge on chest
    var badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.12, 0.02),
      mat(0xD4AA00, { metalness: 0.9, roughness: 0.1 })
    );
    badge.position.set(0.2, bodyH * 0.25, 0.26);
    body.add(badge);
    // Badge text line
    var badgeLine = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.015, 0.005),
      mat(0x2A2A2A)
    );
    badgeLine.position.set(0, -0.02, 0.012);
    badge.add(badgeLine);
    // Collar detail
    var collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.08, 0.15),
      mat(0xF0F0F8, { metalness: 0.1, roughness: 0.7 })
    );
    collar.position.set(0, bodyH * 0.44, 0.15);
    body.add(collar);
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- CAPE / JACKET on back (blue) ---
    var cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.95, 0.06),
      mat(0x3498DB, { metalness: 0.2, roughness: 0.6 })
    );
    cape.position.set(0, bodyY + 0.05, -0.28);
    // Cape bottom extends down
    var capeBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.45, 0.04),
      mat(0x3498DB, { metalness: 0.2, roughness: 0.6 })
    );
    capeBottom.position.set(0, -0.65, 0);
    cape.add(capeBottom);
    group.add(cape);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    head.add(skull);
    // Human eyes (simple dark dots)
    var humanEyeL = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      mat(0x3A2A1A, { metalness: 0.8, roughness: 0.2 })
    );
    humanEyeL.position.set(-0.12, 0.04, 0.34);
    head.add(humanEyeL);
    var humanEyeR = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      mat(0x3A2A1A, { metalness: 0.8, roughness: 0.2 })
    );
    humanEyeR.position.set(0.12, 0.04, 0.34);
    head.add(humanEyeR);
    // Eye whites
    var eyeWhiteL = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      mat(0xF8F8F8, { metalness: 0.1, roughness: 0.8 })
    );
    eyeWhiteL.position.set(-0.12, 0.04, 0.32);
    head.add(eyeWhiteL);
    var eyeWhiteR = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      mat(0xF8F8F8, { metalness: 0.1, roughness: 0.8 })
    );
    eyeWhiteR.position.set(0.12, 0.04, 0.32);
    head.add(eyeWhiteR);
    // Nose
    var nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 6, 6),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    nose.position.set(0, -0.02, 0.37);
    head.add(nose);
    // Mouth line
    var mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.015, 0.01),
      mat(0xCC8888, { metalness: 0.1, roughness: 0.8 })
    );
    mouth.position.set(0, -0.1, 0.35);
    head.add(mouth);
    // Brown hair cap (half-sphere)
    var hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6),
      mat(hairColor, { metalness: 0.15, roughness: 0.8 })
    );
    hairCap.position.set(0, 0.04, -0.02);
    head.add(hairCap);
    // Ponytail (cone on back)
    var ponytail = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.55, 8),
      mat(hairColor, { metalness: 0.15, roughness: 0.8 })
    );
    ponytail.position.set(0, 0.05, -0.38);
    ponytail.rotation.x = Math.PI * 0.7;
    head.add(ponytail);
    // Bangs (front hair)
    var bangs = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.1, 0.15),
      mat(hairColor, { metalness: 0.15, roughness: 0.8 })
    );
    bangs.position.set(0, 0.22, 0.28);
    head.add(bangs);

    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS (human proportions) ---
    var leftArm = new THREE.Group();
    leftArm.name = 'leftArm';
    var lShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    leftArm.add(lShoulder);
    var lUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    lUpper.position.y = -0.3;
    leftArm.add(lUpper);
    var lForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.45, 8),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    lForearm.position.y = -0.6;
    leftArm.add(lForearm);
    var lHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    lHand.position.y = -0.85;
    leftArm.add(lHand);
    leftArm.position.set(-0.58, bodyY + bodyH * 0.38, 0);

    var rightArm = new THREE.Group();
    rightArm.name = 'rightArm';
    var rShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 8, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    rightArm.add(rShoulder);
    var rUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    rUpper.position.y = -0.3;
    rightArm.add(rUpper);
    var rForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.065, 0.45, 8),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    rForearm.position.y = -0.6;
    rightArm.add(rForearm);
    var rHand = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 8, 8),
      mat(skinColor, { metalness: 0.1, roughness: 0.85 })
    );
    rHand.position.y = -0.85;
    rightArm.add(rHand);
    rightArm.position.set(0.58, bodyY + bodyH * 0.38, 0);

    group.add(leftArm);
    group.add(rightArm);

    // --- LEGS (human, with boots) ---
    var leftLeg = new THREE.Group();
    leftLeg.name = 'leftLeg';
    var llUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    llUpper.position.y = -0.28;
    leftLeg.add(llUpper);
    var llLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    llLower.position.y = -0.58;
    leftLeg.add(llLower);
    // Boot (brown cylinder)
    var bootL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 0.25, 8),
      mat(0x6B4513, { metalness: 0.3, roughness: 0.7 })
    );
    bootL.position.y = -0.88;
    leftLeg.add(bootL);
    // Boot sole
    var soleL = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.32),
      mat(0x3A2A1A, { metalness: 0.4, roughness: 0.8 })
    );
    soleL.position.y = -1.0;
    soleL.position.z = 0.03;
    leftLeg.add(soleL);
    leftLeg.position.set(-0.25, legH, 0);

    var rightLeg = new THREE.Group();
    rightLeg.name = 'rightLeg';
    var rlUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.55, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    rlUpper.position.y = -0.28;
    rightLeg.add(rlUpper);
    var rlLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8),
      mat(uniformColor, { metalness: 0.15, roughness: 0.7 })
    );
    rlLower.position.y = -0.58;
    rightLeg.add(rlLower);
    var bootR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.12, 0.25, 8),
      mat(0x6B4513, { metalness: 0.3, roughness: 0.7 })
    );
    bootR.position.y = -0.88;
    rightLeg.add(bootR);
    var soleR = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.06, 0.32),
      mat(0x3A2A1A, { metalness: 0.4, roughness: 0.8 })
    );
    soleR.position.y = -1.0;
    soleR.position.z = 0.03;
    rightLeg.add(soleR);
    rightLeg.position.set(0.25, legH, 0);

    group.add(leftLeg);
    group.add(rightLeg);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  8. CYN (Creepy Murder Drone)
  // =========================================================================
  CF.createCyn = function () {
    var group = new THREE.Group();
    group.characterName = 'Cyn';
    group.characterType = 'murder';

    var bodyColor = 0xE0E0F0;
    var legH = 1.0;
    var bodyH = 0.95;
    var headR = 0.44;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;
    // Slightly too thin, slightly too tall proportions
    var thinScale = 0.88;

    // --- BODY (maid dress-like, wider lower section) ---
    var body = new THREE.Group();
    body.name = 'body';
    // Upper torso (thin)
    var upperTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.72 * thinScale, bodyH * 0.6, 0.45 * thinScale),
      mat(bodyColor)
    );
    upperTorso.position.set(0, bodyH * 0.15, 0);
    body.add(upperTorso);
    // Lower torso / skirt (wider, maid dress look)
    var skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3 * thinScale, 0.55, bodyH * 0.5, 12),
      mat(0x1A1A2A, { metalness: 0.5, roughness: 0.4 })
    );
    skirt.position.set(0, -bodyH * 0.25, 0);
    body.add(skirt);
    // White apron front
    var apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, bodyH * 0.45, 0.03),
      mat(0xF0F0FF, { metalness: 0.2, roughness: 0.6 })
    );
    apron.position.set(0, -bodyH * 0.12, 0.28);
    body.add(apron);
    // Collar ruffle
    var ruffle = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.04, 8, 16),
      mat(0xF0F0FF, { metalness: 0.2, roughness: 0.6 })
    );
    ruffle.position.set(0, bodyH * 0.42, 0);
    ruffle.rotation.x = Math.PI * 0.5;
    body.add(ruffle);
    // AbsoluteSolver symbol on chest (golden-yellow octahedron, high emissive)
    var solverSym = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1, 0),
      emissiveMat(0xFFDD00, 3)
    );
    solverSym.position.set(0, bodyH * 0.2, 0.25);
    solverSym.rotation.y = Math.PI * 0.25;
    body.add(solverSym);
    // Slight glitch offset on body
    body.rotation.z = 0.03;
    body.position.set(0, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    // Visor (cracked effect - slight displacement)
    var visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.45, 0.15),
      mat(0x1A1A2A, { metalness: 0.9, roughness: 0.15 })
    );
    visor.position.set(0, 0.05, 0.38);
    head.add(visor);
    // Crack line on visor
    var crack1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.3, 0.01),
      mat(0xE0E0F0, { metalness: 0.5 })
    );
    crack1.position.set(0.15, 0.08, 0.46);
    crack1.rotation.z = 0.3;
    head.add(crack1);
    var crack2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.15, 0.01),
      mat(0xE0E0F0, { metalness: 0.5 })
    );
    crack2.position.set(0.22, 0.18, 0.46);
    crack2.rotation.z = -0.5;
    head.add(crack2);
    // Left eye - normal X shape (yellow)
    var xSize = 0.1;
    var xThick = 0.025;
    var xBar1L = new THREE.Mesh(
      new THREE.BoxGeometry(xThick, xSize * 2.2, xThick),
      emissiveMat(0xFFDD00, 2.5)
    );
    xBar1L.rotation.z = Math.PI * 0.25;
    xBar1L.position.set(-0.2, 0.08, 0.46);
    head.add(xBar1L);
    var xBar2L = new THREE.Mesh(
      new THREE.BoxGeometry(xThick, xSize * 2.2, xThick),
      emissiveMat(0xFFDD00, 2.5)
    );
    xBar2L.rotation.z = -Math.PI * 0.25;
    xBar2L.position.set(-0.2, 0.08, 0.46);
    head.add(xBar2L);
    // Right eye - glitched X (yellow but with extra geometry sticking out)
    var xBar1R = new THREE.Mesh(
      new THREE.BoxGeometry(xThick, xSize * 2.2, xThick),
      emissiveMat(0xFFDD00, 2.5)
    );
    xBar1R.rotation.z = Math.PI * 0.25 + 0.08; // slightly off
    xBar1R.position.set(0.2, 0.08, 0.46);
    head.add(xBar1R);
    var xBar2R = new THREE.Mesh(
      new THREE.BoxGeometry(xThick, xSize * 2.2, xThick),
      emissiveMat(0xFFDD00, 2.5)
    );
    xBar2R.rotation.z = -Math.PI * 0.25 - 0.05; // slightly off
    xBar2R.position.set(0.2, 0.08, 0.46);
    head.add(xBar2R);
    // Glitch spikes coming out of right eye
    var glitchSpike1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.12, 0.02),
      emissiveMat(0xFFDD00, 3)
    );
    glitchSpike1.position.set(0.3, 0.15, 0.47);
    glitchSpike1.rotation.z = 0.6;
    head.add(glitchSpike1);
    var glitchSpike2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.1, 0.015),
      emissiveMat(0xFFDD00, 3)
    );
    glitchSpike2.position.set(0.26, 0.0, 0.47);
    glitchSpike2.rotation.z = -0.8;
    head.add(glitchSpike2);
    var glitchSpike3 = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.08, 0.015),
      emissiveMat(0xFFDD00, 2.5)
    );
    glitchSpike3.position.set(0.18, 0.18, 0.47);
    glitchSpike3.rotation.z = 1.2;
    head.add(glitchSpike3);
    // Bow on head (maid's bow - two flat triangles, white)
    var maidBowL = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.28, 3),
      mat(0xF8F8FF, { metalness: 0.2, roughness: 0.6 })
    );
    maidBowL.position.set(-0.15, headR + 0.12, -0.02);
    maidBowL.rotation.z = Math.PI * 0.5 + 0.25;
    maidBowL.scale.z = 0.3;
    head.add(maidBowL);
    var maidBowR = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.28, 3),
      mat(0xF8F8FF, { metalness: 0.2, roughness: 0.6 })
    );
    maidBowR.position.set(0.15, headR + 0.12, -0.02);
    maidBowR.rotation.z = -(Math.PI * 0.5 + 0.25);
    maidBowR.scale.z = 0.3;
    head.add(maidBowR);
    var maidBowCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      mat(0xF0F0FF)
    );
    maidBowCenter.position.set(0, headR + 0.12, -0.02);
    head.add(maidBowCenter);
    // Slight head glitch offset
    head.rotation.z = -0.04;
    head.rotation.x = 0.02;
    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS (spider-like claws, longer fingers) ---
    var leftArm = new THREE.Group();
    leftArm.name = 'leftArm';
    var lArmShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      mat(bodyColor)
    );
    leftArm.add(lArmShoulder);
    var lArmUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * thinScale, 0.07 * thinScale, 0.85, 8),
      mat(bodyColor)
    );
    lArmUpper.position.y = -0.45;
    leftArm.add(lArmUpper);
    // Spider-like claw hand
    var lClawPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      mat(bodyColor)
    );
    lClawPalm.position.y = -0.9;
    leftArm.add(lClawPalm);
    // 5 spider-like fingers (longer)
    for (var lf = 0; lf < 5; lf++) {
      var lfAngle = (lf - 2) * 0.35;
      var finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.012, 0.4, 5),
        mat(bodyColor, { metalness: 0.85 })
      );
      finger.position.set(
        Math.sin(lfAngle) * 0.08,
        -1.1 - Math.abs(lf - 2) * 0.02,
        Math.cos(lfAngle) * 0.04
      );
      finger.rotation.z = lfAngle * 0.4;
      finger.rotation.x = 0.3;
      leftArm.add(finger);
      // Finger tip claw
      var clawTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.015, 0.08, 4),
        mat(0x3A3A4A, { metalness: 0.9 })
      );
      clawTip.position.y = -0.22;
      finger.add(clawTip);
    }
    leftArm.position.set(-0.52, bodyY + bodyH * 0.32, 0);
    // Slight glitch rotation
    leftArm.rotation.z = 0.05;

    var rightArm = new THREE.Group();
    rightArm.name = 'rightArm';
    var rArmShoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      mat(bodyColor)
    );
    rightArm.add(rArmShoulder);
    var rArmUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * thinScale, 0.07 * thinScale, 0.85, 8),
      mat(bodyColor)
    );
    rArmUpper.position.y = -0.45;
    rightArm.add(rArmUpper);
    var rClawPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      mat(bodyColor)
    );
    rClawPalm.position.y = -0.9;
    rightArm.add(rClawPalm);
    for (var rf = 0; rf < 5; rf++) {
      var rfAngle = (rf - 2) * 0.35;
      var rFinger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.012, 0.4, 5),
        mat(bodyColor, { metalness: 0.85 })
      );
      rFinger.position.set(
        Math.sin(rfAngle) * 0.08,
        -1.1 - Math.abs(rf - 2) * 0.02,
        Math.cos(rfAngle) * 0.04
      );
      rFinger.rotation.z = rfAngle * 0.4;
      rFinger.rotation.x = 0.3;
      rightArm.add(rFinger);
      var rClawTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.015, 0.08, 4),
        mat(0x3A3A4A, { metalness: 0.9 })
      );
      rClawTip.position.y = -0.22;
      rFinger.add(rClawTip);
    }
    rightArm.position.set(0.52, bodyY + bodyH * 0.32, 0);
    rightArm.rotation.z = -0.03;

    group.add(leftArm);
    group.add(rightArm);

    // --- WIRE TENDRILS from back (5-6 thin cylinders, random directions, purple glow) ---
    var tendrilDirections = [
      { x: -0.3, y: 0.5, z: -0.8, len: 1.1 },
      { x: 0.4, y: 0.7, z: -0.6, len: 0.9 },
      { x: -0.5, y: -0.2, z: -0.9, len: 1.3 },
      { x: 0.2, y: 0.8, z: -0.5, len: 0.8 },
      { x: -0.1, y: -0.5, z: -0.7, len: 1.0 },
      { x: 0.6, y: 0.1, z: -0.8, len: 1.2 }
    ];
    for (var t = 0; t < tendrilDirections.length; t++) {
      var td = tendrilDirections[t];
      var tendril = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.015, td.len, 6),
        mat(0x2A2A3A, {
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0x4A2A6A,
          emissiveIntensity: 0.6
        })
      );
      // Point the tendril in its direction
      var dir = new THREE.Vector3(td.x, td.y, td.z).normalize();
      tendril.position.set(
        td.x * td.len * 0.4,
        bodyY + td.y * td.len * 0.4 + 0.2,
        -0.3 + td.z * td.len * 0.3
      );
      tendril.lookAt(
        tendril.position.x + dir.x,
        tendril.position.y + dir.y,
        tendril.position.z + dir.z
      );
      tendril.rotateX(Math.PI * 0.5);
      // Tendril tip glow
      var tTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 6, 6),
        emissiveMat(0x7B4F9A, 2)
      );
      tTip.position.y = td.len * 0.5;
      tendril.add(tTip);
      group.add(tendril);
    }

    // --- LEGS (slightly too thin) ---
    var leftLeg = new THREE.Group();
    leftLeg.name = 'leftLeg';
    var cLLUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * thinScale, 0.12 * thinScale, legH * 0.55, 8),
      mat(bodyColor)
    );
    cLLUpper.position.y = -legH * 0.275;
    leftLeg.add(cLLUpper);
    var cLLLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * thinScale, 0.1 * thinScale, legH * 0.55, 8),
      mat(0x1A1A2A)
    );
    cLLLower.position.y = -legH * 0.55;
    leftLeg.add(cLLLower);
    var cLFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 0.3),
      mat(0x1A1A2A, { metalness: 0.8 })
    );
    cLFoot.position.set(0, -legH * 0.825, 0.04);
    leftLeg.add(cLFoot);
    leftLeg.position.set(-0.3, legH, 0);
    // Slight glitch
    leftLeg.rotation.z = 0.04;

    var rightLeg = new THREE.Group();
    rightLeg.name = 'rightLeg';
    var cRLUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15 * thinScale, 0.12 * thinScale, legH * 0.55, 8),
      mat(bodyColor)
    );
    cRLUpper.position.y = -legH * 0.275;
    rightLeg.add(cRLUpper);
    var cRLLower = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * thinScale, 0.1 * thinScale, legH * 0.55, 8),
      mat(0x1A1A2A)
    );
    cRLLower.position.y = -legH * 0.55;
    rightLeg.add(cRLLower);
    var cRFoot = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 0.3),
      mat(0x1A1A2A, { metalness: 0.8 })
    );
    cRFoot.position.set(0, -legH * 0.825, 0.04);
    rightLeg.add(cRFoot);
    rightLeg.position.set(0.3, legH, 0);
    // Slight glitch
    rightLeg.rotation.z = -0.05;

    group.add(leftLeg);
    group.add(rightLeg);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  9. NORI DOORMAN
  // =========================================================================
  CF.createNori = function () {
    var group = new THREE.Group();
    group.characterName = 'Nori';
    group.characterType = 'worker';

    var bodyColor = 0x4A3A5A;
    var legH = 0.9;
    var bodyH = 0.92;
    var headR = 0.44;
    var bodyY = legH + bodyH * 0.5;
    var headY = legH + bodyH + headR * 0.65;

    // --- BODY ---
    var body = new THREE.Group();
    body.name = 'body';
    var torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, bodyH, 0.54),
      mat(bodyColor)
    );
    body.add(torso);
    // Lab coat (wider box over torso, white/light gray)
    var labCoat = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, bodyH * 1.15, 0.58),
      mat(0xD8D8E0, { metalness: 0.3, roughness: 0.6 })
    );
    labCoat.position.set(0, -bodyH * 0.05, 0);
    body.add(labCoat);
    // Lab coat opening (darker center line visible)
    var coatOpening = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, bodyH * 1.1, 0.02),
      mat(bodyColor, { metalness: 0.5 })
    );
    coatOpening.position.set(0, -bodyH * 0.05, 0.3);
    body.add(coatOpening);
    // Pocket on coat
    var pocket = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.15, 0.02),
      mat(0xC8C8D0, { metalness: 0.3 })
    );
    pocket.position.set(0.25, bodyH * 0.05, 0.3);
    body.add(pocket);
    // Pen in pocket
    var pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.18, 4),
      mat(0x2222AA, { metalness: 0.6 })
    );
    pen.position.set(0.28, bodyH * 0.15, 0.31);
    pen.rotation.z = 0.1;
    body.add(pen);
    // Slightly worn look: some geometry displaced
    body.position.set(0.02, bodyY, 0);
    group.add(body);

    // --- HEAD ---
    var head = new THREE.Group();
    head.name = 'head';
    var skull = new THREE.Mesh(
      new THREE.SphereGeometry(headR, 16, 14),
      mat(bodyColor, { metalness: 0.8, roughness: 0.2 })
    );
    head.add(skull);
    head.add(createVisor(0x2A2A3A));
    // Purple eyes (slightly dim)
    var leftEye = createRoundEye(0x7B4F9A, 0.12, 1.5);
    leftEye.position.set(-0.2, 0.06, 0.43);
    head.add(leftEye);
    var rightEye = createRoundEye(0x7B4F9A, 0.12, 1.5);
    rightEye.position.set(0.2, 0.06, 0.43);
    head.add(rightEye);
    // Hair (4 cones, darker purple, like Uzi but longer)
    for (var nh = 0; nh < 4; nh++) {
      var nHair = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.65, 6),
        mat(0x3A2A4A)
      );
      nHair.rotation.x = Math.PI * 0.55;
      nHair.position.set(
        (nh - 1.5) * 0.16,
        0.16,
        -0.35
      );
      head.add(nHair);
    }
    // Goggles on forehead (two small cylinders + strap torus)
    var goggleL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12),
      mat(0x3A3A4A, { metalness: 0.9, roughness: 0.1 })
    );
    goggleL.rotation.x = Math.PI * 0.5;
    goggleL.position.set(-0.16, 0.26, 0.32);
    head.add(goggleL);
    // Goggle lens
    var goggleLensL = new THREE.Mesh(
      new THREE.CircleGeometry(0.08, 12),
      mat(0x88CCFF, {
        metalness: 0.2,
        roughness: 0.3,
        emissive: 0x223344,
        emissiveIntensity: 0.5
      })
    );
    goggleLensL.position.set(-0.16, 0.26, 0.355);
    head.add(goggleLensL);
    var goggleR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12),
      mat(0x3A3A4A, { metalness: 0.9, roughness: 0.1 })
    );
    goggleR.rotation.x = Math.PI * 0.5;
    goggleR.position.set(0.16, 0.26, 0.32);
    head.add(goggleR);
    var goggleLensR = new THREE.Mesh(
      new THREE.CircleGeometry(0.08, 12),
      mat(0x88CCFF, {
        metalness: 0.2,
        roughness: 0.3,
        emissive: 0x223344,
        emissiveIntensity: 0.5
      })
    );
    goggleLensR.position.set(0.16, 0.26, 0.355);
    head.add(goggleLensR);
    // Strap (torus around head at goggle level)
    var strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.02, 8, 24),
      mat(0x3A3A3A, { metalness: 0.6, roughness: 0.5 })
    );
    strap.position.set(0, 0.26, 0);
    strap.rotation.x = Math.PI * 0.5;
    head.add(strap);

    // Slight damage: head slightly tilted
    head.rotation.z = 0.03;
    head.position.set(0, headY, 0);
    group.add(head);

    // --- ARMS ---
    var arms = createWorkerArms(bodyColor, 0.72);
    arms.leftArm.position.set(-0.62, bodyY + bodyH * 0.35, 0);
    arms.rightArm.position.set(0.62, bodyY + bodyH * 0.35, 0);

    // Tablet device in left hand (flat box, screen glow)
    var tablet = new THREE.Group();
    var tabletBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.3, 0.025),
      mat(0x2A2A3A, { metalness: 0.9, roughness: 0.1 })
    );
    tablet.add(tabletBody);
    var tabletScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.19, 0.26, 0.005),
      emissiveMat(0x44DDAA, 1.5)
    );
    tabletScreen.position.set(0, 0, 0.015);
    tablet.add(tabletScreen);
    // Data lines on screen
    for (var dl = 0; dl < 4; dl++) {
      var dataLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.012, 0.002),
        emissiveMat(0x22AA88, 1)
      );
      dataLine.position.set(0, 0.08 - dl * 0.055, 0.019);
      tablet.add(dataLine);
    }
    tablet.position.set(0, -0.85, 0.15);
    tablet.rotation.x = 0.6;
    arms.leftArm.add(tablet);
    arms.leftArm.rotation.x = 0.45;
    arms.leftArm.rotation.z = 0.15;

    group.add(arms.leftArm);
    group.add(arms.rightArm);

    // --- LEGS (slightly worn) ---
    var legs = createWorkerLegs(bodyColor, legH);
    legs.position.set(0, legH, 0);
    // Slight displacement for worn look
    legs.children[0].rotation.z = 0.02; // left leg
    group.add(legs);

    enableShadows(group);
    return group;
  };


  // =========================================================================
  //  UTILITY: List all available NPC characters
  // =========================================================================
  CF.getNPCCharacterList = function () {
    return [
      { name: 'Uzi',     method: 'createUzi',     type: 'worker' },
      { name: 'Thad',    method: 'createThad',    type: 'worker' },
      { name: 'Khan',    method: 'createKhan',    type: 'worker' },
      { name: 'Lizzy',   method: 'createLizzy',   type: 'worker' },
      { name: 'Doll',    method: 'createDoll',    type: 'worker' },
      { name: 'Teacher', method: 'createTeacher', type: 'worker' },
      { name: 'Tessa',   method: 'createTessa',   type: 'human' },
      { name: 'Cyn',     method: 'createCyn',     type: 'murder' },
      { name: 'Nori',    method: 'createNori',    type: 'worker' }
    ];
  };

  /** Create any NPC by name */
  CF.createNPCByName = function (name) {
    var methodName = 'create' + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    // Special case multi-word or exact matches
    var lookup = {
      'uzi': 'createUzi',
      'thad': 'createThad',
      'khan': 'createKhan',
      'lizzy': 'createLizzy',
      'doll': 'createDoll',
      'teacher': 'createTeacher',
      'tessa': 'createTessa',
      'cyn': 'createCyn',
      'nori': 'createNori'
    };
    var fn = lookup[name.toLowerCase()];
    if (fn && typeof CF[fn] === 'function') {
      return CF[fn]();
    }
    console.warn('[CharacterFactory] Unknown NPC name: ' + name);
    return null;
  };

  // Wrap all NPC creators with loadOrGenerate to support GLTF models and add 3D name tags
  var npcList = ['Uzi', 'Thad', 'Khan', 'Lizzy', 'Doll', 'Teacher', 'Tessa', 'Cyn', 'Nori', 'N', 'V', 'J'];
  for (var i = 0; i < npcList.length; i++) {
    (function(name) {
        var fnName = 'create' + name;
        var original = CF[fnName];
        if (original) {
            CF[fnName] = function() {
                var model;
                if (CF.loadOrGenerate) {
                    model = CF.loadOrGenerate(name, original);
                } else {
                    model = original.apply(this, arguments);
                }
                
                // Add 3D Name Tag
                if (!model.userData.hasNameTag && typeof createNameTag === 'function') {
                    var colorMap = {
                        'N': '#FFD700', 'V': '#FFD700', 'J': '#FFD700',
                        'Uzi': '#9B59B6', 'Doll': '#E74C3C', 'Thad': '#2ECC71',
                        'Khan': '#AAAAAA', 'Teacher': '#888888', 'Lizzy': '#FF69B4'
                    };
                    var c = colorMap[name] || '#ffffff';
                    var nameTag = createNameTag(name, c);
                    nameTag.position.y = 3.5;
                    model.add(nameTag);
                    model.userData.hasNameTag = true;
                }
                return model;
            };
        }
    })(npcList[i]);
  }

})();
