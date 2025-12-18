import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Grid, Image, Title, Text, Group, 
  Badge, Stack, Button, Box, AspectRatio, Paper 
} from '@mantine/core';
import { IconStarFilled, IconPlayerPlay, IconArrowLeft, IconClock } from '@tabler/icons-react';
import useFetch from '../useFetch';

const MoviePage = ({ data }) => {
  // 1. Отримуємо ID з URL (наприклад, з /movie/tt0133093)
  const { id } = useParams();

  const { data: film, error, isLoading } = useFetch(`/getMovieDetails/${id}`);
  console.log("MoviePage.js film data: \n" + JSON.stringify(film, null, 2));

  // 3. Якщо фільм не знайдено (наприклад, при перезавантаженні або помилці)
  if (!film) {
    return (
      <Container py="xl" ta="center">
        <Title order={2}>Фільм не знайдено</Title>
        <Button component={Link} to="/" mt="md" leftSection={<IconArrowLeft size={16} />}>
          Повернутися на головну
        </Button>
      </Container>
    );
  }

  return (
    <Box pb="xl">
      {/* HERO SECTION: Великий банер з градієнтом */}
      <Box 
        style={{ 
          position: 'relative', 
          minHeight: '500px', 
          backgroundColor: '#1a1b1e',
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.4) 100%), url(${film.Poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          display: 'flex',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <Container size="xl" w="100%">
          <Stack gap="md" maw={650}>
            <Button 
              component={Link} 
              to="/" 
              variant="subtle" 
              color="gray.0" 
              leftSection={<IconArrowLeft size={16} />}
              w="fit-content"
              pl={0}
            >
              Назад до списку
            </Button>

            <Title order={1} fz={{ base: 32, md: 48 }} lh={1.1}>
              {film.Title}
            </Title>
            
            <Group gap="xs">
              <Badge color="yellow" variant="filled" size="lg" leftSection={<IconStarFilled size={14}/>}>
                {film.imdbRating}
              </Badge>
              <Text fw={500} c="gray.3">
                {film.Year} • {film.Runtime} • {film.Genre}
              </Text>
            </Group>

            <Text fz="lg" c="gray.4" style={{ lineHeight: 1.6 }}>
              {film.Plot}
            </Text>

            <Group mt="lg">
              <Button leftSection={<IconPlayerPlay size={20} />} size="lg" radius="md" color="blue">
                Дивитися трейлер
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* ДЕТАЛЬНА ІНФОРМАЦІЯ */}
      <Container size="xl" mt={40}>
        <Grid gutter={40}>
          {/* Трейлер (заглушка) */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Title order={3} mb="md">Трейлер фільму</Title>
            <Paper radius="md" withBorder style={{ overflow: 'hidden' }}>
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                  title="Trailer"
                  frameBorder="0"
                  allowFullScreen
                />
              </AspectRatio>
            </Paper>
          </Grid.Col>

          {/* Характеристики */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Title order={3} mb="md">Про фільм</Title>
            <Stack gap="xs">
              <InfoBox label="Режисер" value={film.Director} />
              <InfoBox label="Актори" value={film.Actors} />
              <InfoBox label="Країна" value={film.Country} />
              <InfoBox label="Нагороди" value={film.Awards} />
              <InfoBox label="Рейтинг" value={film.Rated} />
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

// Маленький компонент для рядків інформації
const InfoBox = ({ label, value }) => (
  <Box py="xs" style={{ borderBottom: '1px solid #e9ecef' }}>
    <Text fz="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text>
    <Text fz="sm" fw={500}>{value}</Text>
  </Box>
);

export default MoviePage;