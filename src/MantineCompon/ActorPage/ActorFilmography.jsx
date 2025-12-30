import React from 'react';
import { Box, Title } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import BadgeCard from '../CarouselDemo/BadgeCard/BadgeCard'; 

const ActorFilmography = ({ movies }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <Box 
            mt={30}
            // Забираємо відступи на мобільному, щоб карусель була від краю до краю
            mx={{ base: -16, md: 0 }} 
            px={{ base: 16, md: 0 }}
            style={{ overflow: 'hidden', position: 'relative' }}
        >
            <Title order={3} mb="lg" c="var(--mantine-color-text)">Відомий за фільмами ({movies.length})</Title>
            <Carousel
                slideSize={{ base: '60%', sm: '40%', md: '30%', lg: '25%' }}
                slideGap="md"
                align="start"
                withControls
                slidesToScroll={1}
                controlsOffset="xs"
                styles={{
                    control: {
                        backgroundColor: 'var(--mantine-color-body)',
                        color: 'var(--mantine-color-text)',
                        border: '1px solid var(--mantine-color-default-border)',
                    }
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