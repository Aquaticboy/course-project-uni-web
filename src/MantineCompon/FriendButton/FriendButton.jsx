import React, { useState, useEffect } from 'react';
import { Button, Modal, Text, Group } from '@mantine/core'; // Додали Modal, Text, Group
import { useDisclosure } from '@mantine/hooks'; // Хук для модалки
import { IconUserPlus, IconClock, IconUserCheck, IconLogin } from '@tabler/icons-react'; // Додали IconLogin
import { Link } from 'react-router-dom'; // Для посилання на вхід
import { useAuth } from '../../Context/AuthContext';

const FriendButton = ({ targetUserId }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // 'none', 'friends', 'request_sent', 'request_received'
    const [loading, setLoading] = useState(false);

    // Хук для керування модальним вікном
    const [opened, { open, close }] = useDisclosure(false);

    // Функція перевірки статусу
    const checkStatus = async () => {
        if (!user) return;
        if (user.id == targetUserId) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/friends/status/${targetUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStatus(data.status);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            checkStatus();
        }
    }, [user, targetUserId]);

    const sendRequest = async () => {
        // ЯКЩО НЕ ЗАЛОГІНЕНИЙ -> ВІДКРИВАЄМО МОДАЛКУ
        if (!user) {
            open();
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/friends/request', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ receiverId: targetUserId })
            });
            if (res.ok) {
                setStatus('request_sent');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ПЕРЕВІРКА "ЧИ ЦЕ Я"
    if (user && user.id == targetUserId) return null;

    // РЕНДЕР КНОПОК ЗАЛЕЖНО ВІД СТАТУСУ
    if (status === 'friends') {
        return <Button variant="light" color="green" leftSection={<IconUserCheck size={18} />}>Ваш друг</Button>;
    }
    if (status === 'request_sent') {
        return <Button variant="light" color="gray" leftSection={<IconClock size={18} />}>Запит надіслано</Button>;
    }
    if (status === 'request_received') {
        return <Button variant="light" color="blue">Прийняти запит</Button>;
    }

    // КНОПКА "ДОДАТИ" + МОДАЛКА
    return (
        <>
            {/* МОДАЛЬНЕ ВІКНО ПОПЕРЕДЖЕННЯ */}
            <Modal 
                opened={opened} 
                onClose={close} 
                title="Потрібна авторизація" 
                centered
                radius="md"
            >
                <Text size="sm" mb="lg">
                    Щоб додавати друзів, вам потрібно увійти у свій акаунт.
                </Text>

                <Group justify="flex-end">
                    <Button variant="default" onClick={close}>
                        Скасувати
                    </Button>
                    <Button 
                        component={Link} 
                        to="/auth" 
                        color="orange" 
                        leftSection={<IconLogin size={18} />}
                        onClick={close}
                    >
                        Увійти
                    </Button>
                </Group>
            </Modal>

            {/* ОСНОВНА КНОПКА */}
            <Button 
                onClick={sendRequest} 
                loading={loading}
                color="orange"
                variant="outline"
                leftSection={<IconUserPlus size={18} />}
            >
                Додати в друзі
            </Button>
        </>
    );
};

export default FriendButton;