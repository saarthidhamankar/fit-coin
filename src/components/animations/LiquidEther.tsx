'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  colors?: string[];
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  isBounce?: boolean;
  resolution?: number;
}

/**
 * LiquidEther - A high-end fluid motion background component.
 * Stabilized dependency array to prevent Next.js Hook errors.
 */
export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  isViscous = false,
  viscous = 30,
  colors = ["#5227FF", "#FF9FFC", "#B19EEF"],
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  isBounce = false,
  resolution = 0.5,
}: LiquidEtherProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Stable color extraction
  const c1 = colors[0] || "#5227FF";
  const c2 = colors[1] || "#FF9FFC";
  const c3 = colors[2] || "#B19EEF";

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * resolution);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(c1) },
      uColor2: { value: new THREE.Color(c2) },
      uColor3: { value: new THREE.Color(c3) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uIntensity: { value: autoIntensity },
      uSpeed: { value: autoSpeed }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec2 uMouse;
        uniform float uIntensity;
        uniform float uSpeed;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          float t = uTime * uSpeed;
          
          vec2 p = uv * uIntensity - (uIntensity / 2.0);
          p += uMouse * 0.1;

          for(int i=1; i<4; i++) {
            float fi = float(i);
            p.x += 0.3 / fi * sin(fi * p.y + t + fi * 0.6) + 0.5;
            p.y += 0.3 / fi * cos(fi * p.x + t + fi * 0.3) + 0.5;
          }

          vec3 color = mix(uColor1, uColor2, sin(p.x + p.y) * 0.5 + 0.5);
          color = mix(color, uColor3, cos(p.x * p.y + t) * 0.5 + 0.5);
          
          gl_FragColor = vec4(color, 0.4);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleMouseMove = (e: MouseEvent) => {
      uniforms.uMouse.value.x = (e.clientX / window.innerWidth) * 2 - 1;
      uniforms.uMouse.value.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      uniforms.uTime.value += 0.01;
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
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // MUST include all props to keep dependency array size constant
  }, [c1, c2, c3, autoSpeed, autoIntensity, resolution, mouseForce, cursorSize, isViscous, viscous, isBounce]);

  return <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" />;
}