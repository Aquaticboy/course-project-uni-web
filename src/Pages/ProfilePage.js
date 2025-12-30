import React, { useEffect, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { 
    Container, Title, Text, Avatar, Group, Paper, Grid, Tabs, Loader, Center, Button, AspectRatio, Image, Box, Stack, Card, ThemeIcon, Badge, Divider, useMantineColorScheme
} from '@mantine/core';
import { IconMovie, IconBook, IconLogout, IconSearch, IconHeartFilled } from '@tabler/icons-react';
import { useAuth } from '../Context/AuthContext'; 

import BookmarkButton from '../MantineCompon/BookmarkButton/BookmarkButton';

const ProfilePage = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const history = useHistory();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Отримуємо тему для налаштування кольорів
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        if (!authLoading && !user) history.push('/auth');
    }, [authLoading, user, history]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:3001/bookmarks', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBookmarks(data);
                }
            } catch (err) {
                console.error("Failed to fetch bookmarks", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarks();
    }, [user]);

    if (authLoading || loading) return <Center h="100vh"><Loader size="xl" variant="bars" color="orange" /></Center>;
    if (!user) return null;

    const movies = bookmarks.filter(b => b.content_type === 'movie');
    const books = bookmarks.filter(b => b.content_type === 'book');

    return (
        <Box 
            style={{ 
                minHeight: '100vh', 
                paddingBottom: '50px', 
                backgroundColor: 'var(--mantine-color-body)',
                position: 'relative',
                overflow: 'hidden' // Щоб світіння не вилазило
            }}
        >
            {/* --- АТМОСФЕРНИЙ ГРАДІЄНТ (GLOW) --- */}
            {isDark ? (
                 <div style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1000px',
                    height: '800px',
                    // Помаранчеве світіння для темної теми
                    background: 'radial-gradient(circle, rgba(255, 128, 0, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
            ) : (
                <div style={{
                    position: 'absolute',
                    top: '-200px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '1000px',
                    height: '800px',
                    // Легке синє/сіре світіння для світлої теми (щоб не було скучно білим)
                    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 60%)', 
                    filter: 'blur(80px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
            )}

            <Container size="xl" py="xl" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* 1. ІНФО ПРО КОРИСТУВАЧА */}
                <Group justify="space-between" align="center" mb={50}>
                    <Group>
                        <Box style={{ position: 'relative' }}>
                            <Avatar 
                                src={user.avatar} 
                                size={120} 
                                radius={120} 
                                color="orange"
                                style={{
                                    boxShadow: isDark ? '0 0 20px rgba(0,0,0,0.5)' : '0 0 10px rgba(0,0,0,0.1)',
                                    border: `4px solid ${isDark ? '#2C2E33' : '#fff'}`
                                }}
                            >
                                <Text fz={40}>{user.username?.[0]?.toUpperCase()}</Text>
                            </Avatar>
                            {/* <ThemeIcon 
                                size={30} 
                                radius="xl" 
                                color="red" 
                                variant="filled" 
                                style={{ 
                                    position: 'absolute', 
                                    bottom: 0, 
                                    right: 0, 
                                    border: `4px solid ${isDark ? '#1A1B1E' : '#F8F9FA'}` 
                                }}
                            >
                                <IconHeartFilled size={16} /> */}
                            {/* </ThemeIcon> */}
                        </Box>
                        
                        <Stack gap={5}>
                            <Title order={1} c={isDark ? 'white' : 'black'}>{user.username}</Title>
                            <Text c="dimmed" size="lg">{user.email}</Text>
                        </Stack>
                    </Group>

                    <Button 
                        variant="light" 
                        color="red" 
                        leftSection={<IconLogout size={20} />}
                        onClick={logout}
                        radius="md"
                    >
                        Вийти
                    </Button>
                </Group>

                <Divider mb="xl" color={isDark ? 'dark.4' : 'gray.3'} />

                {/* 2. ОСНОВНИЙ КОНТЕНТ */}
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                         <Tabs 
                            defaultValue="movies" 
                            color="orange" 
                            variant="pills" 
                            radius="xl"
                            // --- ВИПРАВЛЕННЯ КОЛЬОРІВ ТАБІВ ---
                            styles={{
                                tab: {
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    border: isDark ? '1px solid #373A40' : '1px solid #dee2e6',
                                    backgroundColor: 'transparent',
                                    // У світлій темі текст тепер чорний (black), у темній - білий (white)
                                    color: isDark ? 'var(--mantine-color-white)' : 'var(--mantine-color-black)',
                                    
                                    // Стилі для АКТИВНОЇ кнопки
                                    '&[data-active]': {
                                        backgroundColor: 'var(--mantine-color-orange-filled)',
                                        color: 'var(--mantine-color-white)', // Текст завжди білий на помаранчевому
                                        borderColor: 'var(--mantine-color-orange-filled)',
                                    },
                                    '&:hover': {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                    }
                                },
                                list: { gap: '10px' }
                            }}
                         >
                            <Tabs.List mb="lg">
                                <Tabs.Tab value="movies" leftSection={<IconMovie size={18} />} py="md" px="xl">
                                    Фільми <Badge color={isDark ? "gray" : "dark"} variant="light" ml={5} circle>{movies.length}</Badge>
                                </Tabs.Tab>
                                <Tabs.Tab value="books" leftSection={<IconBook size={18} />} py="md" px="xl">
                                    Книги <Badge color={isDark ? "gray" : "dark"} variant="light" ml={5} circle>{books.length}</Badge>
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="movies">
                                {movies.length === 0 ? (
                                    <EmptyState type="фільмів" link="/MovieSearch" isDark={isDark} />
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
                                    <EmptyState type="книг" link="/BookSearch" isDark={isDark} />
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
                        <Paper 
                            withBorder 
                            p="xl" 
                            radius="md" 
                            style={{ 
                                backgroundColor: isDark ? '#25262B' : '#fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Title order={4} mb="md" c={isDark ? 'white' : 'black'}>Ваша активність</Title>
                            <Stack>
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon color="blue" variant="light"><IconMovie size={18} /></ThemeIcon>
                                        <Text size="sm" c={isDark ? 'dimmed' : 'black'}>Збережені фільми</Text>
                                    </Group>
                                    <Text fw={700} c={isDark ? 'white' : 'black'}>{movies.length}</Text>
                                </Group>
                                <Divider color={isDark ? 'dark.4' : 'gray.2'} />
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon color="green" variant="light"><IconBook size={18} /></ThemeIcon>
                                        <Text size="sm" c={isDark ? 'dimmed' : 'black'}>Збережені книги</Text>
                                    </Group>
                                    <Text fw={700} c={isDark ? 'white' : 'black'}>{books.length}</Text>
                                </Group>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>

            </Container>
        </Box>
    );
};

// --- ІНШІ КОМПОНЕНТИ (EmptyState, BookmarkCard) ---
const EmptyState = ({ type, link, isDark }) => (
    <Paper 
        withBorder 
        p={50} 
        radius="md" 
        ta="center" 
        style={{ 
            backgroundColor: 'transparent', 
            borderStyle: 'dashed',
            borderColor: isDark ? '#373A40' : '#dee2e6' 
        }}
    >
        <ThemeIcon size={60} radius={60} color="gray" variant="light" mb="md">
            <IconSearch size={30} />
        </ThemeIcon>
        <Title order={3} mb="xs" c={isDark ? 'white' : 'black'}>Поки що пусто</Title>
        <Text c="dimmed" mb="xl">Ви ще не додали жодних {type} до своєї колекції.</Text>
        <Button component={Link} to={link} variant="light" color="orange" size="md">
            Знайти {type}
        </Button>
    </Paper>
);

const BookmarkCard = ({ item, type }) => {
    const link = type === 'movie' ? `/MoviePage/${item.content_id}` : `/BookPage/${item.content_id}`;

    const getPosterUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/w500${path}`;
    };

    return (
        <Card 
            padding="0" 
            radius="md" 
            withBorder 
            style={{ 
                overflow: 'hidden', 
                transition: 'all 0.3s ease', 
                cursor: 'pointer',
                backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <Box pos="relative">
                <Link to={link} style={{ textDecoration: 'none' }}>
                    <AspectRatio ratio={2/3}>
                        <Image 
                            src={getPosterUrl(item.poster_path)} 
                            alt={item.title}
                            fallbackSrc="https://placehold.co/400x600?text=No+Image"
                        />
                    </AspectRatio>
                    <Box 
                        style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                            pointerEvents: 'none'
                        }} 
                    />
                    <Text pos="absolute" bottom={10} left={10} right={10} size="sm" fw={600} c="white" lineClamp={2} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {item.title}
                    </Text>
                </Link>
                <Box pos="absolute" top={8} right={8}>
                    <Paper shadow="sm" radius="md" p={2} style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                        <BookmarkButton item={{ ...item, id: item.content_id }} type={type} />
                    </Paper>
                </Box>
            </Box>
        </Card>
    );
};

export default ProfilePage;