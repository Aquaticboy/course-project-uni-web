import React from 'react';
import { Box, Title } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
// ВАЖЛИВО: Перевір, чи правильний шлях виходу з папки ActorPage
import BadgeCard from '../CarouselDemo/BadgeCard/BadgeCard'; 

const ActorFilmography = ({ movies }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <Box 
            mt={30}
            px={{ base: 0, md: 20 }} 
            style={{ overflow: 'hidden', position: 'relative' }}
            onMouseEnter={(e) => {
                 e.currentTarget.querySelectorAll('.mantine-Carousel-control').forEach(c => c.style.opacity = '1');
            }}
            onMouseLeave={(e) => {
                 e.currentTarget.querySelectorAll('.mantine-Carousel-control').forEach(c => c.style.opacity = '0');
            }}
        >
            <Title order={3} mb="lg">Відомий за фільмами ({movies.length})</Title>
            <Carousel
                slideSize={{ base: '50%', sm: '33%', md: '25%', lg: '20%' }}
                slideGap="md"
                align="start"
                emblaOptions={{
                    loop: movies.length > 5,
                    align: 'start',
                    containScroll: 'trimSnaps',
                    dragFree: true
                }}
                controlsOffset="xs"
                styles={{
                    control: {
                        width: 32,
                        height: 32,
                        backgroundColor: 'white',
                        color: 'black',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '1px solid #e9ecef',
                        opacity: 0, 
                        transition: 'opacity 0.2s ease, transform 0.2s ease',
                        '&:hover': { backgroundColor: '#f8f9fa', transform: 'scale(1.1)' }
                    },
                    nextControl: {
                        marginRight: 0, 
                        '@media (min-width: 62em)': { marginRight: -20 } 
                    },
                    previousControl: {
                        marginLeft: 0,
                        '@media (min-width: 62em)': { marginLeft: -20 } 
                    },
                    controls: {
                        padding: 0,
                        '@media (max-width: 62em)': { display: 'none' }
                    },
                    viewport: { overflow: 'visible' }
                }}
            >
                {movies.map(movie => {
                    const cardData = {
                        ...movie,
                        poster_full_url: movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : null,
                        genres: []
                    };
                    return (
                        <Carousel.Slide key={movie.id} pb="sm">
                                <BadgeCard film={cardData} />
                        </Carousel.Slide>
                    )
                })}
            </Carousel>
        </Box>
    );
};

export default ActorFilmography;