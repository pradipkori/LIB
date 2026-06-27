import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import BookModel from './BookModel';

export default function BookDisplay({ books, position, onBookSelect }) {
  const groupRef = useRef();
  
  // Slowly rotate the entire display platform
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  const radius = 3.5;
  
  return (
    <group position={position} ref={groupRef}>
      {/* Sleek Glowing Pedestal Base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 0.5, radius + 0.8, 0.2, 64]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.8} />
      </mesh>
      
      {/* Neon Edge Ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[radius + 0.4, 0.02, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>

      {/* Glass/Acrylic Platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 0.4, radius + 0.5, 0.1, 64]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          opacity={1} 
          metalness={0} 
          roughness={0.1} 
          ior={1.5} 
          thickness={0.5} 
        />
      </mesh>

      {/* Floating Books in a semi-circle */}
      {books.map((book, index) => {
        // Arrange books in a gentle arc
        const angle = (index / (books.length > 1 ? books.length - 1 : 1)) * Math.PI * 0.6 - (Math.PI * 0.3);
        
        // Position them along the arc
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius - radius; // Offset so the center of the arc is at z=0

        return (
          <group key={book.id} position={[x, 0.5, z]} rotation={[0, angle, 0]}>
            {/* Small glowing puck under each book */}
            <mesh position={[0, -0.4, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, -0.37, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.02, 32]} />
              <meshBasicMaterial color={book.color} transparent opacity={0.5} />
            </mesh>
            
            <BookModel 
              book={book} 
              position={[0, 0, 0]} 
              onSelect={onBookSelect}
            />
          </group>
        );
      })}
    </group>
  );
}
