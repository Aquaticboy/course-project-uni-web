import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Box, Loader, Center, Button, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import useFetch from '../useFetch';

// Імпортуємо наші нові компоненти
import ActorSidebar from '../MantineCompon/ActorPage/ActorSidebar';
import ActorHero from '../MantineCompon/ActorPage/ActorHero';
import ActorBio from '../MantineCompon/ActorPage/ActorBio';
import ActorGallery from '../MantineCompon/ActorPage/ActorGallery';
import ActorFilmography from '../MantineCompon/ActorPage/ActorFilmography';

// Функції розрахунків залишаємо тут або можеш винести в utils.js
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
    const { data: actor, error, isPending } = useFetch(`http://localhost:3001/actor/${id}`);

    if (isPending) return <Center h="100vh"><Loader size="xl" variant="bars" /></Center>;

    if (error || !actor) {
        return (
            <Container py="xl" ta="center">
                <Title>Актора не знайдено</Title>
                <Button component="a" href="/" mt="md" leftSection={<IconArrowLeft />}>На головну</Button>
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
        <Box pb={80} bg="gray.0" style={{ minHeight: '100vh' }}>
            <Box bg="gray.1" py="md" mb="xl" style={{borderBottom: '1px solid #e0e0e0'}}>
                 <Container size="xl">
                    <Button component="a" href="/" variant="subtle" color="dark" leftSection={<IconArrowLeft />}>
                        На головну
                    </Button>
                 </Container>
            </Box>

            <Container size="xl">
                <Grid gutter={50}>
                    {/* ЛІВА КОЛОНКА */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <ActorSidebar 
                            actor={actor} 
                            age={age} 
                            gender={gender} 
                            socials={actor.external_ids || {}} 
                        />
                    </Grid.Col>

                    {/* ПРАВА КОЛОНКА */}
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
                        />

                        <ActorGallery gallery={gallery} />

                        <ActorFilmography movies={knownFor} />

                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default ActorPage;