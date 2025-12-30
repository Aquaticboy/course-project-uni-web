import React from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Box, Button, useMantineColorScheme } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

// Імпортуємо наш компонент форми
import AuthForm from '../MantineCompon/AuthPage/AuthForm';

const AuthPage = () => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const history = useHistory();

    return (
        <Box style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            position: 'relative', 
            overflow: 'hidden' 
        }}>
            
            {/* КНОПКА НАЗАД (Тут, на рівні сторінки) */}
            <Box style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <Button 
                    variant="subtle" 
                    color="gray" 
                    leftSection={<IconArrowLeft size={20} />}
                    onClick={() => history.goBack()}
                >
                    Назад
                </Button>
            </Box>

            {/* ФОНОВЕ СВІТІННЯ (GLOW) */}
            {isDark && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(64, 192, 87, 0.15), rgba(34, 139, 230, 0.15), transparent 70%)', 
                    filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}

            {/* КОНТЕЙНЕР ДЛЯ ФОРМИ */}
            <Container size={420} my={40} style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <AuthForm />
            </Container>

        </Box>
    );
};

export default AuthPage;