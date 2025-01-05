import * as THREE from 'three';
import { BLADES } from '../models/Blade.js';

export class InputManager {
  constructor(gameManager) {
    if (!gameManager) {
      throw new Error('GameManager is required for InputManager');
    }
    this.gameManager = gameManager;
    this.isMouseDown = false;
    this.lastX = 0;
    this.lastY = 0;
    this.trailPoints = [];
    this.maxTrailLength = 10;
    
    // Ensure the game area exists before setting up listeners
    if (!document.getElementById('game-area')) {
      throw new Error('Game area element not found');
    }
    
    this.setupEventListeners();
    this.createBladeCursor();
    this.createTrailEffect();
  }

  createTrailEffect() {
    // Create trail container
    this.trailContainer = document.createElement('div');
    this.trailContainer.className = 'blade-trail';
    document.getElementById('game-area').appendChild(this.trailContainer);
  }

  updateTrail(x, y) {
    if (this.isMouseDown) {
      // Add new point
      this.trailPoints.push({ x, y });
      
      // Remove old points if trail is too long
      if (this.trailPoints.length > this.maxTrailLength) {
        this.trailPoints.shift();
      }

      // Update trail visualization
      this.trailContainer.innerHTML = '';
      
      for (let i = 1; i < this.trailPoints.length; i++) {
        const start = this.trailPoints[i - 1];
        const end = this.trailPoints[i];
        
        // Create trail segment
        const segment = document.createElement('div');
        segment.className = 'blade-trail-segment';
        
        // Calculate segment position and rotation
        const length = Math.hypot(end.x - start.x, end.y - start.y);
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        
        // Position and rotate segment
        segment.style.left = `${start.x}px`;
        segment.style.top = `${start.y}px`;
        segment.style.width = `${length}px`;
        segment.style.transform = `rotate(${angle}rad)`;
        segment.style.opacity = i / this.trailPoints.length;
        
        this.trailContainer.appendChild(segment);
      }
    } else {
      // Clear trail when not slicing
      this.trailPoints = [];
      this.trailContainer.innerHTML = '';
    }
  }

