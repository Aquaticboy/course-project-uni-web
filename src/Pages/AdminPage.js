import React, { useEffect, useState } from 'react';
import { 
    Container, Title, Tabs, Table, Group, Avatar, Text, ActionIcon, Badge, Paper, ScrollArea, Loader, Center, Alert 
} from '@mantine/core';
import { IconUsers, IconMessage, IconTrash, IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../Context/AuthContext'; 

const AdminPage = () => {
    const { user } = useAuth();
    const [usersList, setUsersList] = useState([]);
    const [commentsList, setCommentsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функція завантаження даних
    // Відповідає маршрутам: GET /admin/users та GET /admin/comments
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [uRes, cRes] = await Promise.all([
                fetch('http://localhost:3001/admin/users', { headers }),
                fetch('http://localhost:3001/admin/comments', { headers })
            ]);

            if (uRes.status === 403 || cRes.status === 403) {
                throw new Error('Доступ заборонено (потрібні права адміністратора)');
            }

            if (!uRes.ok || !cRes.ok) {
                throw new Error('Помилка сервера при завантаженні даних');
            }

            setUsersList(await uRes.json());
            setCommentsList(await cRes.json());
        } catch (err) {
            console.error("Admin fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        } else if (user) {
            setLoading(false); 
        }
    }, [user]);

    // Видалення користувача
    // Відповідає маршруту: DELETE /admin/users/:id
    const deleteUser = async (id) => {
        if (!window.confirm("Видалити цього користувача? Всі його дані (коментарі, закладки) будуть стерті.")) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3001/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Помилка видалення');
                return;
            }
            
            // Оновлюємо таблицю після успішного видалення
            fetchData(); 
        } catch (err) {
            console.error(err);
            alert("Помилка з'єднання");
        }
    };

    // Видалення коментаря
    // Відповідає маршруту: DELETE /admin/comments/:id
    const deleteComment = async (id) => {
        if (!window.confirm("Видалити цей коментар?")) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3001/admin/comments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                alert('Помилка видалення');
                return;
            }
            
            // Оновлюємо таблицю після успішного видалення
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Помилка з'єднання");
        }
    };

    // --- РЕНДЕРИНГ (Інтерфейс) ---

    // 1. Якщо дані користувача ще не завантажились
    if (!user && loading) return <Center h="100vh"><Loader color="red" size="xl" /></Center>;

    // 2. Якщо користувач є, але він не адмін
    if (user && user.role !== 'admin') {
        return (
            <Center h="100vh">
                <Alert icon={<IconAlertCircle size={16} />} title="Доступ заборонено" color="red">
                    Ця сторінка доступна лише адміністраторам. Ваша роль: <b>{user.role}</b>
                </Alert>
            </Center>
        );
    }

    // 3. Якщо користувач не увійшов
    if (!user) {
        return (
            <Center h="100vh">
                <Text>Будь ласка, увійдіть в акаунт.</Text>
            </Center>
        );
    }

    return (
        <Container size="xl" py="xl" style={{ minHeight: '100vh' }}>
            <Group mb="xl">
                <IconShieldCheck size={32} color="red" />
                <Title order={2}>Адмін Панель</Title>
            </Group>

            {error && <Alert color="red" mb="lg" icon={<IconAlertCircle size={16}/>}>{error}</Alert>}

            {loading ? (
                <Center h={200}><Loader color="red" /></Center>
            ) : (
                <Tabs defaultValue="users" color="red" variant="outline" radius="md">
                    <Tabs.List mb="lg">
                        <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                            Користувачі ({usersList.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="comments" leftSection={<IconMessage size={16} />}>
                            Останні Коментарі
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* Вкладка: КОРИСТУВАЧІ */}
                    <Tabs.Panel value="users">
                        <Paper withBorder radius="md">
                            <ScrollArea h={600}>
                                <Table striped highlightOnHover stickyHeader>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Користувач</Table.Th>
                                            <Table.Th>Email</Table.Th>
                                            <Table.Th>Роль</Table.Th>
                                            <Table.Th>Дата реєстрації</Table.Th>
                                            <Table.Th>Дії</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {usersList.map((u) => (
                                            <Table.Tr key={u.id}>
                                                <Table.Td>
                                                    <Group gap="sm">
                                                        <Avatar src={u.avatar_url} size={30} radius="xl" color="orange">
                                                            {u.username?.[0]?.toUpperCase()}
                                                        </Avatar>
                                                        <Text size="sm" fw={500}>{u.username}</Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>{u.email}</Table.Td>
                                                <Table.Td>
                                                    <Badge color={u.role === 'admin' ? 'red' : 'blue'}>{u.role}</Badge>
                                                </Table.Td>
                                                <Table.Td>{new Date(u.created_at).toLocaleDateString()}</Table.Td>
                                                <Table.Td>
                                                    <ActionIcon 
                                                        color="red" 
                                                        variant="subtle" 
                                                        onClick={() => deleteUser(u.id)}
                                                        disabled={u.role === 'admin' || u.id === user.id} 
                                                        title="Видалити користувача"
                                                    >
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Paper>
                    </Tabs.Panel>

                    {/* Вкладка: КОМЕНТАРІ */}
                    <Tabs.Panel value="comments">
                        <Paper withBorder radius="md">
                            <ScrollArea h={600}>
                                <Table striped highlightOnHover stickyHeader>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Автор</Table.Th>
                                            <Table.Th>Коментар</Table.Th>
                                            <Table.Th>Контент</Table.Th>
                                            <Table.Th>Дата</Table.Th>
                                            <Table.Th>Дії</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {commentsList.map((c) => (
                                            <Table.Tr key={c.id}>
                                                <Table.Td>
                                                    <Group gap="sm">
                                                        <Avatar src={c.avatar_url} size={26} radius="xl" color="gray">
                                                            {c.username?.[0]?.toUpperCase()}
                                                        </Avatar>
                                                        <Text size="sm">{c.username}</Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td style={{ maxWidth: '350px' }}>
                                                    <Text truncate size="sm">{c.text}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge variant="outline" color={c.content_type === 'movie' ? 'blue' : 'green'}>
                                                        {c.content_type} (ID: {c.content_id})
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>{new Date(c.created_at).toLocaleString()}</Table.Td>
                                                <Table.Td>
                                                    <ActionIcon 
                                                        color="red" 
                                                        variant="subtle" 
                                                        onClick={() => deleteComment(c.id)}
                                                        title="Видалити коментар"
                                                    >
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            )}
        </Container>
    );
};

export default AdminPage;