import * as THREE from 'three';
import { getFruitGeometry } from '../utils/fruitGeometry.js';
import { FRUIT_COLORS, FRUIT_SCALES } from '../constants/fruits.js';
import { Gem3D } from './Gem3D.js';

export class Fruit3D {
  constructor(type, x, scene, gameManager) {
    this.type = type;
    this.x = x;
    this.y = window.innerHeight;
    this.z = 0;
    this.sliced = false;
    this.scene = scene;
    this.gameManager = gameManager;
    this.createMesh();
    this.velocity = {
      y: -2, // Slower falling speed
      rotation: 0.01 // Slower rotation
    };
  }

  createMesh() {
    const geometry = getFruitGeometry(this.type);
    
    // Create materials for outside and inside of fruit
    const outsideMaterial = new THREE.MeshPhongMaterial({ 
      color: FRUIT_COLORS[this.type],
      shininess: 100,
      specular: 0x444444,
      map: this.createFruitTexture(),
      bumpMap: this.createFruitBumpMap(),
      bumpScale: 0.05
    });
    
    this.mesh = new THREE.Mesh(geometry, outsideMaterial);
    this.mesh.scale.multiplyScalar(FRUIT_SCALES[this.type]);
    this.mesh.position.set(this.x, -this.y + window.innerHeight / 2, this.z);
    this.scene.add(this.mesh);
  }

  createFruitTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create base color
    ctx.fillStyle = `#${FRUIT_COLORS[this.type].toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 512, 512);

    // Add texture details based on fruit type
    switch (this.type) {
      case '🍎': // Apple
        this.createAppleTexture(ctx);
        break;
      case '🍊': // Orange
        this.createOrangeTexture(ctx);
        break;
      case '🍉': // Watermelon
        this.createWatermelonTexture(ctx);
        break;
      // Add more fruit-specific textures as needed
    }

    return new THREE.CanvasTexture(canvas);
  }

  createFruitBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create bump map based on fruit type
    switch (this.type) {
      case '🍊': // Orange
        this.createOrangeBumpMap(ctx);
        break;
      case '🍎': // Apple
        this.createAppleBumpMap(ctx);
        break;
      default:
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 512, 512);
    }

    return new THREE.CanvasTexture(canvas);
  }

  createAppleTexture(ctx) {
    // Add subtle color variations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 20 + 10;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, 0.1)`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createOrangeTexture(ctx) {
    // Create dimpled texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 5 + 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createWatermelonTexture(ctx) {
    // Create stripes
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#2d5a27' : '#1e3d1a';
      ctx.fillRect(i * 51.2, 0, 51.2, 512);
    }
  }

  createOrangeBumpMap(ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    
    // Create dimpled surface
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 5 + 2;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, '#808080');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createAppleBumpMap(ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    
    // Create subtle surface variations
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 20 + 10;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, '#a0a0a0');
      gradient.addColorStop(1, '#808080');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getInsideColor() {
    switch (this.type) {
      case '🍎': // Apple
        return 0xFFF4E0; // Creamy white
      case '🍊': // Orange
        return 0xFFA500; // Orange pulp
      case '🍐': // Pear
        return 0xFFFDD0; // Cream
      case '🍌': // Banana
        return 0xFFFACD; // Light yellow
      case '🍉': // Watermelon
        return 0xFF6B6B; // Pink red
      case '🍇': // Grape
        return 0x9370DB; // Purple
      default:
        return 0xFFFFFF;
    }
  }

  update() {
    if (!this.sliced) {
      this.y += this.velocity.y;
      this.mesh.position.y = -this.y + window.innerHeight / 2;
      this.mesh.rotation.x += this.velocity.rotation;
      this.mesh.rotation.y += this.velocity.rotation;
    }
  }

  slice() {
    if (!this.sliced) {
      this.sliced = true;
      this.createSlicingEffect();
      
      // Increase player's score and gems by 1
      if (this.gameManager && this.gameManager.player) {
        this.gameManager.player.score++;
        this.gameManager.player.gems++;
        this.gameManager.updateUI();
        
        // Show floating text for score and gem
        const screenPosition = this.mesh.position.clone();
        screenPosition.project(this.gameManager.camera);
        
        const x = (screenPosition.x + 1) * window.innerWidth / 2;
        const y = (-screenPosition.y + 1) * window.innerHeight / 2;
        
        // Show happy emojis for score and gem
        this.gameManager.showFloatingText('⭐', x - 20, y, '#FF4444');
        this.gameManager.showFloatingText('💎', x + 20, y, '#FFD700');
      }
      
      return true;
    }
    return false;
  }

  createSlicingEffect() {
    // Get the current position and rotation
    const position = this.mesh.position.clone();
    const rotation = this.mesh.rotation.clone();
    const scale = this.mesh.scale.clone();
    
    // Remove the original mesh
    this.scene.remove(this.mesh);
    
    // Create materials
    const outsideMaterial = new THREE.MeshPhongMaterial({ 
      color: FRUIT_COLORS[this.type],
      shininess: 100,
      specular: 0x444444,
      map: this.createFruitTexture(),
      bumpMap: this.createFruitBumpMap(),
      bumpScale: 0.05
    });
    
    const insideColor = this.getInsideColor();
    const insideMaterial = new THREE.MeshPhongMaterial({
      color: insideColor,
      shininess: 30,
      specular: 0x222222,
      map: this.createInsideTexture()
    });

    // Create the base geometry
    const geometry = getFruitGeometry(this.type);
    const sliceAngle = Math.random() * Math.PI / 4 - Math.PI / 8; // Random angle for variety

    // Create the two halves
    const half1 = new THREE.Mesh(geometry.clone(), outsideMaterial);
    const half2 = new THREE.Mesh(geometry.clone(), outsideMaterial);

    // Position and rotate the halves
    half1.position.copy(position);
    half2.position.copy(position);
    half1.rotation.copy(rotation);
    half2.rotation.copy(rotation);
    half1.scale.copy(scale);
    half2.scale.copy(scale);

    // Apply separation
    const separationDistance = 1.0;
    const sliceDirection = new THREE.Vector3(
      Math.sin(sliceAngle),
      Math.cos(sliceAngle),
      0
    ).normalize();

    half1.position.add(sliceDirection.clone().multiplyScalar(separationDistance/2));
    half2.position.sub(sliceDirection.clone().multiplyScalar(separationDistance/2));
    half2.rotation.x += Math.PI; // Flip the second half

    // Add physics with more dramatic movement
    const force = 8;
    half1.velocity = {
      x: Math.random() * force - force/2,
      y: Math.random() * force/2,
      z: Math.random() * force - force/2,
      rotX: Math.random() * 0.4 - 0.2,
      rotY: Math.random() * 0.4 - 0.2,
      rotZ: Math.random() * 0.4 - 0.2
    };

    half2.velocity = {
      x: -half1.velocity.x,
      y: Math.random() * force/2,
      z: -half1.velocity.z,
      rotX: -half1.velocity.rotX,
      rotY: -half1.velocity.rotY,
      rotZ: -half1.velocity.rotZ
    };

    this.scene.add(half1);
    this.scene.add(half2);

    // Create visual effects
    this.createJuiceParticles(position);
    this.createSlicingTrail(position, sliceAngle);
    this.createSliceFlash(position, sliceAngle);

    // Create a gem at the slice position
    const gem = new Gem3D(position.clone(), this.scene, 1);
    gem.mesh.position.z = 0; // Ensure gem is visible at same depth as fruit

    // Animate the halves
    const animateHalves = () => {
      if (half1.position.y > -1000) {
        // Update positions with smooth easing
        half1.position.x += half1.velocity.x * 0.98;
        half1.position.y += half1.velocity.y;
        half1.position.z += half1.velocity.z * 0.98;
        half2.position.x += half2.velocity.x * 0.98;
        half2.position.y += half2.velocity.y;
        half2.position.z += half2.velocity.z * 0.98;

        // Update rotations with smooth easing
        half1.rotation.x += half1.velocity.rotX * 0.98;
        half1.rotation.y += half1.velocity.rotY * 0.98;
        half1.rotation.z += half1.velocity.rotZ * 0.98;
        half2.rotation.x += half2.velocity.rotX * 0.98;
        half2.rotation.y += half2.velocity.rotY * 0.98;
        half2.rotation.z += half2.velocity.rotZ * 0.98;

        // Apply gravity with smoother fall
        half1.velocity.y -= 0.15;
        half2.velocity.y -= 0.15;

        requestAnimationFrame(animateHalves);
      } else {
        this.scene.remove(half1);
        this.scene.remove(half2);
      }
    };

    animateHalves();
  }

  createSliceFlash(position, angle) {
    // Create a flash effect at the slice point
    const flashGeometry = new THREE.PlaneGeometry(2, 0.1);
    flashGeometry.rotateZ(angle);
    
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    
    this.scene.add(flash);
    
    // Animate the flash
    let scale = 0;
    const animateFlash = () => {
      if (flash.material.opacity > 0) {
        scale += 0.2;
        flash.scale.set(1, scale, 1);
        flash.material.opacity *= 0.9;
        requestAnimationFrame(animateFlash);
      } else {
        this.scene.remove(flash);
      }
    };
    
    animateFlash();
  }

  createInsideTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create base inside color
    ctx.fillStyle = `#${this.getInsideColor().toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 512, 512);

    // Add texture details based on fruit type
    switch (this.type) {
      case '🍉': // Watermelon
        this.createWatermelonInsideTexture(ctx);
        break;
      case '🍎': // Apple
        this.createAppleInsideTexture(ctx);
        break;
      case '🍊': // Orange
        this.createOrangeInsideTexture(ctx);
        break;
    }

    return new THREE.CanvasTexture(canvas);
  }

  createWatermelonInsideTexture(ctx) {
    // Add seeds
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = '#352317';
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 4, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createAppleInsideTexture(ctx) {
    // Add subtle flesh texture
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = 'rgba(255, 244, 224, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  createOrangeInsideTexture(ctx) {
    // Add segment lines
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(256, 256);
      ctx.lineTo(
        256 + Math.cos(angle) * 256,
        256 + Math.sin(angle) * 256
      );
      ctx.stroke();
    }
  }

  createSlicingTrail(position, angle) {
    // Create a more dramatic slice trail
    const trailCount = 20;
    const trailGeometry = new THREE.PlaneGeometry(0.1, 2);
    trailGeometry.rotateZ(angle);
    
    const trailMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < trailCount; i++) {
      const trail = new THREE.Mesh(trailGeometry.clone(), trailMaterial.clone());
      trail.position.copy(position);
      
      // Spread trails slightly
      const spread = 0.5;
      trail.position.x += (Math.random() - 0.5) * spread;
      trail.position.y += (Math.random() - 0.5) * spread;
      trail.position.z += (Math.random() - 0.5) * spread;
      
      this.scene.add(trail);
      
      // Animate each trail piece
      let scale = Math.random() * 0.5 + 0.5;
      const animateTrail = () => {
        if (trail.material.opacity > 0) {
          scale *= 0.95;
          trail.scale.set(scale, scale, scale);
          trail.material.opacity *= 0.9;
          requestAnimationFrame(animateTrail);
        } else {
          this.scene.remove(trail);
        }
      };
      
      animateTrail();
    }
  }

  createJuiceParticles(position) {
    const particleCount = 20;
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshPhongMaterial({
      color: this.getInsideColor(),
      transparent: true,
      opacity: 0.6,
      shininess: 30,
      specular: 0x222222
    });
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      
      // Random velocity
      particle.velocity = {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2,
        z: Math.random() * 2 - 1
      };
      
      this.scene.add(particle);
      
      // Animate particle
      const animateParticle = () => {
        if (particle.position.y > -1000) {
          particle.position.x += particle.velocity.x;
          particle.position.y += particle.velocity.y;
          particle.position.z += particle.velocity.z;
          
          // Apply gravity
          particle.velocity.y -= 0.1;
          
          // Fade out
          particle.material.opacity *= 0.95;
          
          requestAnimationFrame(animateParticle);
        } else {
          this.scene.remove(particle);
        }
      };
      
      animateParticle();
    }
  }

  isOffScreen() {
    return this.y < -50;
  }

  remove() {
    this.scene.remove(this.mesh);
  }
}