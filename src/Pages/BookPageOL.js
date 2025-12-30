import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
    Container, Grid, Image, Title, Text, Box, Button, Stack, Group, Badge, Paper, Spoiler, Center, Loader, ThemeIcon, useMantineColorScheme 
} from '@mantine/core';
import { 
    IconArrowLeft, IconCalendar, IconExternalLink, IconBook, IconBuildingArch, IconTags 
} from '@tabler/icons-react';
import useFetch from '../useFetch';

const BookPageOL = () => {
    const { id } = useParams();
    const history = useHistory();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    
    // Запит до Open Library ендпоінту
    const { data: book, isPending, error } = useFetch(`http://localhost:3001/book/ol/${id}`);

    // --- СТАН ЗАВАНТАЖЕННЯ ---
    if (isPending) {
        return (
            <Center h="100vh">
                <Loader size="xl" color="orange" type="dots" />
            </Center>
        );
    }
    
    // --- СТАН ПОМИЛКИ ---
    if (error || !book) {
        return (
            <Container py="xl" ta="center" h="100vh" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <IconBuildingArch size={64} color="gray" style={{ margin: '0 auto', marginBottom: 20 }} />
                <Title order={2} c="var(--mantine-color-text)">Книгу не знайдено</Title>
                <Text c="dimmed" mb="lg">Можливо, ID книги некоректний або дані відсутні в Open Library.</Text>
                <Button onClick={() => history.push('/')} variant="light" color="orange">На головну</Button>
            </Container>
        );
    }

    // Стиль для карток (Glassmorphism)
    const glassPaperStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
    };

    return (
        <Box pb={80} style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            
            {/* 1. ФОНОВЕ СВІТІННЯ (GLOW) */}
            {isDark && (
                <div style={{
                    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                    width: '100%', height: '800px',
                    // Використовуємо трохи інший відтінок для Open Library (бірюзово-зелений або лишаємо помаранчевий для єдності)
                    // Давайте залишимо помаранчевий, щоб сайт був в одному стилі:
                    background: 'radial-gradient(circle, rgba(255, 169, 77, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}

            {/* ХЕДЕР */}
            <Box py="md" mb="xl" style={{ position: 'relative', zIndex: 2 }}>
                 <Container size="xl">
                    <Button 
                        variant="subtle" 
                        color="gray" 
                        leftSection={<IconArrowLeft size={20}/>}
                        onClick={() => history.goBack()}
                    >
                        Назад
                    </Button>
                 </Container>
            </Box>

            <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                <Grid gutter={50}>
                    
                    {/* --- ЛІВА КОЛОНКА --- */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Stack gap="md">
                            {/* ПОСТЕР */}
                            <Paper 
                                shadow="xl" 
                                radius="md" 
                                style={{ 
                                    overflow: 'hidden', 
                                    border: isDark ? '4px solid rgba(255,255,255,0.1)' : '4px solid white' 
                                }}
                            >
                                <Image 
                                    src={book.poster_full} 
                                    alt={book.title} 
                                    fallbackSrc="https://placehold.co/400x600?text=No+Cover" 
                                />
                            </Paper>
                            
                            {/* ІНФО БЛОК */}
                            <Paper p="md" radius="md" shadow="sm" style={glassPaperStyle}>
                                <Stack gap="sm">
                                    <InfoRow icon={<IconCalendar size={18}/>} label="Дата публікації" value={book.publishedDate} />
                                    {/* В OL часто є дані про видавців, можна додати сюди якщо API повертає */}
                                </Stack>
                            </Paper>

                            {/* КНОПКА ДІЇ */}
                            <Button 
                                component="a" 
                                href={book.previewLink} 
                                target="_blank" 
                                fullWidth 
                                size="md"
                                variant="gradient"
                                gradient={{ from: 'orange', to: 'yellow', deg: 90 }}
                                rightSection={<IconExternalLink size={18}/>}
                                radius="md"
                            >
                                Дивитись на Open Library
                            </Button>
                        </Stack>
                    </Grid.Col>

                    {/* --- ПРАВА КОЛОНКА --- */}
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        <Stack gap="xs" mb="xl">
                            {/* ЗАГОЛОВОК */}
                            <Title order={1} c="var(--mantine-color-text)" style={{ fontSize: '2.5rem' }}>
                                {book.title}
                            </Title>
                            
                            {/* АВТОРИ */}
                            <Text size="lg" fw={600} c="orange" mt="xs">
                                {book.authors && book.authors.length > 0 ? book.authors.join(', ') : 'Автор невідомий'}
                            </Text>

                            {/* Джерело даних */}
                            <Group gap={5} mt="xs">
                                <Badge variant="outline" color="gray" leftSection={<IconBuildingArch size={12}/>}>
                                    Open Library Data
                                </Badge>
                            </Group>
                        </Stack>

                        {/* ОПИС */}
                        <Paper p="xl" radius="lg" shadow="sm" mb="lg" style={glassPaperStyle}>
                            <Title order={3} mb="md" c="var(--mantine-color-text)" display="flex" style={{alignItems: 'center', gap: 10}}>
                                <IconBook size={24} color="var(--mantine-color-orange-filled)"/> 
                                Опис
                            </Title>
                            <Spoiler maxHeight={250} showLabel="Читати далі" hideLabel="Згорнути">
                                <Text lh={1.8} size="md" c="var(--mantine-color-text)" style={{ textAlign: 'justify' }}>
                                    {book.description || "На жаль, детальний опис для цієї книги відсутній у базі Open Library."}
                                </Text>
                            </Spoiler>
                        </Paper>

                        {/* ТЕГИ (SUBJECTS) */}
                        {book.categories && book.categories.length > 0 && (
                            <Paper p="xl" radius="lg" shadow="sm" style={glassPaperStyle}>
                                <Title order={4} mb="md" c="dimmed" display="flex" style={{alignItems: 'center', gap: 10}}>
                                    <IconTags size={20} /> Теми та Суб'єкти
                                </Title>
                                <Group gap={8}>
                                    {book.categories.slice(0, 15).map((cat, i) => (
                                        <Badge 
                                            key={i} 
                                            color="gray" 
                                            variant={isDark ? "light" : "outline"} 
                                            size="md"
                                            radius="sm"
                                            style={{ textTransform: 'none', fontWeight: 500 }}
                                        >
                                            {cat}
                                        </Badge>
                                    ))}
                                    {book.categories.length > 15 && (
                                        <Badge variant="transparent" c="dimmed">
                                            +{book.categories.length - 15} ще...
                                        </Badge>
                                    )}
                                </Group>
                            </Paper>
                        )}
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

// Допоміжний компонент (такий самий як в BookPage)
const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <Group justify="space-between">
            <Group gap={8}>
                <ThemeIcon size="sm" variant="transparent" c="orange">{icon}</ThemeIcon>
                <Text size="sm" c="dimmed">{label}</Text>
            </Group>
            <Text size="sm" fw={600} c="var(--mantine-color-text)">{value}</Text>
        </Group>
    );
};

export default BookPageOL;