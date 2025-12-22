import React from 'react';
import MovieCard from './MovieCard';
import GoogleBookCard from './GoogleBookCard';
import OLBookCard from './OLBookCard';

const BadgeCard = ({ film }) => {
  if (!film) return null;

  // Вибираємо картку на основі media_type, який приходить з бекенду
  if (film.media_type === 'book_google' || film.media_type === 'book') {
      return <GoogleBookCard item={film} />;
  } 
  
  if (film.media_type === 'book_ol') {
      return <OLBookCard item={film} />;
  }

  // За замовчуванням (якщо media_type немає або це фільм)
  return <MovieCard item={film} />;
};

export default BadgeCard;