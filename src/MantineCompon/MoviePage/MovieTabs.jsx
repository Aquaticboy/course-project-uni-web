import React from 'react';
import { Link } from 'react-router-dom'; // <--- ВАЖЛИВО: Імпорт Link
import { Tabs, Stack, Box, Title, Text, SimpleGrid, Paper, Group, Avatar, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { IconMovie, IconUsers, IconPhoto } from '@tabler/icons-react';

import CrewItem from './CrewItem'; 

const MovieTabs = ({ film }) => {
  const director = film.credits?.crew?.find(p => p.job === 'Director');
  const writers = film.credits?.crew?.filter(p => p.department === 'Writing').slice(0, 3) || [];
  const producers = film.credits?.crew?.filter(p => p.job === 'Producer').slice(0, 3) || [];

  return (
    <Tabs defaultValue="overview" variant="outline" radius="md">
      <Tabs.List mb="md">
        <Tabs.Tab value="overview" leftSection={<IconMovie size={16}/>}>Про фільм</Tabs.Tab>
        <Tabs.Tab value="cast" leftSection={<IconUsers size={16}/>}>Актори</Tabs.Tab>
        <Tabs.Tab value="media" leftSection={<IconPhoto size={16}/>}>Галерея</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="overview">
        <Stack gap="xl">
            <Box>
                <Title order={3} mb="sm">Сюжет</Title>
                <Text fz="lg" lh={1.7} c="dimmed" style={{ textAlign: 'justify' }}>
                    {film.overview || "Опис відсутній українською мовою."}
                </Text>
            </Box>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                <CrewItem role="Режисер" people={[director]} />
                <CrewItem role="Сценарій" people={writers} />
                <CrewItem role="Продюсери" people={producers} />
                <CrewItem role="Країна" text={film.production_countries?.map(c => c.name).join(', ')} />
            </SimpleGrid>
        </Stack>
      </Tabs.Panel>

      {/* --- ВКЛАДКА АКТОРІВ (Оновлена) --- */}
      <Tabs.Panel value="cast">
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
            {film.credits?.cast?.slice(0, 12).map(actor => (
                <Paper 
                    key={actor.id} 
                    component={Link}           // Робимо посиланням
                    to={`/actor/${actor.id}`}  // Вказуємо шлях
                    withBorder 
                    radius="md" 
                    p="xs" 
                    shadow="sm"
                    // Додаємо CSS ефекти для краси
                    style={{ textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Group wrap="nowrap">
                        <Avatar 
                            src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : null} 
                            size="lg" radius="xl" 
                        />
                        <Box style={{ overflow: 'hidden' }}>
                            <Text size="sm" fw={700} truncate>{actor.name}</Text>
                            <Text size="xs" c="dimmed" truncate>{actor.character}</Text>
                        </Box>
                    </Group>
                </Paper>
            ))}
        </SimpleGrid>
      </Tabs.Panel>

      <Tabs.Panel value="media">
         {film.images?.backdrops?.length > 0 ? (
            <Carousel slideSize="100%" height={350} slideGap="md" loop withIndicators>
                {film.images.backdrops.slice(0, 10).map((img, index) => (
                    <Carousel.Slide key={index}>
                        <Image 
                            src={`https://image.tmdb.org/t/p/w780${img.file_path}`} 
                            radius="md" 
                            h="100%"
                            fit="cover"
                        />
                    </Carousel.Slide>
                ))}
            </Carousel>
         ) : <Text c="dimmed">Зображення відсутні</Text>}
      </Tabs.Panel>
    </Tabs>
  );
};

export default MovieTabs;