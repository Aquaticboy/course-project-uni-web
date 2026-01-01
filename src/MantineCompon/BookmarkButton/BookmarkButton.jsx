import React, { useState, useEffect } from 'react';
import { ActionIcon, Tooltip, Modal, Button, Text, Group } from '@mantine/core'; // Додали Modal, Button, Text, Group
import { useDisclosure } from '@mantine/hooks'; // Хук для керування модалкою
import { IconHeart, IconHeartFilled, IconLogin } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext';
import { Link } from 'react-router-dom'; // Для посилання на сторінку входу

const BookmarkButton = ({ item, type }) => {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Хук для відкриття/закриття модального вікна
    const [opened, { open, close }] = useDisclosure(false);

    const contentId = item.id; 
    const title = item.title || item.original_title || item.name;
    const poster = item.poster_path || item.cover_i;

    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:3001/bookmarks/check/${type}/${contentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsBookmarked(data.isBookmarked);
                }
            } catch (err) {
                console.error("Помилка перевірки закладки:", err);
            }
        };
        checkStatus();
    }, [user, type, contentId]);

    const handleToggle = async () => {
        // ЯКЩО НЕ ЗАЛОГІНЕНИЙ -> ВІДКРИВАЄМО КРАСИВЕ ВІКНО ЗАМІСТЬ ALERT
        if (!user) {
            open(); // Відкриваємо модалку
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (isBookmarked) {
                await fetch(`http://localhost:3001/bookmarks/${type}/${contentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsBookmarked(false);
            } else {
                await fetch('http://localhost:3001/bookmarks', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content_type: type,
                        content_id: contentId,
                        title: title,
                        poster_path: poster
                    })
                });
                setIsBookmarked(true);
            }
        } catch (err) {
            console.error("Помилка зміни закладки:", err);
        } finally {
            setLoading(false);
        }
    };

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
                    Щоб додавати фільми та книги до "Вибраного", вам потрібно увійти у свій акаунт.
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

            {/* САМА КНОПКА */}
            <Tooltip label={isBookmarked ? "Видалити з вибраного" : "Додати у вибране"}>
                <ActionIcon 
                    variant={isBookmarked ? "filled" : "light"} 
                    color="red" 
                    size="xl" 
                    radius="md" 
                    onClick={handleToggle}
                    loading={loading}
                >
                    {isBookmarked ? <IconHeartFilled size={24} /> : <IconHeart size={24} />}
                </ActionIcon>
            </Tooltip>
        </>
    );
};

export default BookmarkButton;