import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Box, Container, Stack, Text, Title, Grid, Button, Overlay 
    // useMantineColorScheme більше не потрібен тут, бо ми юзаємо CSS змінні
} from '@mantine/core';
import { IconPlayerPlay, IconInfoCircle } from '@tabler/icons-react';

const HeroSection = ({ movie }) => {
    // Ми прибрали хук useMantineColorScheme, бо CSS зробить це краще

    if (!movie) return null;

    return (
        <Box 
            style={{ 
                position: 'relative', 
                height: '80vh', 
                width: '100%',
                backgroundImage: `url(${movie.backdrop_full_url || movie.poster_full_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            {/* Темний оверлей (затемнення всієї картинки) */}
            <Overlay 
                gradient="linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)" 
                opacity={1} 
                zIndex={1} 
            />
            
            {/* --- ВИПРАВЛЕННЯ ТУТ --- */}
            {/* Нижній градієнт: плавний перехід у колір фону сайту */}
            <Box 
                style={{
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '150px', // Можна збільшити до 250px, якщо перехід занадто різкий
                    // Використовуємо var(--mantine-color-body), щоб градієнт завжди збігався з фоном сайту
                    background: 'linear-gradient(to top, var(--mantine-color-body), transparent)',
                    zIndex: 2,
                    pointerEvents: 'none' // Щоб градієнт не блокував кліки (про всяк випадок)
                }} 
            />

            <Container size="xl" style={{ position: 'relative', zIndex: 3, width: '100%' }}>
                <Stack gap="md" maw={600}>
                    <Text c="orange" fw={700} tt="uppercase" ls={2}>
                        🔥 Топ тижня
                    </Text>

                    {/* Текст заголовка */}
                    <Title order={1} style={{ fontSize: '3.5rem', lineHeight: 1.1, color: 'white' }}>
                        {movie.title}
                    </Title>

                    {/* Опис */}
                    <Text c="gray.3" size="lg" lineClamp={3}>
                        {movie.overview}
                    </Text>

                    <Grid mt="lg">
                            <Button 
                                component={Link} 
                                to={`/movieInfoByID/${movie.id}`}
                                size="lg" color="orange" radius="md" 
                                leftSection={<IconPlayerPlay size={20} />}
                            >
                                Дивитися трейлер
                            </Button>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
};

export default HeroSection;