import React, { useState, useEffect } from 'react';
import { 
    Paper, Textarea, Button, Group, Avatar, Text, Stack, ActionIcon, Title, Divider, Box, Loader 
} from '@mantine/core';
import { IconSend, IconTrash, IconMessageOff } from '@tabler/icons-react';
import { Link } from 'react-router-dom'; // Імпорт для навігації
import { useAuth } from '../../Context/AuthContext'; // Переконайся, що шлях Context з великої літери

const CommentsSection = ({ contentId, contentType }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Завантаження коментарів
    useEffect(() => {
        fetchComments();
    }, [contentId, contentType]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`http://localhost:3001/comments/${contentType}/${contentId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Помилка завантаження коментарів:", error);
        } finally {
            setLoading(false);
        }
    };

    // Відправка коментаря
    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/comments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content_type: contentType,
                    content_id: contentId,
                    text: newComment
                })
            });

            if (res.ok) {
                setNewComment('');
                fetchComments(); // Оновлюємо список
            }
        } catch (error) {
            console.error("Помилка відправки:", error);
        } finally {
            setSubmitting(false);
        }
    };

    // Видалення коментаря
    const handleDelete = async (commentId) => {
        if (!window.confirm("Видалити цей коментар?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setComments(comments.filter(c => c.id !== commentId));
            }
        } catch (error) {
            console.error("Помилка видалення:", error);
        }
    };

    return (
        <Paper p="xl" radius="md" mt={50} style={{ backgroundColor: 'var(--mantine-color-body)' }}>
            <Title order={3} mb="md">Коментарі ({comments.length})</Title>
            
            {/* ФОРМА ВВОДУ */}
            {user ? (
                <Group align="flex-start" mb="xl">
                    <Avatar src={user.avatar} radius="xl" size="md" color="orange">
                        {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box style={{ flex: 1 }}>
                        <Textarea
                            placeholder="Напишіть свою думку..."
                            minRows={2}
                            autosize
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Group justify="flex-end" mt="xs">
                            <Button 
                                leftSection={<IconSend size={16} />} 
                                color="orange" 
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={!newComment.trim()}
                            >
                                Надіслати
                            </Button>
                        </Group>
                    </Box>
                </Group>
            ) : (
                <Paper withBorder p="md" mb="xl" bg="transparent" ta="center">
                    <Text c="dimmed" size="sm">
                        <Link to="/auth" style={{ color: 'orange', fontWeight: 'bold', textDecoration: 'none' }}>Увійдіть</Link>, щоб залишити коментар.
                    </Text>
                </Paper>
            )}

            <Divider mb="lg" />

            {/* СПИСОК КОМЕНТАРІВ */}
            {loading ? (
                <Loader color="orange" size="sm" />
            ) : comments.length === 0 ? (
                <Group justify="center" c="dimmed" gap="xs" py="xl">
                    <IconMessageOff size={20} />
                    <Text>Поки немає коментарів. Будьте першим!</Text>
                </Group>
            ) : (
                <Stack gap="lg">
                    {comments.map((comment) => (
                        <Group key={comment.id} align="flex-start" wrap="nowrap">
                            
                            {/* АВАТАР З ПОСИЛАННЯМ НА ПРОФІЛЬ */}
                            <Link to={`/user/${comment.user_id}`} style={{ textDecoration: 'none' }}>
                                <Avatar 
                                    src={comment.avatar_url} 
                                    radius="xl" 
                                    color="gray"
                                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 0.8}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                                >
                                    {comment.username?.[0]?.toUpperCase()}
                                </Avatar>
                            </Link>

                            <Box style={{ flex: 1 }}>
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        {/* ІМ'Я З ПОСИЛАННЯМ НА ПРОФІЛЬ */}
                                        <Text 
                                            size="sm" 
                                            fw={700}
                                            component={Link}
                                            to={`/user/${comment.user_id}`}
                                            c="var(--mantine-color-text)"
                                            style={{ textDecoration: 'none', cursor: 'pointer' }}
                                        >
                                            {comment.username}
                                        </Text>
                                        
                                        <Text size="xs" c="dimmed">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </Text>
                                    </Group>
                                    
                                    {/* Кнопка видалення (тільки для автора) */}
                                    {user && user.id === comment.user_id && (
                                        <ActionIcon 
                                            variant="subtle" 
                                            color="red" 
                                            size="sm" 
                                            onClick={() => handleDelete(comment.id)}
                                        >
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    )}
                                </Group>
                                <Text size="sm" mt={4} style={{ whiteSpace: 'pre-wrap' }}>
                                    {comment.text}
                                </Text>
                            </Box>
                        </Group>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default CommentsSection;