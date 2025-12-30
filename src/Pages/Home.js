import React from 'react';
import useFetch from "../useFetch";
import { Loader, Center, Box, Stack, Container, Alert } from '@mantine/core';
import { IconMovie, IconBook, IconBuildingArch } from '@tabler/icons-react';

import HeroSection from '../MantineCompon/HomePage/HeroSection';
import ContentSection from '../MantineCompon/HomePage/ContentSection';

const Home = () => {
    const { data: movies, isPending: moviesLoading, error: moviesError } = useFetch('http://localhost:3001/getFeaturedMovies');
    const { data: googleBooks, isPending: gBooksLoading, error: gBooksError } = useFetch('http://localhost:3001/getFeaturedBooks');
    const { data: olBooks, isPending: olBooksLoading, error: olBooksError } = useFetch('http://localhost:3001/getOpenLibraryBooks');

    const isLoading = moviesLoading || gBooksLoading || olBooksLoading;
    const hasError = moviesError || gBooksError || olBooksError;

    const heroMovie = movies && movies.length > 0 ? movies[0] : null;

    if (isLoading) {
        return (
            <Center h="100vh">
                <Loader color="orange" size="xl" type="dots" />
            </Center>
        );
    }

    return ( 
        <Box 
            style={{ 
                backgroundColor: 'var(--mantine-color-body)', 
                minHeight: '100vh', 
                paddingBottom: '50px', 
                overflowX: 'hidden' 
            }}
        >
             {hasError && (
                <Container size="xl" mt="md">
                    <Alert color="red" title="Увага">
                        Виникла помилка при завантаженні даних. Перевірте сервер.
                    </Alert>
                </Container>
            )}

            <HeroSection movie={heroMovie} />

            <Container size="xl" mt={50} style={{ position: 'relative', zIndex: 10 }}>
                <Stack gap={80}>
                    
                    {/* 1. Фільми - ТЕПЕР ЗІ СВІТІННЯМ */}
                    <ContentSection 
                        title="Популярні фільми"
                        data={movies}
                        Icon={IconMovie}
                        iconColor="orange"
                        gradientFrom="#FFC837"
                        gradientTo="#FF8008"
                        glowColor="orange" // <--- ДОДАЛИ glowColor
                        glowPosition="left" // <--- Зліва
                    />

                    {/* 2. Google Books */}
                    <ContentSection 
                        title="Новинки літератури"
                        data={googleBooks}
                        Icon={IconBook}
                        iconColor="blue"
                        gradientFrom="#36D1DC"
                        gradientTo="#5B86E5"
                        glowColor="blue"
                        glowPosition="right"    
                    />

                    {/* 3. Open Library */}
                    <ContentSection 
                        title="Світова класика"
                        data={olBooks}
                        Icon={IconBuildingArch}
                        iconColor="teal"
                        gradientFrom="#11998e"
                        gradientTo="#38ef7d"
                        glowColor="teal"
                        glowPosition="left" // <--- Знову зліва
                    />

                </Stack>
            </Container>
        </Box>
     );
}
 
export default Home;