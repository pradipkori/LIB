import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export default function BookModel({ book, position, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  // Adjusted dimensions for a sleek, realistic book
  const bookWidth = 0.25;
  const bookHeight = 0.9;
  const bookDepth = 0.7;

  // Smooth hover animation (floating up and glowing)
  useFrame((state, delta) => {
    if (hovered && meshRef.current) {
      meshRef.current.position.y += (0.1 - meshRef.current.position.y) * 10 * delta;
      meshRef.current.rotation.y += (0.1 - meshRef.current.rotation.y) * 5 * delta;
    } else if (meshRef.current) {
      meshRef.current.position.y += (0 - meshRef.current.position.y) * 10 * delta;
      meshRef.current.rotation.y += (0 - meshRef.current.rotation.y) * 5 * delta;
    }
  });

  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(book); }}
    >
      <group ref={meshRef}>
        {/* The Book Body (Pages) */}
        <mesh castShadow receiveShadow position={[0, bookHeight/2, 0]}>
          <boxGeometry args={[bookWidth - 0.05, bookHeight - 0.05, bookDepth - 0.02]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
        </mesh>
        
        {/* The Book Cover (Premium glossy finish) */}
        <mesh castShadow receiveShadow position={[0, bookHeight/2, 0.01]}>
          <boxGeometry args={[bookWidth, bookHeight, bookDepth]} />
          <meshPhysicalMaterial 
            color={book.color} 
            roughness={hovered ? 0.1 : 0.2} 
            metalness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={book.color}
            emissiveIntensity={hovered ? 0.5 : 0.1}
          />
        </mesh>
        
        {/* Glowing Title Text on the spine */}
        <Text
          position={[-bookWidth/2 - 0.002, bookHeight/2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.07}
          font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NJtEtq.woff"
          color="#ffffff"
          maxWidth={bookHeight * 0.8}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#000000"
        >
          {book.title}
        </Text>
      </group>
    </group>
  );
}
