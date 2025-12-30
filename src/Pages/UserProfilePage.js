import React, { useEffect, useState } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { 
    Container, Title, Text, Avatar, Group, Paper, Grid, Tabs, Loader, Center, AspectRatio, Image, Box, Stack, Card, ThemeIcon, Badge, Divider, useMantineColorScheme, Button 
} from '@mantine/core';
import { IconMovie, IconBook, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import BookmarkButton from '../MantineCompon/BookmarkButton/BookmarkButton';
import FriendButton from '../MantineCompon/FriendButton/FriendButton';

const UserProfilePage = () => {
    const { id } = useParams(); // ID користувача з URL
    const history = useHistory();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [profile, setProfile] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Отримуємо інфо про юзера
                const userRes = await fetch(`http://localhost:3001/users/public/${id}`);
                if (!userRes.ok) throw new Error('User not found');
                const userData = await userRes.json();
                setProfile(userData);

                // 2. Отримуємо його закладки
                const bookRes = await fetch(`http://localhost:3001/bookmarks/public/${id}`);
                const bookData = await bookRes.json();
                setBookmarks(bookData);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Center h="100vh"><Loader size="xl" color="orange" /></Center>;
    if (!profile) return <Center h="100vh"><Text>Користувача не знайдено</Text></Center>;

    const movies = bookmarks.filter(b => b.content_type === 'movie');
    const books = bookmarks.filter(b => b.content_type === 'book');

    return (
        <Box style={{ minHeight: '100vh', paddingBottom: '50px', backgroundColor: 'var(--mantine-color-body)' }}>
            
            {/* ГРАДІЄНТНИЙ ФОН */}
            <Box style={{ 
                height: '200px', 
                background: isDark ? 'linear-gradient(135deg, #1A1B1E 0%, #101113 100%)' : 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                position: 'relative'
            }}>
                 <Container size="xl" pt="md">
                    <Button leftSection={<IconArrowLeft size={16}/>} variant="subtle" color="gray" onClick={() => history.goBack()}>
                        Назад
                    </Button>
                 </Container>
            </Box>

            <Container size="xl">
                
                {/* 1. ІНФО ПРО КОРИСТУВАЧА */}
                <Group justify="space-between" align="flex-end" style={{ marginTop: '-80px', marginBottom: '40px' }}>
                    <Group align="flex-end">
                        <Avatar 
                            src={profile.avatar_url} 
                            size={160} 
                            radius={160} 
                            color="orange"
                            style={{
                                boxShadow: '0 0 20px rgba(0,0,0,0.2)',
                                border: `6px solid ${isDark ? '#1A1B1E' : '#fff'}`
                            }}
                        >
                            <Text fz={60}>{profile.username?.[0]?.toUpperCase()}</Text>
                        </Avatar>
                        
                        <Stack gap={0} mb={10}>
                            <Title order={1}>{profile.username}</Title>
                            <Text c="dimmed">На сайті з {new Date(profile.created_at).toLocaleDateString()}</Text>
                        </Stack>
                    </Group>

                    {/* КНОПКА ДОДАТИ В ДРУЗІ */}
                    <Box mb={10}>
                        <FriendButton targetUserId={profile.id} />
                    </Box>
                </Group>

                <Divider mb="xl" />

                {/* 2. ЗБЕРЕЖЕНІ МАТЕРІАЛИ */}
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                         <Tabs defaultValue="movies" color="orange" variant="pills" radius="xl">
                            <Tabs.List mb="lg">
                                <Tabs.Tab value="movies" leftSection={<IconMovie size={18} />}>
                                    Фільми <Badge color="gray" variant="light" ml={5} circle>{movies.length}</Badge>
                                </Tabs.Tab>
                                <Tabs.Tab value="books" leftSection={<IconBook size={18} />}>
                                    Книги <Badge color="gray" variant="light" ml={5} circle>{books.length}</Badge>
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="movies">
                                {movies.length === 0 ? (
                                    <Text c="dimmed" ta="center" py="xl">Колекція фільмів порожня.</Text>
                                ) : (
                                    <Grid>
                                        {movies.map((item) => (
                                            <Grid.Col key={item.id} span={{ base: 6, sm: 4, md: 4, lg: 3 }}>
                                                <BookmarkCard item={item} type="movie" />
                                            </Grid.Col>
                                        ))}
                                    </Grid>
                                )}
                            </Tabs.Panel>

                            <Tabs.Panel value="books">
                                {books.length === 0 ? (
                                    <Text c="dimmed" ta="center" py="xl">Колекція книг порожня.</Text>
                                ) : (
                                    <Grid>
                                        {books.map((item) => (
                                            <Grid.Col key={item.id} span={{ base: 6, sm: 4, md: 4, lg: 3 }}>
                                                <BookmarkCard item={item} type="book" />
                                            </Grid.Col>
                                        ))}
                                    </Grid>
                                )}
                            </Tabs.Panel>
                        </Tabs>
                    </Grid.Col>
                    
                    {/* ПРАВА КОЛОНКА: Статистика */}
                    <Grid.Col span={{ base: 12, md: 4 }} visibleFrom="md">
                        <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-body)">
                            <Title order={4} mb="md">Статистика</Title>
                            <Stack>
                                <Group justify="space-between">
                                    <Text size="sm">Збережені фільми</Text>
                                    <Text fw={700}>{profile.stats?.movie_count || 0}</Text>
                                </Group>
                                <Divider />
                                <Group justify="space-between">
                                    <Text size="sm">Збережені книги</Text>
                                    <Text fw={700}>{profile.stats?.book_count || 0}</Text>
                                </Group>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>

            </Container>
        </Box>
    );
};

// Міні-картка (Така сама як в ProfilePage, але без кнопки видалення, бо це чужий профіль)
const BookmarkCard = ({ item, type }) => {
    const link = type === 'movie' ? `/MoviePage/${item.content_id}` : `/BookPage/${item.content_id}`;
    
    // Тут логіка отримання постера (можна винести в utils)
    const getPosterUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/w500${path}`;
    };

    return (
        <Card 
            padding="0" radius="md" withBorder 
            component={Link} to={link}
            style={{ overflow: 'hidden', transition: 'transform 0.2s', textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <AspectRatio ratio={2/3}>
                <Image src={getPosterUrl(item.poster_path)} fallbackSrc="https://placehold.co/400x600?text=No+Image" />
            </AspectRatio>
            <Box p={5}>
                <Text size="sm" fw={600} truncate c="var(--mantine-color-text)">{item.title}</Text>
            </Box>
            
            {/* ТУТ МОЖНА БУЛО Б ДОДАТИ КНОПКУ ЗАКЛАДКИ, ЩОБ СОБІ ДОДАТИ */}
            <Box pos="absolute" top={5} right={5}>
                <BookmarkButton item={{...item, id: item.content_id}} type={type} />
            </Box>
        </Card>
    );
};

export default UserProfilePage;