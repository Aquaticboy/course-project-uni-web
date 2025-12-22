import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
    Container, Grid, Image, Title, Text, Box, Button, Stack, Group, Badge, Paper, Rating, Spoiler, Center, Loader, ThemeIcon, Alert 
} from '@mantine/core';
import { 
    IconArrowLeft, IconBook, IconCalendar, IconLanguage, IconFiles, IconExternalLink, IconBook2 
} from '@tabler/icons-react';
import useFetch from '../useFetch';

const BookPage = () => {
    const { id } = useParams();
    const history = useHistory();
    
    const { data: book, isPending, error } = useFetch(`http://localhost:3001/book/${id}`);

    if (isPending) return <Center h="100vh"><Loader size="xl" /></Center>;
    
    if (error || !book) {
        return (
            <Container py="xl" ta="center">
                 <Title>Книгу не знайдено</Title>
                 <Button mt="md" onClick={() => history.push('/')} variant="light">На головну</Button>
            </Container>
        );
    }

    // Логіка доступності читання
    // PARTIAL = частковий доступ, ALL_PAGES = повний доступ, NO_PAGES = недоступно
    const canRead = book.viewability === 'PARTIAL' || book.viewability === 'ALL_PAGES';
    
    // Текст статусу доступу
    const accessText = {
        'NO_PAGES': 'Перегляд недоступний',
        'PARTIAL': 'Доступний уривок',
        'ALL_PAGES': 'Повна версія (Безкоштовно)',
        'UNKNOWN': 'Статус невідомий'
    }[book.viewability] || 'Статус невідомий';

    // Колір статусу
    const accessColor = book.viewability === 'NO_PAGES' ? 'red' : (book.viewability === 'ALL_PAGES' ? 'green' : 'yellow');

    return (
        <Box pb={80} style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Хедер */}
            <Box py="md" mb="xl" bg="white" style={{ borderBottom: '1px solid #eee' }}>
                 <Container size="xl">
                    <Button 
                        variant="subtle" 
                        color="dark" 
                        leftSection={<IconArrowLeft size={20}/>}
                        onClick={() => history.goBack()}
                    >
                        Назад
                    </Button>
                 </Container>
            </Box>

            <Container size="xl">
                <Grid gutter={50}>
                    {/* ЛІВА КОЛОНКА */}
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Stack gap="md">
                            <Paper shadow="xl" radius="md" style={{ overflow: 'hidden', border: '4px solid white' }}>
                                <Image 
                                    src={book.poster_full} 
                                    alt={book.title} 
                                    fallbackSrc="https://placehold.co/400x600?text=No+Cover"
                                />
                            </Paper>

                            <Paper p="md" radius="md" bg="white" shadow="sm" withBorder>
                                <Stack gap="sm">
                                    <InfoRow icon={<IconCalendar size={18}/>} label="Дата" value={book.publishedDate} />
                                    <InfoRow icon={<IconFiles size={18}/>} label="Сторінок" value={book.pageCount} />
                                    <InfoRow icon={<IconLanguage size={18}/>} label="Мова" value={book.language?.toUpperCase()} />
                                    
                                    {book.categories.length > 0 && (
                                        <Box mt="xs">
                                            <Text size="xs" c="dimmed" fw={700} mb={5}>Жанри</Text>
                                            <Group gap={5}>
                                                {book.categories.map((cat, i) => (
                                                    <Badge key={i} color="blue" variant="light" size="sm" style={{textTransform: 'none'}}>
                                                        {cat}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        </Box>
                                    )}
                                </Stack>
                            </Paper>

                            {/* --- БЛОК ЧИТАННЯ --- */}
                            <Paper p="md" radius="md" bg="white" shadow="sm" withBorder>
                                <Stack gap="xs">
                                    <Text size="xs" fw={700} c="dimmed">Доступність для читання:</Text>
                                    <Badge color={accessColor} variant="light" fullWidth size="lg">
                                        {accessText}
                                    </Badge>

                                    {canRead && book.webReaderLink && (
                                        <Button 
                                            component="a" 
                                            href={book.webReaderLink} 
                                            target="_blank" // Відкриваємо в новій вкладці
                                            fullWidth
                                            variant="gradient"
                                            gradient={{ from: 'orange', to: 'red' }}
                                            rightSection={<IconBook2 size={18}/>}
                                            mt="xs"
                                        >
                                            Читати онлайн
                                        </Button>
                                    )}

                                    {/* Якщо не можна читати тут, пропонуємо Google Books */}
                                    {!canRead && book.previewLink && (
                                         <Button 
                                            component="a" 
                                            href={book.previewLink} 
                                            target="_blank"
                                            fullWidth
                                            variant="outline"
                                            color="gray"
                                            rightSection={<IconExternalLink size={16}/>}
                                            mt="xs"
                                        >
                                            Сторінка в Google Books
                                        </Button>
                                    )}
                                </Stack>
                            </Paper>

                        </Stack>
                    </Grid.Col>

                    {/* ПРАВА КОЛОНКА */}
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        <Stack gap="xs" mb="lg">
                            <Title order={1} c="dark">{book.title}</Title>
                            {book.subtitle && <Text size="xl" c="dimmed">{book.subtitle}</Text>}
                            
                            <Text size="lg" fw={500} c="blue">
                                {book.authors.join(', ')}
                            </Text>

                            <Group mt="sm">
                                {book.rating > 0 ? (
                                    <>
                                        <Rating value={book.rating} readOnly fractions={2} />
                                        <Text size="sm" c="dimmed">({book.ratingCount} оцінок)</Text>
                                    </>
                                ) : (
                                    <Badge color="gray" variant="outline">Немає оцінок</Badge>
                                )}
                            </Group>
                        </Stack>

                        <Title order={3} mb="sm" c="dark" display="flex" style={{alignItems: 'center', gap: 10}}>
                            <IconBook size={24} /> Про книгу
                        </Title>
                        
                        <Paper p="xl" radius="md" bg="white" shadow="sm" withBorder>
                             {/* Попередження про мову, якщо опис англійською */}
                            {book.language !== 'uk' && (
                                <Alert variant="light" color="blue" mb="md" title="Інфо">
                                    Опис або текст книги може бути мовою оригіналу ({book.language?.toUpperCase()}), оскільки український переклад відсутній у базі Google.
                                </Alert>
                            )}

                            <Spoiler maxHeight={250} showLabel="Читати далі" hideLabel="Згорнути">
                                <Text lh={1.7} size="md" c="dark" style={{ textAlign: 'justify', whiteSpace: 'pre-line' }}>
                                    {book.description}
                                </Text>
                            </Spoiler>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <Group justify="space-between">
            <Group gap={8}>
                <ThemeIcon size="sm" variant="transparent" c="dimmed">{icon}</ThemeIcon>
                <Text size="sm" c="dimmed">{label}</Text>
            </Group>
            <Text size="sm" fw={500}>{value}</Text>
        </Group>
    );
};

export default BookPage;