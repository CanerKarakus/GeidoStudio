import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import useAiStore from '../../store/aiStore';

// Preload the model to prevent suspense flashes
useGLTF.preload('/3dmodels/zeus.glb');

const AnimatedZeusModel = () => {
  const meshRef = useRef();
  const { facePosition } = useAiStore();
  const { scene } = useGLTF('/3dmodels/zeus.glb');
  
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
          {/* We scale the model dynamically since we don't know its exact size, but standardizing to 1.5 helps */}
          <primitive object={scene} scale={1.5} />
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
        <Suspense fallback={null}>
          <AnimatedZeusModel />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default AILogo;
