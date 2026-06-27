import React from 'react';
import { OrbitControls, Environment, ContactShadows, Float, Stars, Sparkles } from '@react-three/drei';
import { useStore } from '../store';
import BookDisplay from './BookDisplay';

export default function Scene({ onBookSelect }) {
  const books = useStore(state => state.books);

  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 5, 20]} />
      
      <ambientLight intensity={0.2} color="#ffffff" />
      
      {/* Dramatic Spotlights */}
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.6} 
        penumbra={0.8} 
        intensity={2} 
        castShadow 
        color="#3b82f6"
      />
      <spotLight 
        position={[-5, 5, 5]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={1.5} 
        color="#8b5cf6"
      />
      <spotLight 
        position={[5, 5, 5]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={1.5} 
        color="#0ea5e9"
      />

      {/* Environment preset provides reflections for the glass/metal */}
      <Environment preset="city" />

      {/* Subtle floating particles for a premium "metaverse" feel */}
      <Sparkles count={100} scale={12} size={1.5} speed={0.2} opacity={0.3} color="#60a5fa" />
      
      {/* Subtle stars in the dark background */}
      <Stars radius={15} depth={50} count={1000} factor={3} saturation={0} fade speed={1} />

      {/* OrbitControls */}
      <OrbitControls 
        makeDefault 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2 + 0.1}
        minDistance={3} 
        maxDistance={12}
        target={[0, 1, 0]}
        enableDamping
        dampingFactor={0.05}
      />

      <group position={[0, -0.5, 0]}>
        {/* The Floor (Endless reflective obsidian mirror) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#000000" 
            roughness={0.1} 
            metalness={0.9} 
          />
        </mesh>
        
        {/* Soft shadow underneath the entire display */}
        <ContactShadows position={[0, 0, 0]} opacity={0.8} scale={10} blur={2.5} far={4} color="#000000" />

        {/* The Premium Display Platform */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <BookDisplay books={books} position={[0, 0, 0]} onBookSelect={onBookSelect} />
        </Float>
      </group>
    </>
  );
}
