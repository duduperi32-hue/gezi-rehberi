// =============================================================================
// Murder Drones 3D - Character Factory
// =============================================================================

(function () {

  // ---- Shared material helpers ----

  function metalMat(color, metalness, roughness) {
    if (metalness === undefined) metalness = 0.8;
    if (roughness === undefined) roughness = 0.3;
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness
    });
  }

  function glowMat(color, intensity) {
    if (intensity === undefined) intensity = 2.5;
    var c = new THREE.Color(color);
    return new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: intensity,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.95
    });
  }

  /**
   * Creates an X-shaped eye from two crossed thin boxes.
   * @param {number} color - Hex color for glow
   * @param {number} size - Overall size of the X
   * @param {number} intensity - Emissive intensity
   * @returns {THREE.Group}
   */
  function createXEye(color, size, intensity) {
    if (size === undefined) size = 0.4;
    if (intensity === undefined) intensity = 3;
    var eyeGroup = new THREE.Group();
    var mat = glowMat(color, intensity);

    var barW = size * 1.2;
    var barH = size * 0.18;
    var barD = 0.08;

    var bar1Geo = new THREE.BoxGeometry(barW, barH, barD);
    var bar1 = new THREE.Mesh(bar1Geo, mat);
    bar1.rotation.z = Math.PI / 4;
    bar1.castShadow = false;
    eyeGroup.add(bar1);

    var bar2Geo = new THREE.BoxGeometry(barW, barH, barD);
    var bar2 = new THREE.Mesh(bar2Geo, mat);
    bar2.rotation.z = -Math.PI / 4;
    bar2.castShadow = false;
    eyeGroup.add(bar2);

    return eyeGroup;
  }

  /**
   * Helper: enable castShadow and receiveShadow on a mesh.
   */
  function shadow(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * Creates a claw hand (3 pointed fingers).
   * @param {THREE.Material} mat
   * @param {number} fingerLen
   * @returns {THREE.Group}
   */
  function createClaw(mat, fingerLen) {
    if (fingerLen === undefined) fingerLen = 0.4;
    var hand = new THREE.Group();
    hand.name = 'claw';

    // Palm
    var palmGeo = new THREE.SphereGeometry(0.15, 8, 6);
    var palm = shadow(new THREE.Mesh(palmGeo, mat));
    hand.add(palm);

    // Three fingers
    var angles = [-0.4, 0, 0.4];
    for (var i = 0; i < 3; i++) {
      var fGeo = new THREE.ConeGeometry(0.05, fingerLen, 6);
      var finger = shadow(new THREE.Mesh(fGeo, mat));
      finger.position.set(Math.sin(angles[i]) * 0.12, -fingerLen / 2, 0);
      finger.rotation.z = angles[i] * 0.5;
      hand.add(finger);
    }

    return hand;
  }


  // =========================================================================
  // N  -  Player (Friendly Murder Drone)
  // =========================================================================
  function createN() {
    var group = new THREE.Group();
    group.name = 'N';

    var bodyColor = 0x3a3a4a;
    var limbColor = 0x2a2a35;
    var eyeColor = 0xFFD700;
    var bodyMat = metalMat(bodyColor, 0.8, 0.3);
    var limbMat = metalMat(limbColor, 0.75, 0.35);

    // ---- BODY (capsule: cylinder + sphere top) ----
    var bodyGeo = new THREE.CylinderGeometry(0.6, 0.55, 1.4, 12);
    var body = shadow(new THREE.Mesh(bodyGeo, bodyMat));
    body.position.y = 1.0;
    body.name = 'body';
    group.add(body);

    // Rounded top of torso
    var bodyTopGeo = new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    var bodyTop = shadow(new THREE.Mesh(bodyTopGeo, bodyMat));
    bodyTop.position.y = 1.7;
    group.add(bodyTop);

    // ---- HEAD ----
    var headGeo = new THREE.BoxGeometry(0.8, 0.7, 0.7);
    // Round edges slightly via segments
    var head = shadow(new THREE.Mesh(headGeo, metalMat(0x363642, 0.8, 0.3)));
    head.position.y = 2.35;
    head.name = 'head';
    group.add(head);

    // ---- EYES (X-shaped, yellow glow) ----
    var leftEye = createXEye(eyeColor, 0.35, 3);
    leftEye.position.set(-0.18, 2.4, 0.36);
    leftEye.name = 'leftEye';
    group.add(leftEye);

    var rightEye = createXEye(eyeColor, 0.35, 3);
    rightEye.position.set(0.18, 2.4, 0.36);
    rightEye.name = 'rightEye';
    group.add(rightEye);

    // ---- HAT / HEADBAND ----
    var hatGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12);
    var hat = shadow(new THREE.Mesh(hatGeo, metalMat(0x5a2a20, 0.5, 0.6)));
    hat.position.y = 2.75;
    hat.name = 'hat';
    group.add(hat);

    // ---- ARMS ----
    // Left arm
    var leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'leftArm';
    leftArmGroup.position.set(-0.8, 1.5, 0);

    var upperArmGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
    var upperArm = shadow(new THREE.Mesh(upperArmGeo, limbMat));
    upperArm.position.y = -0.35;
    leftArmGroup.add(upperArm);

    var foreArmGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.6, 8);
    var foreArm = shadow(new THREE.Mesh(foreArmGeo, limbMat));
    foreArm.position.y = -0.8;
    leftArmGroup.add(foreArm);

    var leftClaw = createClaw(limbMat, 0.4);
    leftClaw.position.y = -1.15;
    leftClaw.name = 'leftClaw';
    leftArmGroup.add(leftClaw);

    group.add(leftArmGroup);

    // Right arm
    var rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'rightArm';
    rightArmGroup.position.set(0.8, 1.5, 0);

    var upperArmR = shadow(new THREE.Mesh(upperArmGeo.clone(), limbMat));
    upperArmR.position.y = -0.35;
    rightArmGroup.add(upperArmR);

    var foreArmR = shadow(new THREE.Mesh(foreArmGeo.clone(), limbMat));
    foreArmR.position.y = -0.8;
    rightArmGroup.add(foreArmR);

    var rightClaw = createClaw(limbMat, 0.4);
    rightClaw.position.y = -1.15;
    rightClaw.name = 'rightClaw';
    rightArmGroup.add(rightClaw);

    group.add(rightArmGroup);

    // ---- LEGS ----
    var leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'leftLeg';
    leftLegGroup.position.set(-0.25, 0.3, 0);

    var legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 8);
    var leftLeg = shadow(new THREE.Mesh(legGeo, limbMat));
    leftLegGroup.add(leftLeg);

    // Foot
    var footGeo = new THREE.BoxGeometry(0.22, 0.08, 0.35);
    var leftFoot = shadow(new THREE.Mesh(footGeo, limbMat));
    leftFoot.position.set(0, -0.34, 0.05);
    leftLegGroup.add(leftFoot);

    group.add(leftLegGroup);

    var rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'rightLeg';
    rightLegGroup.position.set(0.25, 0.3, 0);

    var rightLeg = shadow(new THREE.Mesh(legGeo.clone(), limbMat));
    rightLegGroup.add(rightLeg);

    var rightFoot = shadow(new THREE.Mesh(footGeo.clone(), limbMat));
    rightFoot.position.set(0, -0.34, 0.05);
    rightLegGroup.add(rightFoot);

    group.add(rightLegGroup);

    // ---- WINGS ----
    var wingMat = new THREE.MeshStandardMaterial({
      color: 0x5a5a6a,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    // Left wing (triangle)
    var wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-1.5, 0.8);
    wingShape.lineTo(-0.5, -0.5);
    wingShape.lineTo(0, 0);

    var wingGeo = new THREE.ShapeGeometry(wingShape);

    var leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.3, 1.8, -0.4);
    leftWing.rotation.y = -0.3;
    leftWing.castShadow = true;
    leftWing.name = 'leftWing';
    group.add(leftWing);

    // Right wing (mirrored)
    var wingShapeR = new THREE.Shape();
    wingShapeR.moveTo(0, 0);
    wingShapeR.lineTo(1.5, 0.8);
    wingShapeR.lineTo(0.5, -0.5);
    wingShapeR.lineTo(0, 0);

    var wingGeoR = new THREE.ShapeGeometry(wingShapeR);

    var rightWing = new THREE.Mesh(wingGeoR, wingMat);
    rightWing.position.set(0.3, 1.8, -0.4);
    rightWing.rotation.y = 0.3;
    rightWing.castShadow = true;
    rightWing.name = 'rightWing';
    group.add(rightWing);

    // ---- TAIL ----
    var tailCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.5, -0.4),
      new THREE.Vector3(0, 0.3, -0.9),
      new THREE.Vector3(0, 0.1, -1.4),
      new THREE.Vector3(0, -0.1, -1.8)
    );
    var tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.06, 6, false);
    var tail = shadow(new THREE.Mesh(tailGeo, limbMat));
    tail.name = 'tail';
    group.add(tail);

    return group;
  }


  // =========================================================================
  // V  -  Enemy (Aggressive Murder Drone)
  // =========================================================================
  function createV() {
    var group = new THREE.Group();
    group.name = 'V';

    var bodyColor = 0x2a2a3a;
    var limbColor = 0x222230;
    var eyeColor = 0xFF0000;
    var bodyMat = metalMat(bodyColor, 0.85, 0.25);
    var limbMat = metalMat(limbColor, 0.8, 0.3);

    // ---- BODY (slightly more angular) ----
    var bodyGeo = new THREE.CylinderGeometry(0.55, 0.6, 1.5, 8); // fewer segments = more angular
    var body = shadow(new THREE.Mesh(bodyGeo, bodyMat));
    body.position.y = 1.05;
    body.name = 'body';
    group.add(body);

    var bodyTopGeo = new THREE.SphereGeometry(0.55, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    var bodyTop = shadow(new THREE.Mesh(bodyTopGeo, bodyMat));
    bodyTop.position.y = 1.8;
    group.add(bodyTop);

    // ---- HEAD (visor-like: wider, flatter) ----
    var headGeo = new THREE.BoxGeometry(0.95, 0.55, 0.65);
    var head = shadow(new THREE.Mesh(headGeo, metalMat(0x2a2a38, 0.85, 0.25)));
    head.position.y = 2.35;
    head.name = 'head';
    group.add(head);

    // ---- HAIR SPIKES (3 thin cones on head) ----
    var spikeMat = metalMat(0x222230, 0.85, 0.25);
    var spikePositions = [
      { x: -0.2, rz:  0.3 },
      { x:  0.0, rz:  0.0 },
      { x:  0.2, rz: -0.3 }
    ];
    for (var s = 0; s < spikePositions.length; s++) {
      var spikeGeo = new THREE.ConeGeometry(0.06, 0.5, 6);
      var spike = shadow(new THREE.Mesh(spikeGeo, spikeMat));
      spike.position.set(spikePositions[s].x, 2.85, -0.1);
      spike.rotation.z = spikePositions[s].rz;
      spike.name = 'spike_' + s;
      group.add(spike);
    }

    // ---- EYES (X-shaped, RED glow) ----
    var leftEye = createXEye(eyeColor, 0.35, 3.5);
    leftEye.position.set(-0.22, 2.4, 0.33);
    leftEye.name = 'leftEye';
    group.add(leftEye);

    var rightEye = createXEye(eyeColor, 0.35, 3.5);
    rightEye.position.set(0.22, 2.4, 0.33);
    rightEye.name = 'rightEye';
    group.add(rightEye);

    // ---- ARMS (sharper claws) ----
    var leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'leftArm';
    leftArmGroup.position.set(-0.85, 1.55, 0);

    var upperArmGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.75, 8);
    var upperArm = shadow(new THREE.Mesh(upperArmGeo, limbMat));
    upperArm.position.y = -0.375;
    leftArmGroup.add(upperArm);

    var foreArmGeo = new THREE.CylinderGeometry(0.09, 0.07, 0.65, 8);
    var foreArm = shadow(new THREE.Mesh(foreArmGeo, limbMat));
    foreArm.position.y = -0.85;
    leftArmGroup.add(foreArm);

    // Longer, sharper claws (elongated cones)
    var leftClaw = createSharpClaw(limbMat, 0.6);
    leftClaw.position.y = -1.25;
    leftClaw.name = 'leftClaw';
    leftArmGroup.add(leftClaw);

    group.add(leftArmGroup);

    var rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'rightArm';
    rightArmGroup.position.set(0.85, 1.55, 0);

    var upperArmR = shadow(new THREE.Mesh(upperArmGeo.clone(), limbMat));
    upperArmR.position.y = -0.375;
    rightArmGroup.add(upperArmR);

    var foreArmR = shadow(new THREE.Mesh(foreArmGeo.clone(), limbMat));
    foreArmR.position.y = -0.85;
    rightArmGroup.add(foreArmR);

    var rightClaw = createSharpClaw(limbMat, 0.6);
    rightClaw.position.y = -1.25;
    rightClaw.name = 'rightClaw';
    rightArmGroup.add(rightClaw);

    group.add(rightArmGroup);

    // ---- LEGS ----
    var legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 8);
    var footGeo = new THREE.BoxGeometry(0.22, 0.08, 0.35);

    var leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'leftLeg';
    leftLegGroup.position.set(-0.25, 0.3, 0);
    leftLegGroup.add(shadow(new THREE.Mesh(legGeo, limbMat)));
    var lf = shadow(new THREE.Mesh(footGeo, limbMat));
    lf.position.set(0, -0.34, 0.05);
    leftLegGroup.add(lf);
    group.add(leftLegGroup);

    var rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'rightLeg';
    rightLegGroup.position.set(0.25, 0.3, 0);
    rightLegGroup.add(shadow(new THREE.Mesh(legGeo.clone(), limbMat)));
    var rf = shadow(new THREE.Mesh(footGeo.clone(), limbMat));
    rf.position.set(0, -0.34, 0.05);
    rightLegGroup.add(rf);
    group.add(rightLegGroup);

    // ---- WINGS ----
    var wingMat_ = new THREE.MeshStandardMaterial({
      color: 0x4a4a5a,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });

    var wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-1.6, 0.9);
    wingShape.lineTo(-0.6, -0.6);
    wingShape.lineTo(0, 0);

    var leftWing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat_);
    leftWing.position.set(-0.3, 1.85, -0.4);
    leftWing.rotation.y = -0.3;
    leftWing.castShadow = true;
    leftWing.name = 'leftWing';
    group.add(leftWing);

    var wingShapeR = new THREE.Shape();
    wingShapeR.moveTo(0, 0);
    wingShapeR.lineTo(1.6, 0.9);
    wingShapeR.lineTo(0.6, -0.6);
    wingShapeR.lineTo(0, 0);

    var rightWing = new THREE.Mesh(new THREE.ShapeGeometry(wingShapeR), wingMat_);
    rightWing.position.set(0.3, 1.85, -0.4);
    rightWing.rotation.y = 0.3;
    rightWing.castShadow = true;
    rightWing.name = 'rightWing';
    group.add(rightWing);

    // ---- TAIL ----
    var tailCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.5, -0.4),
      new THREE.Vector3(0, 0.3, -1.0),
      new THREE.Vector3(0, 0.15, -1.5),
      new THREE.Vector3(0, -0.05, -1.9)
    );
    var tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.06, 6, false);
    var tail = shadow(new THREE.Mesh(tailGeo, limbMat));
    tail.name = 'tail';
    group.add(tail);

    return group;
  }

  /**
   * Sharp claw for V (elongated cones, more menacing).
   */
  function createSharpClaw(mat, fingerLen) {
    if (fingerLen === undefined) fingerLen = 0.6;
    var hand = new THREE.Group();
    hand.name = 'claw';

    var palmGeo = new THREE.SphereGeometry(0.14, 8, 6);
    hand.add(shadow(new THREE.Mesh(palmGeo, mat)));

    var angles = [-0.5, 0, 0.5];
    for (var i = 0; i < 3; i++) {
      var fGeo = new THREE.ConeGeometry(0.04, fingerLen, 6);
      var finger = shadow(new THREE.Mesh(fGeo, mat));
      finger.position.set(Math.sin(angles[i]) * 0.1, -fingerLen / 2, 0);
      finger.rotation.z = angles[i] * 0.6;
      hand.add(finger);
    }

    return hand;
  }


  // =========================================================================
  // J  -  Boss (Leader Murder Drone)
  // =========================================================================
  function createJ() {
    var group = new THREE.Group();
    group.name = 'J';

    var bodyColor = 0x4a4a5a;
    var limbColor = 0x3a3a48;
    var eyeColor = 0xFFD700;
    var accentColor = 0xBFA33A;
    // Higher metalness for polished look
    var bodyMat = metalMat(bodyColor, 0.9, 0.2);
    var limbMat = metalMat(limbColor, 0.85, 0.25);
    var accentMat = metalMat(accentColor, 0.9, 0.15);

    // ---- BODY (smooth capsule, 1.5x scale) ----
    var bodyGeo = new THREE.CylinderGeometry(0.65, 0.6, 1.5, 16);
    var body = shadow(new THREE.Mesh(bodyGeo, bodyMat));
    body.position.y = 1.05;
    body.name = 'body';
    group.add(body);

    var bodyTopGeo = new THREE.SphereGeometry(0.65, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    var bodyTop = shadow(new THREE.Mesh(bodyTopGeo, bodyMat));
    bodyTop.position.y = 1.8;
    group.add(bodyTop);

    // ---- HEAD (sleek, smooth) ----
    var headGeo = new THREE.BoxGeometry(0.85, 0.7, 0.7);
    var head = shadow(new THREE.Mesh(headGeo, metalMat(0x454552, 0.9, 0.2)));
    head.position.y = 2.4;
    head.name = 'head';
    group.add(head);

    // ---- EYES (X-shaped, YELLOW glow, slightly larger) ----
    var leftEye = createXEye(eyeColor, 0.4, 3);
    leftEye.position.set(-0.2, 2.45, 0.36);
    leftEye.name = 'leftEye';
    group.add(leftEye);

    var rightEye = createXEye(eyeColor, 0.4, 3);
    rightEye.position.set(0.2, 2.45, 0.36);
    rightEye.name = 'rightEye';
    group.add(rightEye);

    // ---- SHOULDER PADS (gold-accented flat boxes) ----
    var shoulderGeo = new THREE.BoxGeometry(0.5, 0.12, 0.4);
    var leftShoulder = shadow(new THREE.Mesh(shoulderGeo, accentMat));
    leftShoulder.position.set(-0.9, 1.75, 0);
    leftShoulder.name = 'leftShoulder';
    group.add(leftShoulder);

    var rightShoulder = shadow(new THREE.Mesh(shoulderGeo.clone(), accentMat));
    rightShoulder.position.set(0.9, 1.75, 0);
    rightShoulder.name = 'rightShoulder';
    group.add(rightShoulder);

    // ---- CAPE / BACK PANEL ----
    var capeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a48,
      metalness: 0.7,
      roughness: 0.35,
      side: THREE.DoubleSide
    });
    var capeGeo = new THREE.BoxGeometry(1.4, 1.8, 0.06);
    var cape = shadow(new THREE.Mesh(capeGeo, capeMat));
    cape.position.set(0, 1.2, -0.5);
    cape.name = 'cape';
    group.add(cape);

    // Gold trim on cape edge
    var trimGeo = new THREE.BoxGeometry(1.45, 0.06, 0.08);
    var capeTrim = shadow(new THREE.Mesh(trimGeo, accentMat));
    capeTrim.position.set(0, 0.32, -0.5);
    group.add(capeTrim);

    // ---- ARMS ----
    var leftArmGroup = new THREE.Group();
    leftArmGroup.name = 'leftArm';
    leftArmGroup.position.set(-0.85, 1.55, 0);

    var upperArmGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.75, 10);
    leftArmGroup.add(shadow(new THREE.Mesh(upperArmGeo, limbMat)));
    leftArmGroup.children[0].position.y = -0.375;

    var foreArmGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.65, 10);
    var foreArmL = shadow(new THREE.Mesh(foreArmGeo, limbMat));
    foreArmL.position.y = -0.85;
    leftArmGroup.add(foreArmL);

    var leftClaw = createClaw(limbMat, 0.45);
    leftClaw.position.y = -1.2;
    leftClaw.name = 'leftClaw';
    leftArmGroup.add(leftClaw);

    group.add(leftArmGroup);

    var rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'rightArm';
    rightArmGroup.position.set(0.85, 1.55, 0);

    rightArmGroup.add(shadow(new THREE.Mesh(upperArmGeo.clone(), limbMat)));
    rightArmGroup.children[0].position.y = -0.375;

    var foreArmR = shadow(new THREE.Mesh(foreArmGeo.clone(), limbMat));
    foreArmR.position.y = -0.85;
    rightArmGroup.add(foreArmR);

    var rightClaw = createClaw(limbMat, 0.45);
    rightClaw.position.y = -1.2;
    rightClaw.name = 'rightClaw';
    rightArmGroup.add(rightClaw);

    group.add(rightArmGroup);

    // ---- LEGS ----
    var legGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.65, 10);
    var footGeo = new THREE.BoxGeometry(0.24, 0.08, 0.38);

    var leftLegGroup = new THREE.Group();
    leftLegGroup.name = 'leftLeg';
    leftLegGroup.position.set(-0.28, 0.3, 0);
    leftLegGroup.add(shadow(new THREE.Mesh(legGeo, limbMat)));
    var lfJ = shadow(new THREE.Mesh(footGeo, limbMat));
    lfJ.position.set(0, -0.37, 0.05);
    leftLegGroup.add(lfJ);
    group.add(leftLegGroup);

    var rightLegGroup = new THREE.Group();
    rightLegGroup.name = 'rightLeg';
    rightLegGroup.position.set(0.28, 0.3, 0);
    rightLegGroup.add(shadow(new THREE.Mesh(legGeo.clone(), limbMat)));
    var rfJ = shadow(new THREE.Mesh(footGeo.clone(), limbMat));
    rfJ.position.set(0, -0.37, 0.05);
    rightLegGroup.add(rfJ);
    group.add(rightLegGroup);

    // ---- WINGS (larger for boss) ----
    var wingMat_ = new THREE.MeshStandardMaterial({
      color: 0x5a5a6a,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    var wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(-1.8, 1.0);
    wingShape.lineTo(-0.6, -0.6);
    wingShape.lineTo(0, 0);

    var leftWing = new THREE.Mesh(new THREE.ShapeGeometry(wingShape), wingMat_);
    leftWing.position.set(-0.35, 1.9, -0.55);
    leftWing.rotation.y = -0.3;
    leftWing.castShadow = true;
    leftWing.name = 'leftWing';
    group.add(leftWing);

    var wingShapeR = new THREE.Shape();
    wingShapeR.moveTo(0, 0);
    wingShapeR.lineTo(1.8, 1.0);
    wingShapeR.lineTo(0.6, -0.6);
    wingShapeR.lineTo(0, 0);

    var rightWing = new THREE.Mesh(new THREE.ShapeGeometry(wingShapeR), wingMat_);
    rightWing.position.set(0.35, 1.9, -0.55);
    rightWing.rotation.y = 0.3;
    rightWing.castShadow = true;
    rightWing.name = 'rightWing';
    group.add(rightWing);

    // ---- TAIL ----
    var tailCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0.5, -0.5),
      new THREE.Vector3(0, 0.3, -1.1),
      new THREE.Vector3(0, 0.1, -1.6),
      new THREE.Vector3(0, -0.1, -2.0)
    );
    var tailGeo = new THREE.TubeGeometry(tailCurve, 12, 0.07, 6, false);
    var tail = shadow(new THREE.Mesh(tailGeo, limbMat));
    tail.name = 'tail';
    group.add(tail);

    // Scale up 1.5x for boss size
    group.scale.set(1.5, 1.5, 1.5);

    return group;
  }


  // =========================================================================
  // SENTINEL DRONE  -  Minion
  // =========================================================================
  function createSentinel() {
    var group = new THREE.Group();
    group.name = 'Sentinel';

    var bodyColor = 0x1a1a2a;
    var bodyMat = metalMat(bodyColor, 0.85, 0.25);

    // ---- MAIN BODY (floating sphere) ----
    var sphereGeo = new THREE.SphereGeometry(0.8, 16, 12);
    var sphere = shadow(new THREE.Mesh(sphereGeo, bodyMat));
    sphere.name = 'body';
    group.add(sphere);

    // ---- SINGLE RED EYE (sphere, emissive) ----
    var eyeMat = glowMat(0xFF0000, 3);
    var eyeGeo = new THREE.SphereGeometry(0.2, 12, 8);
    var eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0.05, 0.72);
    eye.name = 'eye';
    group.add(eye);

    // Eye lens ring
    var lensGeo = new THREE.TorusGeometry(0.22, 0.03, 8, 16);
    var lensMat = metalMat(0x2a2a3a, 0.9, 0.2);
    var lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 0.05, 0.73);
    group.add(lens);

    // ---- WING FINS (flat boxes on sides) ----
    var finMat = metalMat(0x222235, 0.85, 0.3);

    var finGeo = new THREE.BoxGeometry(0.6, 0.4, 0.06);

    var leftFin = shadow(new THREE.Mesh(finGeo, finMat));
    leftFin.position.set(-0.95, 0, 0);
    leftFin.rotation.z = 0.2;
    leftFin.name = 'leftFin';
    group.add(leftFin);

    var rightFin = shadow(new THREE.Mesh(finGeo.clone(), finMat));
    rightFin.position.set(0.95, 0, 0);
    rightFin.rotation.z = -0.2;
    rightFin.name = 'rightFin';
    group.add(rightFin);

    // ---- ANTENNA (thin cylinder + small sphere) ----
    var antennaMat = metalMat(0x2a2a3a, 0.8, 0.3);
    var antennaGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6);
    var antenna = shadow(new THREE.Mesh(antennaGeo, antennaMat));
    antenna.position.set(0, 1.0, 0);
    antenna.name = 'antenna';
    group.add(antenna);

    var antennaTipGeo = new THREE.SphereGeometry(0.06, 8, 6);
    var antennaTipMat = glowMat(0xFF3333, 2);
    var antennaTip = new THREE.Mesh(antennaTipGeo, antennaTipMat);
    antennaTip.position.set(0, 1.35, 0);
    antennaTip.name = 'antennaTip';
    group.add(antennaTip);

    // ---- Store base Y for hover animation ----
    group.userData.hoverBaseY = 0;
    group.userData.hoverTime = Math.random() * Math.PI * 2; // random phase
    group.userData.hoverSpeed = 1.5 + Math.random() * 0.5;
    group.userData.hoverAmplitude = 0.15 + Math.random() * 0.1;

    // Position above ground (floating)
    group.position.y = 2;

    return group;
  }


  // =========================================================================
  // PUBLIC API
  // =========================================================================
  window.CharacterFactory = {
    loadOrGenerate: function(name, generateFn) {
        var group = new THREE.Group();
        group.name = name;
        group.characterName = name;
        
        if (!THREE.GLTFLoader) {
             var fallback = generateFn();
             if (fallback.userData) group.userData = fallback.userData;
             while(fallback.children.length > 0) group.add(fallback.children[0]);
             return group;
        }

        var loader = new THREE.GLTFLoader();
        loader.load('models/' + name.toLowerCase() + '.glb', function (gltf) {
            var model = gltf.scene;
            if (gltf.animations && gltf.animations.length > 0) {
                group.mixer = new THREE.AnimationMixer(model);
                group.animations = gltf.animations;
                group.mixer.clipAction(gltf.animations[0]).play();
            }
            model.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            // If the model is too big/small, we assume the user provides a scaled model
            // But just in case, we can ensure it's positioned correctly
            group.add(model);
            group.isLoadedModel = true;
        }, undefined, function (error) {
            // Fallback
            var fallback = generateFn();
            if (fallback.userData) group.userData = fallback.userData;
            while(fallback.children.length > 0) group.add(fallback.children[0]);
        });
        
        return group;
    },
    createN: function() { return window.CharacterFactory.loadOrGenerate('N', createN); },
    createV: function() { return window.CharacterFactory.loadOrGenerate('V', createV); },
    createJ: function() { return window.CharacterFactory.loadOrGenerate('J', createJ); },
    createSentinel: function() { return window.CharacterFactory.loadOrGenerate('Sentinel', createSentinel); }
  };

})();
