import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text3D, Center, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import useAiStore from '../../store/aiStore';

const AnimatedLogoText = () => {
  const meshRef = useRef();
  const { facePosition } = useAiStore();
  
  // Smoothly interpolate the rotation towards the face position
  useFrame((state, delta) => {
    if (meshRef.current) {
      // facePosition x and y are between -1 and 1
      const targetRotationX = facePosition.y * 0.5; // Look up/down
      const targetRotationY = facePosition.x * 0.5; // Look left/right
      
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotationX, 4 * delta);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY, 4 * delta);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <Center>
        <group ref={meshRef}>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={1.2}
            height={0.4}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.05}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            GEIDO
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.8} 
              roughness={0.2} 
              envMapIntensity={2}
            />
          </Text3D>
        </group>
      </Center>
    </Float>
  );
};

const AILogo = () => {
  return (
    <div style={{ width: '150px', height: '50px', marginLeft: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <AnimatedLogoText />
      </Canvas>
    </div>
  );
};

export default AILogo;
