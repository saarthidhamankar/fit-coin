'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

/**
 * Silk - A high-end WebGL animation featuring flowing, silk-like waves.
 * Uses a custom shader for a premium, organic look.
 */
export default function Silk({
  speed = 4.1,
  scale = 0.9,
  color = "#07741d",
  noiseIntensity = 0.8,
  rotation = 0,
}: SilkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uRotation: { value: rotation }
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
        uniform vec3 uColor;
        uniform float uSpeed;
        uniform float uScale;
        uniform float uNoiseIntensity;
        uniform float uRotation;
        varying vec2 vUv;

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        float snoise(vec2 v){
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 a0 = x - floor(x + 0.5);
          vec3 g = a0.vec3(x0.x,x12.x,x12.z) + h.vec3(x0.y,x12.y,x12.w);
          vec3 t = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 q = a0 * vec3(t.x, t.y, t.z) + h * vec3(t.x, t.y, t.z);
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = vUv;
          float t = uTime * uSpeed * 0.1;
          
          float n = snoise(uv * uScale * 5.0 + t) * uNoiseIntensity;
          float n2 = snoise(uv * uScale * 2.0 - t * 0.5) * 0.5;
          
          float waves = sin(uv.y * 10.0 + n + n2 + t) * 0.5 + 0.5;
          vec3 finalColor = mix(uColor * 0.5, uColor, waves);
          
          gl_FragColor = vec4(finalColor, 0.6);
        }
      `
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      uniforms.uTime.value += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
