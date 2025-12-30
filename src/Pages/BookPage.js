import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
    Container, Grid, Image, Title, Text, Box, Button, Stack, Group, Badge, Paper, Rating, Spoiler, Center, Loader, ThemeIcon, Alert, useMantineColorScheme 
} from '@mantine/core';
import { 
    IconArrowLeft, IconBook, IconCalendar, IconLanguage, IconFiles, IconExternalLink, IconBook2, IconInfoCircle 
} from '@tabler/icons-react';
import useFetch from '../useFetch';

const BookPage = () => {
    const { id } = useParams();
    const history = useHistory();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    
    const { data: book, isPending, error } = useFetch(`http://localhost:3001/book/${id}`);

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
                <IconBook size={64} color="gray" style={{ margin: '0 auto', marginBottom: 20 }} />
                <Title order={2} c="var(--mantine-color-text)">Книгу не знайдено</Title>
                <Text c="dimmed" mb="lg">Можливо, посилання застаріло або книгу було видалено.</Text>
                <Button onClick={() => history.push('/')} variant="light" color="orange">На головну</Button>
            </Container>
        );
    }

    // --- ЛОГІКА ДОСТУПУ ---
    const canRead = book.viewability === 'PARTIAL' || book.viewability === 'ALL_PAGES';
    
    const accessText = {
        'NO_PAGES': 'Перегляд недоступний',
        'PARTIAL': 'Доступний уривок',
        'ALL_PAGES': 'Повна версія (Free)',
        'UNKNOWN': 'Статус невідомий'
    }[book.viewability] || 'Статус невідомий';

    const accessColor = book.viewability === 'NO_PAGES' ? 'red' : (book.viewability === 'ALL_PAGES' ? 'green' : 'yellow');

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
                    background: 'radial-gradient(circle, rgba(255, 169, 77, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}

            {/* ХЕДЕР З КНОПКОЮ НАЗАД */}
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
                    
                    {/* --- ЛІВА КОЛОНКА (ПОСТЕР + ІНФО) --- */}
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

                            {/* ІНФОРМАЦІЙНИЙ БЛОК */}
                            <Paper p="md" radius="md" shadow="sm" style={glassPaperStyle}>
                                <Stack gap="sm">
                                    <InfoRow icon={<IconCalendar size={18}/>} label="Дата" value={book.publishedDate} />
                                    <InfoRow icon={<IconFiles size={18}/>} label="Сторінок" value={book.pageCount} />
                                    <InfoRow icon={<IconLanguage size={18}/>} label="Мова" value={book.language?.toUpperCase()} />
                                    
                                    {book.categories.length > 0 && (
                                        <Box mt="xs">
                                            <Text size="xs" c="dimmed" fw={700} mb={5}>ЖАНРИ</Text>
                                            <Group gap={5}>
                                                {book.categories.map((cat, i) => (
                                                    <Badge 
                                                        key={i} 
                                                        color="orange" 
                                                        variant="light" 
                                                        size="sm" 
                                                        radius="sm"
                                                        style={{textTransform: 'none'}}
                                                    >
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>

                            {/* БЛОК ДІЙ (ЧИТАННЯ) */}
                            <Paper p="md" radius="md" shadow="sm" style={glassPaperStyle}>
                                <Stack gap="xs">
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Статус доступу</Text>
                                    <Badge color={accessColor} variant="outline" fullWidth size="lg" radius="sm">
                                        {accessText}
                                    </Badge>

                                    {canRead && book.webReaderLink && (
                                        <Button 
                                            component="a" 
                                            href={book.webReaderLink} 
                                            target="_blank" 
                                            fullWidth
                                            variant="gradient"
                                            gradient={{ from: 'orange', to: 'red' }}
                                            rightSection={<IconBook2 size={18}/>}
                                            mt="sm"
                                            radius="md"
                                        >
                                            Читати онлайн
                                        </Button>
                                    )}

                                    {!canRead && book.previewLink && (
                                         <Button 
                                            component="a" 
                                            href={book.previewLink} 
                                            target="_blank"
                                            fullWidth
                                            variant="default"
                                            rightSection={<IconExternalLink size={16}/>}
                                            mt="sm"
                                            radius="md"
                                        >
                                            Google Books
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>

                        </Stack>
                    </Grid.Col>

                    {/* --- ПРАВА КОЛОНКА (ОПИС) --- */}
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        <Stack gap="xs" mb="xl">
                            <Title order={1} c="var(--mantine-color-text)" style={{ fontSize: '2.5rem' }}>
                                {book.title}
                            </Title>
                            
                            {book.subtitle && (
                                <Text size="xl" c="dimmed" fs="italic">
                                    {book.subtitle}
                                </Text>
                            )}
                            
                            <Text size="lg" fw={600} c="orange" mt="xs">
                                {book.authors.join(', ')}
                            </Text>

                            <Group mt="md">
                                {book.rating > 0 ? (
                                    <Group gap="xs">
                                        <Rating value={book.rating} readOnly fractions={2} size="md" />
                                        <Text size="sm" c="dimmed" style={{ marginTop: 4 }}>
                                            ({book.ratingCount} оцінок)
                                        </Text>
                                    </Group>
                                ) : (
                                    <Badge color="gray" variant="dot">Немає оцінок</Badge>
                                )}
                            </Group>
                        </Stack>

                        <Paper p="xl" radius="lg" shadow="sm" style={glassPaperStyle}>
                            <Title order={3} mb="md" c="var(--mantine-color-text)" display="flex" style={{alignItems: 'center', gap: 10}}>
                                <IconBook size={24} color="var(--mantine-color-orange-filled)"/> 
                                Про книгу
                            </Title>
                            
                            {book.language !== 'uk' && (
                                <Alert variant="light" color="blue" mb="lg" radius="md" icon={<IconInfoCircle />}>
                                    Опис доступний мовою оригіналу ({book.language?.toUpperCase()}).
                                </Alert>
                            )}

                            <Spoiler maxHeight={200} showLabel="Читати далі" hideLabel="Згорнути">
                                <Text 
                                    lh={1.8} 
                                    size="md" 
                                    c="var(--mantine-color-text)" 
                                    style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}
                                >
                                    {/* Видаляємо HTML теги, якщо вони приходять з API */}
                                    {book.description?.replace(/<[^>]*>?/gm, '') || "Опис відсутній."}
                                </Text>
                            </Spoiler>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

// Допоміжний компонент для рядків інформації
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

export default BookPage;