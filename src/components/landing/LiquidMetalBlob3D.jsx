import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export const LiquidMetalBlob3D = ({ className = '' }) => {
  const mountRef = useRef(null);
  const { theme } = useTheme();
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const testCanvas = document.createElement('canvas');
      return Boolean(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!isSupported) return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 460;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    // 2. High-Performance Alpha Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Icosahedron Geometry for Organic Surface
    const radius = 2.0;
    const detail = 40; // 40 subdivisions for fluid vertex resolution
    const geometry = new THREE.IcosahedronGeometry(radius, detail);

    // Cache initial base vertex positions
    const pos = geometry.attributes.position;
    const count = pos.count;
    const baseCoords = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      baseCoords[i] = pos.array[i];
    }

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x10b981, 4.5, 20);
    light1.position.set(5, 4, 4);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x14b8a6, 3.8, 20);
    light2.position.set(-5, -3, 3);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x6ee7b7, 3.0, 20);
    light3.position.set(0, 5, -3);
    scene.add(light3);

    const light4 = new THREE.PointLight(0xffffff, 2.5, 20);
    light4.position.set(2, -4, 4);
    scene.add(light4);

    // 5. Theme-Adaptive Material Configuration
    const applyThemeLightingAndMaterial = (themeId) => {
      if (themeId === 'dark-monochrome') {
        material.color.setHex(0x1a1a1a);
        material.roughness = 0.08;
        material.metalness = 0.98;
        material.clearcoat = 1.0;
        material.clearcoatRoughness = 0.04;
        material.reflectivity = 1.0;

        ambientLight.color.setHex(0x2a2a2a);
        ambientLight.intensity = 1.2;

        light1.color.setHex(0xffffff);
        light1.intensity = 5.2;

        light2.color.setHex(0xd4d4d4);
        light2.intensity = 4.0;

        light3.color.setHex(0xa3a3a3);
        light3.intensity = 3.2;

        light4.color.setHex(0xffffff);
        light4.intensity = 3.0;
      } else if (themeId === 'light-monochrome') {
        material.color.setHex(0x94a3b8);
        material.roughness = 0.15;
        material.metalness = 0.88;
        material.clearcoat = 1.0;
        material.clearcoatRoughness = 0.1;
        material.reflectivity = 0.95;

        ambientLight.color.setHex(0xe2e8f0);
        ambientLight.intensity = 2.0;

        light1.color.setHex(0x0f172a);
        light1.intensity = 4.0;

        light2.color.setHex(0x334155);
        light2.intensity = 3.5;

        light3.color.setHex(0x64748b);
        light3.intensity = 3.0;

        light4.color.setHex(0xffffff);
        light4.intensity = 5.0;
      } else {
        // Default: Dark Emerald
        material.color.setHex(0x064e3b);
        material.roughness = 0.12;
        material.metalness = 0.94;
        material.clearcoat = 1.0;
        material.clearcoatRoughness = 0.08;
        material.reflectivity = 1.0;

        ambientLight.color.setHex(0x042f2e);
        ambientLight.intensity = 1.4;

        light1.color.setHex(0x10b981);
        light1.intensity = 4.8;

        light2.color.setHex(0x14b8a6);
        light2.intensity = 3.8;

        light3.color.setHex(0x6ee7b7);
        light3.intensity = 3.2;

        light4.color.setHex(0xffffff);
        light4.intensity = 2.6;
      }
      material.needsUpdate = true;
    };

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x064e3b,
      roughness: 0.12,
      metalness: 0.94,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    applyThemeLightingAndMaterial(theme);

    // 6. Interactive Parallax & Mouse Coordinates
    const target = {
      rotX: 0,
      rotY: 0,
      posX: 0,
      posY: 0,
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      target.rotX = y * 0.45;
      target.rotY = x * 0.55;
      target.posX = x * 0.25;
      target.posY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 7. Motion & Animation Loop with Smooth Organic Wave Distortion
    let animationFrameId;
    let clock = new THREE.Clock();
    let isVisible = true;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pause rendering when element scrolls out of view or tab is hidden
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const speed = prefersReducedMotion ? 0.2 : 1.0;
      const time = elapsed * speed;

      // Smooth organic morphing of vertices
      const posArray = pos.array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = baseCoords[i3];
        const y = baseCoords[i3 + 1];
        const z = baseCoords[i3 + 2];

        // Spherical normalization
        const len = Math.sqrt(x * x + y * y + z * z) || 1;
        const nx = x / len;
        const ny = y / len;
        const nz = z / len;

        // Multi-frequency harmonic liquid ripples
        const wave1 =
          Math.sin(nx * 2.2 + time * 1.5) *
          Math.cos(ny * 2.0 + time * 1.2) *
          Math.sin(nz * 2.4 + time * 1.3) *
          0.38;
        const wave2 =
          Math.cos(nx * 3.5 - time * 0.9) *
          Math.sin(ny * 3.2 + time * 1.4) *
          0.16;
        const wave3 =
          Math.sin((nx + ny + nz) * 2.6 + time * 2.0) *
          0.09;

        const displacement = radius + wave1 + wave2 + wave3;

        posArray[i3] = nx * displacement;
        posArray[i3 + 1] = ny * displacement;
        posArray[i3 + 2] = nz * displacement;
      }

      pos.needsUpdate = true;
      geometry.computeVertexNormals();

      // Gentle floating physics
      mesh.position.y = THREE.MathUtils.lerp(
        mesh.position.y,
        target.posY + Math.sin(time * 0.9) * 0.12,
        0.05
      );
      mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.posX, 0.05);

      // Smooth rotation with parallax damping
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        target.rotX + time * 0.08,
        0.04
      );
      mesh.rotation.y = THREE.MathUtils.lerp(
        mesh.rotation.y,
        target.rotY + time * 0.12,
        0.04
      );

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive Resize Listener
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || 460;
      const newHeight = container.clientHeight || 460;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
      resizeObserver.disconnect();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [theme]);

  if (!isSupported) {
    // Pure CSS High-Resolution Animated Organic Liquid Blob Fallback
    return (
      <div
        className={`relative w-80 h-80 sm:w-96 sm:h-96 mx-auto flex items-center justify-center ${className}`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-200 opacity-75 blur-2xl animate-pulse" />
        <div
          className="w-72 h-72 rounded-[42%_58%_70%_30%/45%_45%_55%_55%] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-2xl transition-all duration-700 animate-spin"
          style={{ animationDuration: '18s' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center select-none pointer-events-auto ${className}`}
      aria-label="Interactive 3D Liquid-Metal StockMate Engine"
    />
  );
};
