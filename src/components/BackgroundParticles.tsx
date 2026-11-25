'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 300;

  useEffect(() => {
    if (!pointsRef.current) return;

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      sizes[i] = Math.random() * 2 + 0.5;
      alphas[i] = Math.random() * 0.5 + 0.1;
      speeds[i] = Math.random() * 0.02 + 0.005;
    }

    const geometry = pointsRef.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.sizeAttenuation = true;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speeds = pointsRef.current.geometry.attributes.speed.array as Float32Array;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= speeds[i];
      if (positions[i * 3 + 1] < -30) {
        positions[i * 3 + 1] = 30;
        positions[i * 3] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0001;
    pointsRef.current.rotation.x += 0.00005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count * 3} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={count} itemSize={1} />
        <bufferAttribute attach="attributes-alpha" count={count} itemSize={1} />
        <bufferAttribute attach="attributes-speed" count={count} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        color="#D4FF4F"
        transparent
        opacity={0.6}
        size={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}