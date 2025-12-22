import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Container, Grid, Image, Title, Text, Box, Button, Stack, Group, Badge, Paper, Spoiler, Center, Loader } from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconExternalLink } from '@tabler/icons-react';
import useFetch from '../useFetch';

const BookPageOL = () => {
    const { id } = useParams();
    const history = useHistory();
    
    // Запит до нашого нового OL ендпоінту
    const { data: book, isPending, error } = useFetch(`http://localhost:3001/book/ol/${id}`);

    if (isPending) return <Center h="100vh"><Loader size="xl" /></Center>;
    if (error || !book) return (
        <Container py="xl" ta="center">
            <Title>Книгу не знайдено</Title>
            <Button mt="md" onClick={() => history.push('/')}>На головну</Button>
        </Container>
    );

    return (
        <Box pb={80} style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Box py="md" mb="xl" bg="white" style={{ borderBottom: '1px solid #eee' }}>
                 <Container size="xl">
                    <Button variant="subtle" color="dark" leftSection={<IconArrowLeft size={20}/>} onClick={() => history.goBack()}>
                        Назад
                    </Button>
                 </Container>
            </Box>

            <Container size="xl">
                <Grid gutter={50}>
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Stack gap="md">
                            <Paper shadow="xl" radius="md" style={{ overflow: 'hidden', border: '4px solid white' }}>
                                <Image 
                                    src={book.poster_full} 
                                    alt={book.title} 
                                    fallbackSrc="https://placehold.co/400x600?text=No+Cover" 
                                />
                            </Paper>
                            
                            <Button 
                                component="a" 
                                href={book.previewLink} 
                                target="_blank" 
                                fullWidth 
                                variant="outline" 
                                color="orange" 
                                rightSection={<IconExternalLink size={16}/>}
                            >
                                Дивитись на Open Library
                            </Button>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        <Stack gap="xs" mb="lg">
                            <Title order={1} c="dark">{book.title}</Title>
                            <Text size="lg" fw={500} c="blue">{book.authors.join(', ')}</Text>
                            <Group gap={5} c="dimmed">
                                <IconCalendar size={18} />
                                <Text>{book.publishedDate}</Text>
                            </Group>
                        </Stack>

                        <Title order={3} mb="sm" c="dark">Опис</Title>
                        <Paper p="xl" radius="md" bg="white" shadow="sm" withBorder>
                            <Spoiler maxHeight={250} showLabel="Читати далі" hideLabel="Згорнути">
                                <Text lh={1.7} size="md" c="dark" style={{ textAlign: 'justify' }}>
                                    {book.description || "Опис відсутній англійською мовою."}
                                </Text>
                            </Spoiler>
                        </Paper>

                        {book.categories.length > 0 && (
                            <Box mt="lg">
                                <Title order={4} mb="sm">Теги (Subjects)</Title>
                                <Group gap={5}>
                                    {book.categories.slice(0, 15).map((cat, i) => (
                                        <Badge key={i} color="gray" variant="light" style={{textTransform: 'none'}}>{cat}</Badge>
                                    ))}
                                </Group>
                            </Box>
                        )}
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
};

export default BookPageOL;