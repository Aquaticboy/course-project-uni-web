import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Container, Title, Tabs, Avatar, Group, Text, Button, Paper, Stack, TextInput, Loader, Center, Badge, useMantineColorScheme, ThemeIcon, Box, rem 
} from '@mantine/core';
import { IconSearch, IconUserCheck, IconUsers, IconArrowRight, IconUserPlus, IconMoodEmpty } from '@tabler/icons-react';
import { useAuth } from '../Context/AuthContext'; 

const FriendsPage = () => {
    const { user } = useAuth();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const [friends, setFriends] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    
    // Стейт для пошуку
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Завантаження даних
    useEffect(() => {
        if (user) {
            fetchAll();
        }
    }, [user]);

    const fetchAll = () => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        fetch('http://localhost:3001/friends/list', { headers })
            .then(res => res.json()).then(setFriends);
        
        fetch('http://localhost:3001/friends/requests/received', { headers })
            .then(res => res.json()).then(setReceived);

        fetch('http://localhost:3001/friends/requests/sent', { headers })
            .then(res => res.json()).then(setSent);
    };

    const handleAccept = async (relationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:3001/friends/accept', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ relationId })
            });
            fetchAll(); 
        } catch (err) { console.error(err); }
    };

    const handleRemove = async (relationId) => {
        if (!window.confirm('Ви впевнені?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:3001/friends/remove/${relationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/users/search?q=${searchQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSearchResults(data);
        } catch (err) { console.error(err); }
        finally { setIsSearching(false); }
    };

    if (!user) return null;

    const EmptyState = ({ text, icon: Icon }) => (
        <Center py={60}>
            <Stack align="center" gap="xs">
                <ThemeIcon size={60} variant="light" color="gray" radius="xl">
                    <Icon size={30} />
                </ThemeIcon>
                <Text c="dimmed" size="lg">{text}</Text>
            </Stack>
        </Center>
    );

    return (
        <Box style={{ 
            minHeight: '100vh', 
            backgroundColor: 'var(--mantine-color-body)',
            position: 'relative', 
            overflow: 'hidden'
        }}>
            
            {/* ГРАДІЄНТНИЙ ФОН */}
            {isDark && (
                <div style={{
                    position: 'absolute', top: '-150px', left: '50%', transform: 'translateX(-50%)',
                    width: '100%', maxWidth: '1200px', height: '800px',
                    background: 'radial-gradient(circle, rgba(255, 128, 0, 0.15) 0%, transparent 70%)',
                    filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}

            <Container size="md" py="xl" style={{ position: 'relative', zIndex: 1 }}>
                <Group justify="space-between" mb="xl" align="center">
                    <Title order={2}>Друзі та Заявки</Title>
                </Group>

                {/* --- ОНОВЛЕНІ ТАБИ --- */}
                <Tabs defaultValue="friends" color="orange" variant="pills" radius="xl">
    
    <Paper 
        p={6} 
        radius="xl" 
        withBorder={!isDark} 
        bg={isDark ? 'rgba(0,0,0,0.3)' : 'white'} 
        mb="xl"
        shadow="sm"
    >
        <Tabs.List grow style={{ border: 'none' }}>
            
            {/* 1. МОЇ ДРУЗІ */}
            <Tabs.Tab 
                value="friends" 
                py="md" // Збільшили висоту кліку для пальців
                leftSection={<IconUserCheck size={20} />}
            >
                {/* ВИПРАВЛЕННЯ: Використовуємо Group для рівного розташування */}
                <Group gap={8} align="center" wrap="nowrap">
                    <span>Мої друзі</span>
                    {friends.length > 0 && (
                        <Badge 
                            circle 
                            size="18px" // Фіксований розмір, щоб було рівно
                            color="orange" 
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {friends.length}
                        </Badge>
                    )}
                </Group>
            </Tabs.Tab>
            
            {/* 2. ВХІДНІ */}
            <Tabs.Tab 
                value="received" 
                py="md"
                leftSection={<IconUsers size={20} />}
            >
                <Group gap={8} align="center" wrap="nowrap">
                    <span>Вхідні</span>
                    {received.length > 0 && (
                        <Badge 
                            circle 
                            size="18px" 
                            color="red"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {received.length}
                        </Badge>
                    )}
                </Group>
            </Tabs.Tab>
            
            {/* 3. НАДІСЛАНІ */}
            <Tabs.Tab 
                value="sent" 
                py="md"
                leftSection={<IconArrowRight size={20} />}
            >
                <Group gap={8} align="center" wrap="nowrap">
                    <span>Надіслані</span>
                    {sent.length > 0 && (
                        <Badge 
                            circle 
                            size="18px" 
                            color="gray"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            {sent.length}
                        </Badge>
                    )}
                </Group>
            </Tabs.Tab>
            
            {/* 4. ПОШУК */}
            <Tabs.Tab 
                value="search" 
                py="md"
                leftSection={<IconSearch size={20} />}
            >
                <span style={{ fontWeight: 500 }}>Пошук</span>
            </Tabs.Tab>

        </Tabs.List>
    </Paper>

                    {/* ВМІСТ ВКЛАДОК */}
                    <Tabs.Panel value="friends">
                        {friends.length === 0 ? <EmptyState text="Список друзів порожній" icon={IconMoodEmpty} /> : (
                            <Stack>
                                {friends.map(f => (
                                    <UserRow key={f.id} user={f} isDark={isDark}>
                                        <Button component={Link} to={`/user/${f.id}`} variant="light" color="orange" size="sm" radius="md">
                                            Профіль
                                        </Button>
                                        <Button color="red" variant="subtle" size="sm" onClick={() => handleRemove(f.relation_id)}>
                                            Видалити
                                        </Button>
                                    </UserRow>
                                ))}
                            </Stack>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="received">
                        {received.length === 0 ? <EmptyState text="Немає нових заявок" icon={IconUsers} /> : (
                            <Stack>
                                {received.map(req => (
                                    <UserRow key={req.id} user={req} isDark={isDark}>
                                        <Button color="green" size="sm" radius="md" onClick={() => handleAccept(req.relation_id)}>
                                            Прийняти
                                        </Button>
                                        <Button color="red" variant="subtle" size="sm" onClick={() => handleRemove(req.relation_id)}>
                                            Відхилити
                                        </Button>
                                    </UserRow>
                                ))}
                            </Stack>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="sent">
                        {sent.length === 0 ? <EmptyState text="Немає надісланих заявок" icon={IconArrowRight} /> : (
                            <Stack>
                                {sent.map(req => (
                                    <UserRow key={req.id} user={req} isDark={isDark}>
                                        <Text size="sm" c="dimmed" mr="xs" fs="italic">Очікує...</Text>
                                        <Button color="gray" variant="outline" size="sm" radius="md" onClick={() => handleRemove(req.relation_id)}>
                                            Скасувати
                                        </Button>
                                    </UserRow>
                                ))}
                            </Stack>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="search">
                        <Paper p="xl" radius="lg" withBorder={!isDark} bg={isDark ? 'var(--mantine-color-dark-7)' : 'gray.0'} mb="lg">
                            <Stack align="center">
                                <Title order={4}>Знайти людей</Title>
                                <Group w="100%" maw={500}>
                                    <TextInput 
                                        placeholder="Введіть нікнейм..." 
                                        style={{ flex: 1 }}
                                        size="md"
                                        radius="md"
                                        leftSection={<IconSearch size={18} />}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch} color="orange" size="md" radius="md" loading={isSearching}>
                                        Знайти
                                    </Button>
                                </Group>
                            </Stack>
                        </Paper>

                        <Stack>
                            {searchResults.length > 0 ? searchResults.map(u => (
                                <UserRow key={u.id} user={u} isDark={isDark}>
                                    <Button component={Link} to={`/user/${u.id}`} leftSection={<IconUserPlus size={16} />} variant="light" color="orange" size="sm" radius="md">
                                        Відкрити профіль
                                    </Button>
                                </UserRow>
                            )) : (
                                searchQuery && !isSearching && <EmptyState text="Нікого не знайдено" icon={IconSearch} />
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Container>
        </Box>
    );
};

// --- Компонент рядка користувача ---
const UserRow = ({ user, children, isDark }) => (
    <Paper 
        p="md" 
        radius="md" 
        withBorder={!isDark}
        bg={isDark ? 'var(--mantine-color-dark-6)' : 'white'}
        style={{ 
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'default'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <Group justify="space-between">
            <Group>
                <Link to={`/user/${user.id}`} style={{ textDecoration: 'none' }}>
                    {/* Прибрано border для аватарки */}
                    <Avatar 
                        src={user.avatar_url} 
                        size={48} 
                        radius="xl" 
                        color="orange" 
                        style={{ cursor: 'pointer' }} 
                    >
                        {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                </Link>
                <div>
                    <Text 
                        fw={600} 
                        size="lg" 
                        component={Link} 
                        to={`/user/${user.id}`} 
                        c="var(--mantine-color-text)" 
                        style={{ textDecoration: 'none' }}
                    >
                        {user.username}
                    </Text>
                </div>
            </Group>
            <Group gap="xs">
                {children}
            </Group>
        </Group>
    </Paper>
);

export default FriendsPage;