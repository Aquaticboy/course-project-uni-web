import React, { useState, useEffect } from 'react';
import { 
    Container, Paper, Title, TextInput, PasswordInput, Button, Avatar, Group, Stack, Text, Divider, Notification 
} from '@mantine/core';
import { IconCheck, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { useAuth } from '../Context/AuthContext';

const SettingsPage = () => {
    const { user, login } = useAuth(); // login використовуємо для оновлення даних в контексті
    
    // Стан для профілю
    const [username, setUsername] = useState(user?.username || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [loadingProfile, setLoadingProfile] = useState(false);
    
    // Стан для пароля
    const [passwords, setPasswords] = useState({ current: '', new: '' });
    const [loadingPass, setLoadingPass] = useState(false);

    // Сповіщення
    const [notification, setNotification] = useState(null);

    // --- ГОЛОВНИЙ ФІКС ---
    // Слідкуємо за зміною user. Якщо зайшов інший юзер — оновлюємо поля форми.
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setAvatar(user.avatar || '');
        }
    }, [user]);
    // ---------------------

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // 1. Збереження профілю
    const handleSaveProfile = async () => {
        setLoadingProfile(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/auth/update', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, avatar_url: avatar })
            });

            const data = await res.json();
            
            if (res.ok) {
                // Оновлюємо дані в контексті (React), щоб шапка оновилась миттєво
                login(data.user, token); 
                showNotification('Профіль оновлено!');
            } else {
                showNotification(data.error || 'Помилка', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Помилка з\'єднання', 'error');
        } finally {
            setLoadingProfile(false);
        }
    };

    // 2. Зміна пароля
    const handleChangePassword = async () => {
        if (!passwords.current || !passwords.new) return;
        setLoadingPass(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/auth/change-password', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    currentPassword: passwords.current, 
                    newPassword: passwords.new 
                })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('Пароль змінено!');
                setPasswords({ current: '', new: '' });
            } else {
                showNotification(data.error || 'Помилка', 'error');
            }
        } catch (err) {
            console.error(err);
            showNotification('Помилка з\'єднання', 'error');
        } finally {
            setLoadingPass(false);
        }
    };

    if (!user) return null;

    return (
        <Container size="sm" py="xl" style={{ minHeight: '100vh' }}>
            <Title order={2} mb="xl">Налаштування акаунту</Title>

            {notification && (
                <Notification 
                    icon={notification.type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
                    color={notification.type === 'success' ? 'teal' : 'red'}
                    title={notification.type === 'success' ? 'Успіх' : 'Помилка'}
                    onClose={() => setNotification(null)}
                    mb="lg"
                >
                    {notification.message}
                </Notification>
            )}

            <Stack gap="xl">
                {/* БЛОК 1: Основна інформація */}
                <Paper withBorder p="xl" radius="md">
                    <Title order={4} mb="md">Публічний профіль</Title>
                    
                    <Group align="flex-start" mb="md">
                        <Avatar src={avatar} size={80} radius={80} color="orange">
                            {username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Stack gap="xs" style={{ flex: 1 }}>
                            <TextInput 
                                label="Посилання на аватар" 
                                placeholder="https://..." 
                                description="Вставте пряме посилання на зображення"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                            />
                        </Stack>
                    </Group>

                    <TextInput 
                        label="Ім'я користувача (Нікнейм)" 
                        mb="md"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    
                    <TextInput 
                        label="Email" 
                        value={user.email} 
                        disabled 
                        description="Email не можна змінити"
                        mb="lg"
                    />

                    <Group justify="flex-end">
                        <Button 
                            leftSection={<IconDeviceFloppy size={18} />} 
                            color="orange"
                            onClick={handleSaveProfile}
                            loading={loadingProfile}
                        >
                            Зберегти зміни
                        </Button>
                    </Group>
                </Paper>

                {/* БЛОК 2: Безпека */}
                <Paper withBorder p="xl" radius="md">
                    <Title order={4} mb="md">Зміна пароля</Title>
                    
                    <PasswordInput 
                        label="Поточний пароль" 
                        mb="sm"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <PasswordInput 
                        label="Новий пароль" 
                        mb="lg"
                        value={passwords.new}
                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />

                    <Group justify="flex-end">
                        <Button 
                            variant="light" 
                            color="orange"
                            onClick={handleChangePassword}
                            loading={loadingPass}
                            disabled={!passwords.current || !passwords.new}
                        >
                            Оновити пароль
                        </Button>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
};

export default SettingsPage;