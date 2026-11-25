'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface RobotProps {
  onClick: () => void;
  onMessageChange?: (message: string, show: boolean) => void;
  greeting: string;
  locale: 'ar' | 'en';
}

export function Robot({ onClick, onMessageChange, greeting, locale }: RobotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const antennaRef = useRef<THREE.Mesh>(null);
  const { pointer, clock } = useThree();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [blinkPhase, setBlinkPhase] = useState(0);
  const [eyeColor, setEyeColor] = useState('#D4FF4F');
  const clickCountRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current) return;

    const { x, y } = state.pointer;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.6, 0.08);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.3, 0.08);
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;

    if (headRef.current && !isClicked) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, x * 0.3, 0.05);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -y * 0.2, 0.05);
    }

    if (bodyRef.current && !isClicked) {
      bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, x * 0.15, 0.04);
    }

    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      antennaRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.5) * 0.05;
    }

    const blinkCycle = Math.sin(state.clock.elapsedTime * 0.5);
    if (blinkCycle > 0.95 && blinkPhase === 0) {
      setBlinkPhase(1);
      setTimeout(() => setBlinkPhase(0), 150);
    }
  });

  useEffect(() => {
    const handlePointerOver = () => setIsHovered(true);
    const handlePointerOut = () => setIsHovered(false);
    const handleClick = () => {
      setIsClicked(true);
      clickCountRef.current += 1;
      setEyeColor('#FF6B6B');
      onClick();
      onMessageChange?.(greeting, true);
      setTimeout(() => {
        setIsClicked(false);
        setEyeColor('#D4FF4F');
        onMessageChange?.('', false);
      }, 1500);
    };

    const group = groupRef.current;
    if (group) {
      group.userData.onPointerOver = handlePointerOver;
      group.userData.onPointerOut = handlePointerOut;
      group.userData.onClick = handleClick;
    }

    return () => {
      if (group) {
        delete group.userData.onPointerOver;
        delete group.userData.onPointerOut;
        delete group.userData.onClick;
      }
    };
  }, [onClick, onMessageChange, greeting]);

  const eyeScale = blinkPhase === 1 ? 0.1 : 1;
  const hoverScale = isHovered ? 1.1 : 1;
  const clickScale = isClicked ? 1.2 : 1;
  const totalScale = hoverScale * clickScale;

  const bodyGlow = isHovered
    ? `0 0 30px ${eyeColor}, 0 0 60px ${eyeColor}40`
    : 'none';

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => { e.stopPropagation(); groupRef.current?.userData.onPointerOver?.(); }}
      onPointerOut={(e) => { e.stopPropagation(); groupRef.current?.userData.onPointerOut?.(); }}
      onClick={(e) => { e.stopPropagation(); groupRef.current?.userData.onClick?.(); }}
      style={{ cursor: 'pointer' }}
    >
      <motion.group
        animate={{ scale: totalScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <group ref={bodyRef}>
          <mesh
            castShadow
            receiveShadow
            onPointerOver={(e) => e.stopPropagation()}
            onPointerOut={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial
              color="#E8E8E8"
              roughness={0.3}
              metalness={0.2}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            position={[0, 1.3, 0]}
            onPointerOver={(e) => e.stopPropagation()}
            onPointerOut={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshStandardMaterial
              color="#F0F0F0"
              roughness={0.2}
              metalness={0.3}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh ref={headRef} position={[0, 2.05, 0]}>
            <sphereGeometry args={[0.7, 32, 32]} />
            <meshStandardMaterial
              color="#FFFFFF"
              roughness={0.15}
              metalness={0.4}
            />
          </mesh>
          <mesh ref={leftEyeRef} position={[-0.25, 2.15, 0.65]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={eyeColor} />
          </mesh>
          <mesh ref={rightEyeRef} position={[0.25, 2.15, 0.65]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={eyeColor} />
          </mesh>
          <mesh ref={antennaRef} position={[0, 2.8, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshStandardMaterial color="#CCCCCC" roughness={0.2} metalness={0.5} />
          </mesh>
          <mesh position={[0, 3.05, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={eyeColor} />
          </mesh>
          <mesh position={[-0.6, 1.0, 0.6]} rotation={[-Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0.6, 1.0, 0.6]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 1.0, 16]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[-0.5, -0.8, 0.4]} rotation={[Math.PI / 6, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0.5, -0.8, 0.4]} rotation={[-Math.PI / 6, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
            <meshStandardMaterial color="#E0E0E0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[-0.3, -1.5, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#D0D0D0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0.3, -1.5, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#D0D0D0" roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 2.15, 0.72]} scale={[0.8, eyeScale, 0.8]}>
            <ringGeometry args={[0.06, 0.12, 16]} />
            <meshBasicMaterial color={eyeColor} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 2.15, 0.72]} scale={[0.8, eyeScale, 0.8]}>
            <ringGeometry args={[0.06, 0.12, 16]} />
            <meshBasicMaterial color={eyeColor} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </motion.group>
      <pointLight
        position={[0, 2.15, 0.7]}
        color={eyeColor}
        intensity={isHovered ? 2 : 1}
        distance={5}
        decay={2}
      />
    </group>
  );
}