  setupEventListeners() {
    const gameArea = document.getElementById('game-area');

    const handleMove = (x, y) => {
      if (this.isMouseDown) {
        // Calculate movement vector
        const movementX = x - this.lastX;
        const movementY = y - this.lastY;
        
        // Update trail effect
        this.updateTrail(x, y);
        
        // Update last position
        this.lastX = x;
        this.lastY = y;

        // Check for fruit collisions
        this.gameManager.fruits.forEach(fruit => {
          const fruitPos = fruit.mesh.position;
          const screenPos = new THREE.Vector3(fruitPos.x, fruitPos.y, fruitPos.z);
          screenPos.project(this.gameManager.camera);
          
          // Convert to screen coordinates
          const screenX = (screenPos.x + 1) * window.innerWidth / 2;
          const screenY = (-screenPos.y + 1) * window.innerHeight / 2;
          
          // Check if the slice line intersects with the fruit
          const distance = Math.sqrt(
            Math.pow(screenX - x, 2) + 
            Math.pow(screenY - y, 2)
          );
          
          if (distance < 50 && !fruit.sliced) {
            fruit.slice();
            // Award 1 point and 1 gem
            this.gameManager.player.score++;
            this.gameManager.player.gems++;
            this.gameManager.updateUI();
          }
        });
      }
    };

    // Mouse events
    gameArea.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.trailPoints = [{ x: e.clientX, y: e.clientY }];
    });
    
    gameArea.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });
    
    gameArea.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.updateTrail(0, 0); // Clear trail
    });
    
    gameArea.addEventListener('mouseleave', () => {
      this.isMouseDown = false;
      this.updateTrail(0, 0); // Clear trail
    });

    // Touch events
    gameArea.addEventListener('touchstart', (e) => {
      this.isMouseDown = true;
      this.lastX = e.touches[0].clientX;
      this.lastY = e.touches[0].clientY;
      this.trailPoints = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }];
    });
    
    gameArea.addEventListener('touchmove', (e) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    });
    
    gameArea.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.updateTrail(0, 0); // Clear trail
    });
  }

  createBladeCursor() {
    const updateCursor = () => {
      const blade = BLADES[this.gameManager.player.currentBlade];
      const gameArea = document.getElementById('game-area');
      if (gameArea) {
        // Create larger SVG for more detail
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '128');
        svg.setAttribute('height', '128');
        svg.setAttribute('viewBox', '0 0 128 128');
        
        // Create machete blade path
        const bladePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bladePath.setAttribute('d', `
          M 64,10  
          L 75,12
          C 85,15 90,20 92,25
          L 95,60
          C 95,65 93,70 90,72
          L 85,75
          L 80,76
          L 75,75
          C 70,73 68,70 67,65
          L 65,25
          C 64,20 62,15 60,12
          Z
        `);
        bladePath.setAttribute('fill', blade.color);
        bladePath.setAttribute('stroke', '#444444');
        bladePath.setAttribute('stroke-width', '2');
        
        // Add blade edge (the sharp part)
        const bladeEdge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bladeEdge.setAttribute('d', `
          M 75,12
          C 85,15 90,20 92,25
          L 95,60
          C 95,65 93,70 90,72
        `);
        bladeEdge.setAttribute('stroke', '#FFFFFF');
        bladeEdge.setAttribute('stroke-width', '1');
        bladeEdge.setAttribute('fill', 'none');
        bladeEdge.setAttribute('opacity', '0.6');
        
        // Add metallic gradient with more realistic coloring
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'metallic';
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:rgba(255,255,255,0.1)');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '30%');
        stop2.setAttribute('style', 'stop-color:rgba(255,255,255,0.7)');
        
        const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop3.setAttribute('offset', '70%');
        stop3.setAttribute('style', 'stop-color:rgba(255,255,255,0.7)');
        
        const stop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop4.setAttribute('offset', '100%');
        stop4.setAttribute('style', 'stop-color:rgba(255,255,255,0.1)');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        gradient.appendChild(stop3);
        gradient.appendChild(stop4);
        
        // Add realistic handle with grip texture
        const handle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        handle.setAttribute('d', `
          M 67,75
          L 65,95
          C 65,98 66,100 70,102
          L 75,103
          L 80,102
          C 84,100 85,98 85,95
          L 83,75
          Z
        `);
        handle.setAttribute('fill', '#5D4037');
        handle.setAttribute('stroke', '#3E2723');
        handle.setAttribute('stroke-width', '1');
        
        // Add handle rivets
        const rivet1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rivet1.setAttribute('cx', '75');
        rivet1.setAttribute('cy', '80');
        rivet1.setAttribute('r', '2');
        rivet1.setAttribute('fill', '#8B4513');
        rivet1.setAttribute('stroke', '#4A2006');
        
        const rivet2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rivet2.setAttribute('cx', '75');
        rivet2.setAttribute('cy', '90');
        rivet2.setAttribute('r', '2');
        rivet2.setAttribute('fill', '#8B4513');
        rivet2.setAttribute('stroke', '#4A2006');
        
        // Add handle grip pattern
        const gripPattern = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const gripLines = Array.from({length: 6}, (_, i) => 
          `M 67,${80 + i * 3} L 83,${80 + i * 3}`
        ).join(' ');
        gripPattern.setAttribute('d', gripLines);
        gripPattern.setAttribute('stroke', '#3E2723');
        gripPattern.setAttribute('stroke-width', '1');
        gripPattern.setAttribute('opacity', '0.5');
        
        // Add shine effect on blade
        const shine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shine.setAttribute('d', `
          M 70,15
          C 75,18 78,22 80,25
          L 82,55
          C 82,60 80,63 78,65
        `);
        shine.setAttribute('fill', 'none');
        shine.setAttribute('stroke', 'url(#metallic)');
        shine.setAttribute('stroke-width', '8');
        shine.setAttribute('opacity', '0.4');
        
        // Assemble SVG
        svg.appendChild(gradient);
        svg.appendChild(bladePath);
        svg.appendChild(bladeEdge);
        svg.appendChild(shine);
        svg.appendChild(handle);
        svg.appendChild(gripPattern);
        svg.appendChild(rivet1);
        svg.appendChild(rivet2);
        
        // Convert SVG to data URL
        const svgString = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        // Apply cursor with offset for the machete's center
        gameArea.style.cursor = `url(${url}) 75 75, crosshair`;
        
        // Clean up URL after cursor is set
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    };

    // Update cursor when blade changes
    this.gameManager.player.onBladeChange = updateCursor;
    updateCursor();
  }

  // ... rest of the InputManager code stays the same
}