"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();

    // Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // Group Container
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Central AI Brain Volumetric Orb (Icosahedron for sci-fi look)
    const orbGeo = new THREE.IcosahedronGeometry(1.4, 32);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.8,
      wireframe: false,
    });
    const centralOrb = new THREE.Mesh(orbGeo, orbMat);
    mainGroup.add(centralOrb);

    // Inner Wireframe Core
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const innerCore = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(innerCore);

    // Orbiting Satellite Nodes
    const node1Geo = new THREE.IcosahedronGeometry(0.55, 16);
    const node1Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const node1 = new THREE.Mesh(node1Geo, node1Mat);
    node1.position.set(-2.8, 1.2, -0.5);
    mainGroup.add(node1);

    const node2Geo = new THREE.IcosahedronGeometry(0.65, 16);
    const node2Mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });
    const node2 = new THREE.Mesh(node2Geo, node2Mat);
    node2.position.set(2.6, -1.1, 0.8);
    mainGroup.add(node2);

    // Orbital Torus Rings
    const ring1Geo = new THREE.TorusGeometry(2.8, 0.018, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(3.5, 0.015, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    mainGroup.add(ring2);

    // Particle Stars Background
    const particleCount = 1200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.03,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 4, 20);
    purpleLight.position.set(5, 5, 5);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x818cf8, 4, 20);
    blueLight.position.set(-5, -5, 5);
    scene.add(blueLight);

    // Interactive Mouse Motion
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (event.clientX - rect.left - rect.width / 2) * 0.0005;
      mouseY = (event.clientY - rect.top - rect.height / 2) * 0.0005;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth Mouse Tilt Interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mainGroup.rotation.y = elapsedTime * 0.15 + targetX * 2;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.15 + targetY * 2;

      innerCore.rotation.y = -elapsedTime * 0.25;
      innerCore.rotation.z = elapsedTime * 0.1;

      // Orbiting satellites oscillation
      node1.position.y = 1.2 + Math.sin(elapsedTime * 2) * 0.15;
      node2.position.y = -1.1 + Math.cos(elapsedTime * 1.8) * 0.15;

      particleSystem.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      orbGeo.dispose();
      orbMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      node1Geo.dispose();
      node1Mat.dispose();
      node2Geo.dispose();
      node2Mat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden border border-purple-900/40 bg-slate-950 shadow-2xl shadow-purple-950/50">
      {/* Background Ambient Violet Gradient Blurs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

      {/* Vanilla Three.js WebGL Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating SalesHook Style HUD Badges */}
      <div className="absolute top-6 left-6 backdrop-blur-xl bg-slate-950/80 border border-purple-500/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-100 tracking-wide">
          SalesHookAI 3D Audio & Video Pipeline
        </span>
      </div>

      <div className="absolute bottom-6 right-6 backdrop-blur-xl bg-slate-950/80 border border-indigo-500/40 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
        <span className="text-xs font-bold text-indigo-200 tracking-wide">
          Grounded RAG 2.0 • Zero Hallucinations
        </span>
      </div>
    </div>
  );
}
