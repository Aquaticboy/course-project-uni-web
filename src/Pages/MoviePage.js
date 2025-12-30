import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Button, Box, Loader, Center, Title, Text, useMantineColorScheme } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks';
import { IconArrowLeft } from '@tabler/icons-react';
import useFetch from '../useFetch';

import MovieHero from '../MantineCompon/MoviePage/MovieHero';
import MovieTabs from '../MantineCompon/MoviePage/MovieTabs';
import MovieSidebar from '../MantineCompon/MoviePage/MovieSidebar';
import SimilarMovies from '../MantineCompon/MoviePage/SimilarMovies';
import MoviePlayer from '../MantineCompon/MoviePage/MoviePlayer';
import CommentsSection from '../MantineCompon/Comments/CommentsSection';

const MoviePage = () => {
  const { id } = useParams();
  const { data: film, error, isPending } = useFetch(`http://localhost:3001/movieInfoByID/${id}`);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { scrollIntoView, targetRef } = useScrollIntoView({
    offset: 20,
    duration: 1200,
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  });

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader size="xl" variant="bars" color="orange" />
      </Center>
    );
  }
  
  if (error || !film) {
    return (
      <Container py="xl" ta="center">
        <Title order={2}>Дані відсутні</Title>
        <Text c="dimmed" mb="md">Не вдалося знайти інформацію про цей фільм.</Text>
        <Button component="a" href="/" leftSection={<IconArrowLeft />}>На головну</Button>
      </Container>
    );
  }

  return (
    <Box 
      pb={80} 
      style={{ 
          backgroundColor: 'var(--mantine-color-body)', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden' // Щоб світіння не вилазило за межі
      }}
    >
      <MovieHero 
        film={film} 
        onTrailerClick={() => scrollIntoView({ alignment: 'start' })} 
      />

      {/* --- АТМОСФЕРНЕ СВІТІННЯ (GLOW EFFECT) --- */}
      {/* Показуємо тільки в темній темі для ефекту кінотеатру */}
      {isDark && (
          <div style={{
              position: 'absolute',
              top: '500px', // Починається під банером
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '1200px',
              height: '800px',
              background: 'radial-gradient(circle, rgba(255, 128, 0, 0.15) 0%, transparent 70%)', // Помаранчевий (під колір сайту)
              filter: 'blur(100px)',
              zIndex: 0,
              pointerEvents: 'none'
          }} />
      )}

      <Container size="xl" mt={80} style={{ position: 'relative', zIndex: 1 }}>
        <Grid gutter={50}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <MovieTabs film={film} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
             <MovieSidebar film={film} />
          </Grid.Col>
        </Grid>

        <Box mt={80} ref={targetRef}>
            <Title 
                order={3} mb="lg" 
                c="var(--mantine-color-text)"
                style={{ borderLeft: '4px solid orange', paddingLeft: '15px' }} // Стильний акцент зліва
            >
                Офіційний трейлер
            </Title>
            <MoviePlayer 
                videos={film.videos} 
                poster={film.backdrop_full_url || film.poster_full_url} 
            />
        </Box>

        <Box mt={80}>
             <SimilarMovies similar={film.similar} />
        </Box>

        {/* --- КОМЕНТАРІ --- */}
        <Box mt={80}>
            <CommentsSection contentId={id} contentType="movie" />
        </Box>

      </Container>
    </Box>
  );
};

export default MoviePage;