
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeFitLogo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const size = containerRef.current.clientWidth;
    renderer.setSize(size, size);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x18D156,
      roughness: 0.3,
      metalness: 0.8
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const coinGeo = new THREE.CylinderGeometry(6, 6, 1, 32);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xBCFA22 });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(20, 20, 20);
    scene.add(pointLight);

    camera.position.z = 30;

    const animate = () => {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.005;
      coin.rotation.z += 0.02;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full aspect-square max-w-[400px]" />;
}
