import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Container, Button, Grid, Paper, AspectRatio, Image, Stack, Text, Title, Group, RingProgress, Divider, Badge } from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconClock, IconPlayerPlay } from '@tabler/icons-react';

const MovieHero = ({ film, onTrailerClick }) => {
  const history = useHistory();

  const releaseYear = film.release_date ? film.release_date.split('-')[0] : 'N/A';
  const hours = Math.floor(film.runtime / 60);
  const minutes = film.runtime % 60;
  
  const trailer = film.videos?.results?.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));

  return (
    <Box
      style={{
        position: 'relative',
        minHeight: '650px',
        // ЗМІНА: Фон під картинкою тепер адаптивний (щоб не було чорних смуг при завантаженні)
        backgroundColor: 'var(--mantine-color-body)',
        
        // ЗМІНА: Градієнт тепер переходить у колір тіла сторінки (var(--mantine-color-body))
        // Це забезпечує плавний перехід і в світлій (в біле), і в темній (в чорне) темі.
        backgroundImage: `linear-gradient(to top, var(--mantine-color-body) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%), url(${film.backdrop_full_url || film.poster_full_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '3rem'
      }}
    >
      {/* Текст залишаємо білим, бо він на темному фоні картинки */}
      <Container size="xl" w="100%" style={{ zIndex: 2, color: 'white' }}>
        
        <Button 
          onClick={() => history.goBack()}
          variant="white" 
          color="dark" 
          leftSection={<IconArrowLeft size={16} />} 
          style={{ position: 'absolute', top: 30, left: 30 }}
        >
          Назад
        </Button>

        <Grid gutter={50} align="flex-end">
          <Grid.Col span={{ base: 12, md: 3 }} visibleFrom="sm">
            <Paper 
                shadow="xl" 
                radius="md" 
                style={{ 
                    overflow: 'hidden', 
                    // ЗМІНА: Рамка тепер кольору фону сторінки.
                    // У темній темі рамка темна, у світлій - біла.
                    border: '4px solid var(--mantine-color-body)', 
                    transform: 'translateY(60px)' 
                }}
            >
              <AspectRatio ratio={2/3}>
                <Image src={film.poster_full_url} alt={film.title} fallbackSrc="https://placehold.co/500x750?text=No+Poster" />
              </AspectRatio>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Stack gap="sm">
              {film.tagline && (
                <Text fs="italic" c="yellow.4" fw={600} size="lg">“{film.tagline}”</Text>
              )}
              
              <Title order={1} fz={{ base: 36, md: 60 }} lh={1.1} c="white">
                {film.title}
              </Title>

              <Group gap="md" mt="sm">
                 <RingProgress
                    size={60}
                    thickness={6}
                    roundCaps
                    sections={[{ value: (film.vote_average * 10), color: film.vote_average >= 7 ? 'teal' : 'yellow' }]}
                    label={<Text c="white" fw={700} ta="center" size="sm">{film.vote_average.toFixed(1)}</Text>}
                  />
                  <Stack gap={0}>
                      <Text fw={700} c="white">Рейтинг</Text>
                      <Text size="xs" c="gray.4">{film.vote_count} голосів</Text>
                  </Stack>
                  <Divider orientation="vertical" color="gray.7" />
                  <Box>
                      <Group gap={5}><IconCalendar size={16}/><Text c="white">{releaseYear}</Text></Group>
                      <Group gap={5}><IconClock size={16}/><Text c="white">{hours} год {minutes} хв</Text></Group>
                  </Box>
              </Group>

              <Group gap={6} mt="sm">
                {film.genres?.map(g => (
                  <Badge key={g.id} variant="white" color="dark" size="lg" radius="sm">
                    {g.name}
                  </Badge>
                ))}
              </Group>

              {trailer && (
                 <Button 
                   onClick={onTrailerClick}
                   variant="gradient" gradient={{ from: 'red', to: 'orange' }}
                   size="lg" radius="md" mt="lg" w="fit-content"
                   leftSection={<IconPlayerPlay />}
                 >
                   Дивитися трейлер
                 </Button>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default MovieHero;