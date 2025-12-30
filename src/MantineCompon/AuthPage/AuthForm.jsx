import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { 
    Paper, TextInput, PasswordInput, Button, Title, Text, Anchor, Stack, Box, useMantineColorScheme 
} from '@mantine/core';
import { IconAt, IconLock, IconUser, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext';

const AuthForm = () => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const history = useHistory();
    const { login } = useAuth(); 

    const [authType, setAuthType] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // form.name тепер виступає як Логін (Username)
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    
    const isRegister = authType === 'register';

    const glassStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(15px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
    };

    const toggleType = () => {
        setAuthType((current) => (current === 'login' ? 'register' : 'login'));
        setError(null);
        // Очистимо поля при перемиканні, щоб не плутати юзера (опціонально)
        setForm({ name: '', email: '', password: '' }); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const endpoint = isRegister ? '/auth/register' : '/auth/login';
        
        // Формуємо дані залежно від типу входу
        let body;
        if (isRegister) {
            // Реєстрація: Ім'я, Пошта, Пароль
            body = { name: form.name, email: form.email, password: form.password };
        } else {
            // Вхід: Ім'я (як логін) та Пароль. Пошта не потрібна.
            body = { username: form.name, password: form.password };
        }

        try {
            const response = await fetch(`http://localhost:3001${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Щось пішло не так');
            }

            login(data.user, data.token);
            history.push('/');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper withBorder shadow="xl" p={30} mt={30} radius="md" style={glassStyle}>
            <Title ta="center" order={2} mb="xs" style={{ fontFamily: 'Greycliff CF, sans-serif', fontWeight: 900 }}>
                {isRegister ? 'Створити акаунт' : 'З поверненням!'}
            </Title>
            <Text c="dimmed" size="sm" ta="center" mb="lg">
                {isRegister 
                    ? 'Зареєструйтеся для повного доступу' 
                    : 'Введіть свій логін та пароль'}
            </Text>

            {error && (
                <Paper withBorder p="xs" mb="md" radius="md" bg="red.1" style={{ borderColor: 'red' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c92a2a' }}>
                        <IconAlertCircle size={20} />
                        <Text size="sm" fw={500}>{error}</Text>
                    </Box>
                </Paper>
            )}

            <form onSubmit={handleSubmit}>
                <Stack>
                    {/* Логін (Ім'я) тепер показуємо ЗАВЖДИ */}
                    <TextInput
                        label={isRegister ? "Придумайте нікнейм" : "Ваш логін (Нікнейм)"}
                        placeholder="User123"
                        leftSection={<IconUser size={16} />}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        radius="md"
                    />

                    {/* Пошта тільки для Реєстрації */}
                    {isRegister && (
                        <TextInput
                            label="Електронна пошта"
                            placeholder="hello@gmail.com"
                            leftSection={<IconAt size={16} />}
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            radius="md"
                            type="email" // Браузерна валідація
                        />
                    )}

                    <PasswordInput
                        label="Пароль"
                        placeholder="Ваш пароль"
                        leftSection={<IconLock size={16} />}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        radius="md"
                    />
                </Stack>

                <Button 
                    fullWidth mt="xl" type="submit" loading={loading}
                    variant="gradient" 
                    gradient={isRegister ? { from: 'blue', to: 'cyan' } : { from: 'orange', to: 'red' }}
                    size="md" radius="md"
                >
                    {isRegister ? 'Зареєструватися' : 'Увійти'}
                </Button>
            </form>

            <Text c="dimmed" size="sm" ta="center" mt="md">
                {isRegister ? 'Вже маєте акаунт? ' : 'Ще не маєте акаунту? '}
                <Anchor component="button" type="button" onClick={toggleType} size="sm" fw={700}>
                    {isRegister ? 'Увійти' : 'Зареєструватися'}
                </Anchor>
            </Text>
        </Paper>
    );
};

export default AuthForm;