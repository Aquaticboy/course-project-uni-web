import React from 'react'; // useRef більше не потрібен, прибираємо
import { useParams } from 'react-router-dom';
import { Container, Grid, Button, Box, Loader, Center, Title, Text } from '@mantine/core';
import { useScrollIntoView } from '@mantine/hooks'; // 1. Імпортуємо хук
import { IconArrowLeft } from '@tabler/icons-react';
import useFetch from '../useFetch';

import MovieHero from '../MantineCompon/MoviePage/MovieHero';
import MovieTabs from '../MantineCompon/MoviePage/MovieTabs';
import MovieSidebar from '../MantineCompon/MoviePage/MovieSidebar';
import SimilarMovies from '../MantineCompon/MoviePage/SimilarMovies';
import MoviePlayer from '../MantineCompon/MoviePage/MoviePlayer';

const MoviePage = () => {
  const { id } = useParams();
  const { data: film, error, isPending } = useFetch(`http://localhost:3001/movieInfoByID/${id}`);
  
  // 2. Налаштовуємо хук для плавної прокрутки
  const { scrollIntoView, targetRef } = useScrollIntoView({
    offset: 20,      // Відступ зверху (щоб плеєр не прилипав до самого краю екрану)
    duration: 1200,  // Час прокрутки в мс (1.2 секунди) — чим більше, тим повільніше
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // (Опціонально) Плавне прискорення/гальмування
  });

  if (isPending) {
    return (
      <Center h="100vh">
        <Loader size="xl" variant="bars" />
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
    <Box pb={80} bg="gray.0">
      
      {/* 3. Передаємо функцію scrollIntoView (яка прийшла з хука) */}
      <MovieHero 
        film={film} 
        onTrailerClick={() => scrollIntoView({ alignment: 'start' })} 
      />

      <Container size="xl" mt={80}>
        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <MovieTabs film={film} />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
             <MovieSidebar film={film} />
          </Grid.Col>
        </Grid>

        {/* 4. Прив'язуємо targetRef до блоку з трейлером */}
        <Box mt={60} ref={targetRef}>
            <Title order={3} mb="md">Офіційний трейлер</Title>
            <MoviePlayer 
                videos={film.videos} 
                poster={film.backdrop_full_url || film.poster_full_url} 
            />
        </Box>

        <SimilarMovies similar={film.similar} />
      </Container>
    </Box>
  );
};

export default MoviePage;