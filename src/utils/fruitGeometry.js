import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function getFruitGeometry(type) {
  switch (type) {
    case '🍎': // Apple
      return createAppleGeometry();
    
    case '🍊': // Orange
      return createOrangeGeometry();
    
    case '🍐': // Pear
      return createPearGeometry();
    
    case '🍌': // Banana
      return createBananaGeometry();
    
    case '🍉': // Watermelon
      return createWatermelonGeometry();
    
    case '🍇': // Grape
      return createGrapeGeometry();
    
    default:
      return new THREE.SphereGeometry(1, 32, 32);
  }
}

function createAppleGeometry() {
  const geometries = [];
  
  // Main apple body
  geometries.push(new THREE.SphereGeometry(1, 32, 32));
  
  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
  stemGeometry.translate(0, 1.1, 0);
  geometries.push(stemGeometry);
  
  // Leaf
  const leafGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.4);
  leafGeometry.translate(0.1, 1.1, 0.1);
  leafGeometry.rotateZ(Math.PI / 4);
  geometries.push(leafGeometry);
  
  return mergeGeometries(geometries);
}

function createOrangeGeometry() {
  const geometries = [];
  
  // Main orange body
  geometries.push(new THREE.SphereGeometry(1, 32, 32));
  
  // Add surface bumps for texture
  const bumpCount = 50;
  for (let i = 0; i < bumpCount; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const bumpGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    bumpGeometry.translate(x, y, z);
    geometries.push(bumpGeometry);
  }
  
  return mergeGeometries(geometries);
}

function createPearGeometry() {
  const geometries = [];
  
  // Create pear shape using lathe geometry
  const points = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const radius = 0.3 + Math.sin(t * Math.PI) * 0.7;
    points.push(new THREE.Vector2(radius, t * 2 - 1));
  }
  geometries.push(new THREE.LatheGeometry(points, 32));
  
  // Add stem
  const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
  stemGeometry.translate(0, 1.1, 0);
  geometries.push(stemGeometry);
  
  return mergeGeometries(geometries);
}

function createBananaGeometry() {
  const geometries = [];
  
  // Create curved banana shape using tube geometry with better curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.3, 0.3, 0),
    new THREE.Vector3(0.6, 0.5, 0),
    new THREE.Vector3(1.0, 0.6, 0),
    new THREE.Vector3(1.4, 0.5, 0),
    new THREE.Vector3(1.7, 0.3, 0),
  ]);
  
  // Create main banana body with oval cross-section
  const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.15, 8, false);
  
  // Scale the geometry to make it more oval in cross-section
  tubeGeometry.scale(1, 0.7, 0.8);
  geometries.push(tubeGeometry);
  
  // Add ends (caps) to make it look more like a banana
  const endRadius = 0.15;
  const endGeometry1 = new THREE.SphereGeometry(endRadius, 8, 8);
  endGeometry1.translate(0, 0, 0);
  endGeometry1.scale(1, 0.7, 0.8);
  
  const endGeometry2 = new THREE.SphereGeometry(endRadius * 0.7, 8, 8);
  endGeometry2.translate(1.7, 0.3, 0);
  endGeometry2.scale(1, 0.7, 0.8);
  
  geometries.push(endGeometry1, endGeometry2);
  
  // Add stem at the end
  const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 8);
  stemGeometry.translate(1.8, 0.4, 0);
  stemGeometry.rotateZ(Math.PI / 4);
  geometries.push(stemGeometry);
  
  return mergeGeometries(geometries);
}

function createWatermelonGeometry() {
  const geometries = [];
  
  // Create watermelon shape (partial sphere)
  geometries.push(new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.7));
  
  // Add stripes
  const stripeCount = 8;
  for (let i = 0; i < stripeCount; i++) {
    const angle = (i / stripeCount) * Math.PI * 2;
    const stripeGeometry = new THREE.BoxGeometry(0.1, 2, 0.01);
    stripeGeometry.rotateX(Math.PI / 2);
    stripeGeometry.rotateY(angle);
    geometries.push(stripeGeometry);
  }
  
  return mergeGeometries(geometries);
}

function createGrapeGeometry() {
  const geometries = [];
  
  // Main grape (center)
  const mainGrapeSize = 0.5; // Increased from 0.2
  geometries.push(new THREE.SphereGeometry(mainGrapeSize, 16, 16));
  
  // Create grape cluster
  const grapeCount = 8; // Increased from 6
  const radius = 0.8; // Increased from 0.3
  const layerCount = 2; // Add multiple layers
  
  for (let layer = 0; layer < layerCount; layer++) {
    for (let i = 0; i < grapeCount; i++) {
      const angle = (i / grapeCount) * Math.PI * 2;
      const grapeGeometry = new THREE.SphereGeometry(mainGrapeSize, 16, 16);
      
      // Position grapes in a circular pattern with offset for each layer
      grapeGeometry.translate(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        layer * mainGrapeSize * 1.5
      );
      geometries.push(grapeGeometry);
      
      // Add inner circle of grapes
      if (layer === 0) {
        const innerGrapeGeometry = new THREE.SphereGeometry(mainGrapeSize, 16, 16);
        innerGrapeGeometry.translate(
          Math.cos(angle) * radius * 0.5,
          Math.sin(angle) * radius * 0.5,
          mainGrapeSize
        );
        geometries.push(innerGrapeGeometry);
      }
    }
  }
  
  // Add stem
  const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  stemGeometry.translate(0, radius + 0.2, 0);
  geometries.push(stemGeometry);
  
  // Add small leaves near stem
  const leafSize = 0.3;
  const leafGeometry1 = new THREE.BoxGeometry(leafSize, 0.05, leafSize);
  leafGeometry1.translate(leafSize/2, radius + 0.2, 0);
  leafGeometry1.rotateZ(Math.PI / 4);
  geometries.push(leafGeometry1);
  
  const leafGeometry2 = new THREE.BoxGeometry(leafSize, 0.05, leafSize);
  leafGeometry2.translate(-leafSize/2, radius + 0.2, 0);
  leafGeometry2.rotateZ(-Math.PI / 4);
  geometries.push(leafGeometry2);
  
  return mergeGeometries(geometries);
}