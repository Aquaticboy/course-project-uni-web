import React, { useState, useEffect } from 'react';
import { Button } from '@mantine/core';
import { IconUserPlus, IconCheck, IconClock, IconUserCheck } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext';

const FriendButton = ({ targetUserId }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // 'none', 'friends', 'request_sent', 'request_received'
    const [loading, setLoading] = useState(false);

    // Функція перевірки статусу
    const checkStatus = async () => {
        if (!user) return;
        // Не робимо запит, якщо це ми самі
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

    // 1. ХУКИ МАЮТЬ БУТИ ТУТ (до будь-яких return)
    useEffect(() => {
        if (user) {
            checkStatus();
        }
    }, [user, targetUserId]);

    const sendRequest = async () => {
        if (!user) return alert('Увійдіть, щоб додавати друзів');
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

    // 2. ПЕРЕВІРКА "ЧИ ЦЕ Я" (Тільки ПІСЛЯ всіх хуків)
    if (user && user.id == targetUserId) return null;

    // 3. РЕНДЕР КНОПОК
    if (status === 'friends') {
        return <Button variant="light" color="green" leftSection={<IconUserCheck size={18} />}>Ваш друг</Button>;
    }
    if (status === 'request_sent') {
        return <Button variant="light" color="gray" leftSection={<IconClock size={18} />}>Запит надіслано</Button>;
    }
    if (status === 'request_received') {
        // Тут можна додати логіку прийняття запиту в майбутньому
        return <Button variant="light" color="blue">Прийняти запит</Button>;
    }

    return (
        <Button 
            onClick={sendRequest} 
            loading={loading}
            color="orange"
            variant="outline"
            leftSection={<IconUserPlus size={18} />}
        >
            Додати в друзі
        </Button>
    );
};

export default FriendButton;