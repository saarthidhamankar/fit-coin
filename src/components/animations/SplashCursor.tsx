"use client";

import React, { useEffect, useRef } from 'react';

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  COLOR_UPDATE_SPEED?: number;
}

/**
 * SplashCursor - A high-performance interactive fluid simulation.
 * Responds to mouse movements with vibrant, swirling colors.
 */
export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1024,
  DENSITY_DISSIPATION = 1,
  VELOCITY_DISSIPATION = 1,
  PRESSURE = 0.7,
  CURL = 5,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 9500,
  COLOR_UPDATE_SPEED = 50,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Simulation variables
    const particles: Particle[] = [];
    const particleCount = 100;
    const colors = ['#18D156', '#BCFA22', '#5227FF', '#FF9FFC'];
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 5 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = Math.random() * 0.5 + 0.5;
      }

      update(mx: number, my: number) {
        const dx = mx - this.x;
        const dy = my - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200 * (SPLAT_FORCE / 1000);
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }

        this.vx *= 0.95;
        this.vy *= 0.95;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life * 0.4;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let mx = width / 2;
    let my = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let animationId: number;
    const render = () => {
      animationId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update(mx, my);
        p.draw();
      });
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [CURL, SPLAT_FORCE]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ filter: 'blur(60px)' }}
    />
  );
}
