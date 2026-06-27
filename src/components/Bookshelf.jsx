import React from 'react';
import BookModel from './BookModel';

export default function Bookshelf({ books, position, onBookSelect }) {
  // A proper bookshelf with multiple tiers
  const shelfWidth = 4.5;
  const shelfHeight = 3.5;
  const shelfDepth = 0.8;
  const boardThickness = 0.1;
  const numShelves = 3;
  
  const woodMaterial = <meshStandardMaterial color="#3e2723" roughness={0.9} metalness={0.1} />;

  // Distribute books across shelves
  const booksPerShelf = Math.ceil(books.length / numShelves);
  const bookSpacing = 0.28;

  return (
    <group position={position}>
      {/* Backboard */}
      <mesh position={[0, shelfHeight / 2, -shelfDepth / 2 + boardThickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[shelfWidth, shelfHeight, boardThickness]} />
        {woodMaterial}
      </mesh>

      {/* Left side board */}
      <mesh position={[-shelfWidth / 2 + boardThickness / 2, shelfHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, shelfHeight, shelfDepth]} />
        {woodMaterial}
      </mesh>

      {/* Right side board */}
      <mesh position={[shelfWidth / 2 - boardThickness / 2, shelfHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardThickness, shelfHeight, shelfDepth]} />
        {woodMaterial}
      </mesh>

      {/* Top board */}
      <mesh position={[0, shelfHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[shelfWidth, boardThickness, shelfDepth]} />
        {woodMaterial}
      </mesh>

      {/* Shelves and Books */}
      {Array.from({ length: numShelves }).map((_, shelfIndex) => {
        const shelfY = (shelfHeight / numShelves) * shelfIndex + boardThickness;
        const startIndex = shelfIndex * booksPerShelf;
        const shelfBooks = books.slice(startIndex, startIndex + booksPerShelf);
        
        // Center books on this specific shelf
        const startX = -((shelfBooks.length - 1) * bookSpacing) / 2;

        return (
          <group key={`shelf-${shelfIndex}`}>
            {/* The Shelf Board */}
            <mesh position={[0, shelfY, 0]} castShadow receiveShadow>
              <boxGeometry args={[shelfWidth - boardThickness * 2, boardThickness, shelfDepth - 0.05]} />
              {woodMaterial}
            </mesh>

            {/* Books on this shelf */}
            {shelfBooks.map((book, bookIndex) => (
              <BookModel 
                key={book.id} 
                book={book} 
                position={[startX + bookIndex * bookSpacing, shelfY + boardThickness / 2, 0]} 
                onSelect={onBookSelect}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
}
