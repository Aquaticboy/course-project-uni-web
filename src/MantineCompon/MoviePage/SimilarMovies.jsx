import React from 'react';
import { Box, Title } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import BadgeCard from '../CarouselDemo/BadgeCard/BadgeCard';

const SimilarMovies = ({ similar }) => {
  if (!similar?.results?.length) return null;

  return (
    <Box mt={60}>
      <Title order={3} mb="lg">Вам може сподобатися</Title>
      <Carousel
        slideSize={{ base: '50%', sm: '33%', md: '20%' }}
        slideGap="md"
        emblaOptions={{ loop: false, align: 'start', containScroll: 'trimSnaps', dragFree: true }}
        // align="start"
        // loop
        // dragFree
      >
        {similar.results.map(sim => {
          const cardData = {
            ...sim,
            id: sim.id,
            poster_full_url: sim.poster_path 
                ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` 
                : null,
            genres: [] 
          };

          return (
            <Carousel.Slide key={sim.id}>
              <BadgeCard film={cardData} />
            </Carousel.Slide>
          );
        })}
      </Carousel>
    </Box>
  );
};

export default SimilarMovies;