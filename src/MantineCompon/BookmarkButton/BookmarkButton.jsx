import React, { useState, useEffect } from 'react';
import { ActionIcon, Tooltip } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { useAuth } from '../../Context/AuthContext'; // Перевір шлях!

// item - об'єкт фільму або книги
// type - 'movie' або 'book'
const BookmarkButton = ({ item, type }) => {
    const { user } = useAuth();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    // Отримуємо ID та Title залежно від того, це фільм чи книга
    const contentId = item.id; 
    const title = item.title || item.original_title || item.name;
    const poster = item.poster_path || item.cover_i; // poster_path для TMDB, cover_i для книг (якщо буде)

    // 1. Перевіряємо при завантаженні, чи вже лайкнуто
    useEffect(() => {
        if (!user) return; // Якщо не залогінений - не перевіряємо

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

    // 2. Обробка кліку
    const handleToggle = async () => {
        if (!user) {
            alert("Будь ласка, увійдіть в акаунт, щоб додавати в закладки!");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            if (isBookmarked) {
                // ВИДАЛЕННЯ
                await fetch(`http://localhost:3001/bookmarks/${type}/${contentId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsBookmarked(false);
            } else {
                // ДОДАВАННЯ
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
    );
};

export default BookmarkButton;