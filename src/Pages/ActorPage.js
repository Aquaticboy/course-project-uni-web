import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, Box, Loader, Center, Button, Title, Text, useMantineColorScheme } from '@mantine/core';
import { IconArrowLeft, IconUserX } from '@tabler/icons-react';
import useFetch from '../useFetch';

import ActorSidebar from '../MantineCompon/ActorPage/ActorSidebar';
import ActorHero from '../MantineCompon/ActorPage/ActorHero';
import ActorBio from '../MantineCompon/ActorPage/ActorBio';
import ActorGallery from '../MantineCompon/ActorPage/ActorGallery';
import ActorFilmography from '../MantineCompon/ActorPage/ActorFilmography';

// --- Utils ---
const calculateAgeOrDeath = (birthday, deathday) => {
    if (!birthday) return null;
    const start = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - start.getFullYear();
    const m = end.getMonth() - start.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age--;
    return age;
};

const getGender = (genderCode) => {
    switch (genderCode) {
        case 1: return 'Жіноча';
        case 2: return 'Чоловіча';
        case 3: return 'Небінарна';
        default: return 'Не вказано';
    }
};

const ActorPage = () => {
    const { id } = useParams();
    const history = useHistory(); // Використовуємо history для навігації
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data: actor, error, isPending } = useFetch(`http://localhost:3001/actor/${id}`);

    if (isPending) return <Center h="100vh"><Loader size="xl" color="orange" type="dots" /></Center>;

    if (error || !actor) {
        return (
            <Container py="xl" ta="center" h="100vh" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <IconUserX size={64} color="gray" style={{ margin: '0 auto', marginBottom: 20 }}/>
                <Title c="var(--mantine-color-text)">Актора не знайдено</Title>
                <Button mt="md" onClick={() => history.push('/')} variant="light" color="orange" leftSection={<IconArrowLeft />}>
                    На головну
                </Button>
            </Container>
        );
    }

    // Підготовка даних
    const knownFor = actor.movie_credits?.cast
        ?.sort((a, b) => b.popularity - a.popularity)
        ?.slice(0, 20) || [];

    const age = calculateAgeOrDeath(actor.birthday, actor.deathday);
    const gender = getGender(actor.gender);
    const popularityScore = Math.min(actor.popularity, 100);
    const gallery = actor.images?.profiles?.slice(1, 11) || [];

    return (
        <Box pb={80} style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            
            {/* ФОНОВЕ СВІТІННЯ (GLOW) */}
            {isDark && (
                <div style={{
                    position: 'absolute', top: '-100px', right: '-10%',
                    width: '60%', height: '800px',
                    background: 'radial-gradient(circle, rgba(255, 128, 0, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}

            {/* ХЕДЕР */}
            <Box py="md" mb="xl" style={{ position: 'relative', zIndex: 2 }}>
                <Container size="xl">
                    <Button 
                        onClick={() => history.goBack()} 
                        variant="subtle" 
                        color="gray" 
                        leftSection={<IconArrowLeft />}
                    >
                        Назад
                    </Button>
                </Container>
            </Box>

            <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                <Grid gutter={50}>
                    {/* ЛІВА КОЛОНКА (Сайдбар) */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <ActorSidebar 
                            actor={actor} 
                            age={age} 
                            gender={gender} 
                            socials={actor.external_ids || {}} 
                            isDark={isDark}
                        />
                    </Grid.Col>

                    {/* ПРАВА КОЛОНКА (Контент) */}
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        
                        <ActorHero 
                            name={actor.name} 
                            deathday={actor.deathday} 
                            popularityScore={popularityScore} 
                            popularityRaw={actor.popularity}
                        />

                        <ActorBio 
                            biography={actor.biography} 
                            name={actor.name} 
                            isDark={isDark}
                        />

                        <ActorGallery gallery={gallery} isDark={isDark} />

                        <ActorFilmography movies={knownFor} />

                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default ActorPage;