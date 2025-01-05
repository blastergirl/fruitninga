import * as THREE from 'three';

export class Gem3D {
  constructor(position, scene, value = 1) {
    this.scene = scene;
    this.value = value;
    this.createMesh(position);
    this.velocity = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 3 + 2, // Initial upward velocity
      z: Math.random() * 2 - 1,
      rotX: Math.random() * 0.1,
      rotY: Math.random() * 0.1,
      rotZ: Math.random() * 0.1
    };
  }

  createMesh(position) {
    // Create gem geometry (diamond shape)
    const geometry = new THREE.BufferGeometry();
    
    // Define vertices for a diamond shape
    const vertices = new Float32Array([
      // Top pyramid
       0.0,  1.0,  0.0,  // top
      -0.5,  0.0, -0.5,  // front left
       0.5,  0.0, -0.5,  // front right
       0.5,  0.0,  0.5,  // back right
      -0.5,  0.0,  0.5,  // back left
      // Bottom pyramid
       0.0, -1.0,  0.0,  // bottom
      -0.5,  0.0, -0.5,  // front left
       0.5,  0.0, -0.5,  // front right
       0.5,  0.0,  0.5,  // back right
      -0.5,  0.0,  0.5   // back left
    ]);

    // Define faces (triangles)
    const indices = new Uint16Array([
      // Top pyramid
      0, 1, 2,  // front
      0, 2, 3,  // right
      0, 3, 4,  // back
      0, 4, 1,  // left
      // Bottom pyramid
      5, 7, 6,  // front
      5, 8, 7,  // right
      5, 9, 8,  // back
      5, 6, 9,  // left
      // Middle band
      1, 6, 2,  // front
      2, 7, 3,  // right
      3, 8, 4,  // back
      4, 9, 1   // left
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();

    // Create gem material with shiny, crystalline appearance
    const material = new THREE.MeshPhongMaterial({
      color: this.getGemColor(),
      shininess: 100,
      specular: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.multiplyScalar(0.3); // Scale down the gem
    this.mesh.position.copy(position);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.getGemColor(),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.mesh.add(this.glow);

    this.scene.add(this.mesh);
  }

  getGemColor() {
    // Different colors for different values
    switch(this.value) {
      case 1:
        return 0x00ff00; // Green for 1
      case 2:
        return 0x0000ff; // Blue for 2
      case 3:
        return 0xff0000; // Red for 3
      default:
        return 0xffff00; // Yellow for other values
    }
  }

  update() {
    // Update position
    this.mesh.position.x += this.velocity.x * 0.98;
    this.mesh.position.y += this.velocity.y;
    this.mesh.position.z += this.velocity.z * 0.98;

    // Update rotation
    this.mesh.rotation.x += this.velocity.rotX;
    this.mesh.rotation.y += this.velocity.rotY;
    this.mesh.rotation.z += this.velocity.rotZ;

    // Apply gravity
    this.velocity.y -= 0.15;

    // Update glow
    this.glow.material.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;

    // Check if gem should be removed
    if (this.mesh.position.y < -20) {
      this.remove();
      return false;
    }
    return true;
  }

  remove() {
    this.scene.remove(this.mesh);
  }

  isCollectedBy(position, radius = 2) {
    const distance = this.mesh.position.distanceTo(position);
    return distance < radius;
  }
} 