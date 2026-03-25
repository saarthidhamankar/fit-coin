"use client";

import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

interface ThreadsProps {
  color?: number[];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
}

/**
 * Threads - A high-end WebGL animation featuring flowing, interconnected lines.
 * Optimized for performance and stability.
 */
export default function Threads({
  color = [0.32, 0.15, 1],
  amplitude = 2.4,
  distance = 0.4,
  enableMouseInteraction = true,
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Stabilize color input
  const r = color[0] ?? 0.32;
  const g = color[1] ?? 0.15;
  const b = color[2] ?? 1;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const threadCount = 40;
    const segments = 100;
    const threads: THREE.Line[] = [];

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < threadCount; i++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(segments * 3);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const line = new THREE.Line(geometry, material);
      line.userData = {
        offset: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
        drift: Math.random() * distance
      };
      
      scene.add(line);
      threads.push(line);
    }

    camera.position.z = 50;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!enableMouseInteraction) return;
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      threads.forEach((line, i) => {
        const positions = line.geometry.attributes.position.array as Float32Array;
        const { offset, speed, drift } = line.userData;

        for (let j = 0; j < segments; j++) {
          const x = (j / segments) * 160 - 80;
          const y = Math.sin(x * 0.05 + time * speed + offset) * amplitude * 5;
          const z = Math.cos(x * 0.03 + time * speed + offset) * amplitude * 2;

          const idx = j * 3;
          positions[idx] = x + (mouseX * 10 * drift);
          positions[idx + 1] = y + (mouseY * 10 * drift);
          positions[idx + 2] = z;
        }
        line.geometry.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      threads.forEach(t => {
        t.geometry.dispose();
      });
      material.dispose();
      renderer.dispose();
    };
  }, [r, g, b, amplitude, distance, enableMouseInteraction]);

  return <div ref={containerRef} className="w-full h-full" />;
}
