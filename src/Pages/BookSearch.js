import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { 
    Container, Grid, TextInput, Select, Button, Center, Title, Group, Paper, Text, Skeleton, ActionIcon, Box, useMantineColorScheme 
} from '@mantine/core';
import { IconSearch, IconX, IconFilter, IconBook, IconBrandGoogle, IconBuildingArch } from '@tabler/icons-react';
import BadgeCard from '../MantineCompon/CarouselDemo/BadgeCard/BadgeCard';
import useFetch from '../useFetch';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const BookSearch = () => {
    const queryParams = useQuery();
    const history = useHistory();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const genresList = [
        { value: 'all', label: 'Всі жанри' },
        { value: 'fiction', label: 'Художня література' },
        { value: 'fantasy', label: 'Фентезі' },
        { value: 'science_fiction', label: 'Наукова фантастика' },
        { value: 'romance', label: 'Романи' },
        { value: 'mystery', label: 'Детективи' },
        { value: 'horror', label: 'Жахи' },
        { value: 'history', label: 'Історія' },
    ];

    const sourceOptions = [
        { value: 'google', label: 'Google Books' },
        { value: 'ol', label: 'Open Library' }
    ];

    const [filters, setFilters] = useState({
        query: queryParams.get('search') || '',
        source: 'google',
        genre: 'all',
        page: 1
    });

    const [localSearchInput, setLocalSearchInput] = useState(filters.query);
    const [requestUrl, setRequestUrl] = useState(null);

    // --- ЛОГІКА ПАГІНАЦІЇ ---
    const apiBatchNumber = Math.ceil(filters.page / 2);

    const buildUrl = (currentFilters) => {
        const batchPage = Math.ceil(currentFilters.page / 2);
        
        const params = new URLSearchParams({
            query: currentFilters.query,
            source: currentFilters.source,
            genre: currentFilters.genre,
            page: batchPage
        });
        return `http://localhost:3001/books/search?${params.toString()}`;
    };

    useEffect(() => {
        const initialUrl = buildUrl(filters);
        setRequestUrl(initialUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const { data: booksData, isPending: loading, error } = useFetch(requestUrl);
    const allBooksInBatch = booksData?.results || [];

    const isSecondHalf = filters.page % 2 === 0;
    const startIndex = isSecondHalf ? 20 : 0;
    const endIndex = isSecondHalf ? 40 : 20;

    const displayedBooks = allBooksInBatch.slice(startIndex, endIndex);

    // --- ОБРОБНИКИ ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearchClick = () => {
        const updatedFilters = { ...filters, query: localSearchInput, page: 1 };
        setFilters(updatedFilters);

        if (localSearchInput) {
            history.push(`/BookSearch?search=${encodeURIComponent(localSearchInput)}`);
        } else {
            history.push(`/BookSearch`);
        }
        
        setRequestUrl(buildUrl(updatedFilters));
    };

    const clearFilters = () => {
        setLocalSearchInput('');
        const defaultFilters = { query: '', source: 'google', genre: 'all', page: 1 };
        setFilters(defaultFilters);
        history.push('/BookSearch');
        setRequestUrl(buildUrl(defaultFilters));
    };

    const handlePageChange = (direction) => {
        const newPage = filters.page + direction;
        if (newPage < 1) return;

        const updatedFilters = { ...filters, page: newPage };
        setFilters(updatedFilters);
        
        setRequestUrl(buildUrl(updatedFilters));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const CurrentIcon = filters.source === 'google' ? IconBrandGoogle : IconBuildingArch;

    return (
        <Box style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            
            {/* 1. ФОНОВЕ СВІТІННЯ (GLOW) - Теплий відтінок для книг */}
            {isDark && (
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '600px',
                    // Використовуємо оранжевий/бурштиновий колір
                    background: 'radial-gradient(circle, rgba(255, 169, 77, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
            )}

            <Container size="xl" pb="xl" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* ЗАГОЛОВОК */}
                <Group justify="space-between" align="center" mb={{ base: 'md', md: 'xl' }} mt={{ base: 30, md: 50 }}>
                    <Title 
                        order={1} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            color: 'var(--mantine-color-text)'
                        }}
                        fz={{ base: '1.8rem', md: '2.5rem' }}
                    >
                        <IconBook size={32} stroke={1.5} color="var(--mantine-color-orange-filled)" style={{ minWidth: 32 }} />
                        Пошук Книг
                    </Title>
                    <Text fw={500} c="dimmed" size="sm" visibleFrom="xs">
                        {loading ? '...' : `Показано ${displayedBooks.length} книг (стор. ${filters.page})`}
                    </Text>
                </Group>

                {/* 2. ПАНЕЛЬ ФІЛЬТРІВ (GLASSMORPHISM) */}
                <Paper 
                    radius="lg" 
                    p={{ base: 'md', md: 'xl' }} 
                    mb={{ base: 30, md: 50 }} 
                    shadow="xl" 
                    style={{ 
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
                    }}
                >
                    <Grid align="flex-end" gutter={{ base: 'sm', md: 'lg' }}>
                        
                        {/* Джерело (Google/OL) - 50% на моб */}
                        <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                            <Select
                                label="Джерело"
                                data={sourceOptions}
                                value={filters.source}
                                onChange={(val) => handleFilterChange('source', val)} 
                                allowDeselect={false}
                                leftSection={<CurrentIcon size={18} />}
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Жанр - 50% на моб */}
                        <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
                            <Select
                                label="Жанр"
                                placeholder="Оберіть жанр"
                                data={genresList}
                                value={filters.genre}
                                onChange={(val) => handleFilterChange('genre', val)}
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Пошук - 100% на моб */}
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label="Ключове слово"
                                placeholder={filters.source === 'google' ? "Назва або автор..." : "Title in English..."}
                                leftSection={<IconSearch size={18} />}
                                value={localSearchInput}
                                onChange={(e) => setLocalSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Кнопки - 100% на моб */}
                        <Grid.Col span={{ base: 12, md: 2 }}>
                            <Group gap="xs">
                                <Button 
                                    fullWidth
                                    onClick={handleSearchClick}
                                    color="orange"
                                    variant="gradient"
                                    gradient={{ from: 'orange', to: 'yellow', deg: 90 }}
                                    leftSection={<IconFilter size={18} />}
                                    loading={loading}
                                    radius="md"
                                    size="md"
                                >
                                    Знайти
                                </Button>
                                <ActionIcon 
                                    variant="light" color="gray" size="input-md" radius="md"
                                    onClick={clearFilters} title="Скинути"
                                >
                                    <IconX size={20} />
                                </ActionIcon>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* РЕЗУЛЬТАТИ */}
                {error && <Text c="red" ta="center">Помилка: {error}</Text>}

                {loading ? (
                    <Grid gutter={{ base: 'md', md: 'xl' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Grid.Col key={i} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                <Skeleton height={350} radius="lg" mb="sm" />
                                <Skeleton height={20} radius="sm" width="70%" />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <>
                        {displayedBooks.length > 0 ? (
                            <Grid gutter={{ base: 'md', md: 'xl' }}>
                                {displayedBooks.map(book => (
                                    <Grid.Col key={book.id} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                        <BadgeCard film={book} />
                                    </Grid.Col>
                                ))}
                            </Grid>
                        ) : (
                            !loading && (
                                <Paper 
                                    p="xl" radius="lg" 
                                    style={{ 
                                        backgroundColor: 'transparent', 
                                        border: '2px dashed var(--mantine-color-gray-8)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        minHeight: '300px', opacity: 0.6
                                    }}
                                >
                                    <IconBook size={64} color="gray" style={{ marginBottom: 20 }} />
                                    <Title order={3} c="dimmed">Нічого не знайдено</Title>
                                    <Text c="dimmed">Спробуйте змінити параметри пошуку</Text>
                                </Paper>
                            )
                        )}
                    </>
                )}

                {/* ПАГІНАЦІЯ */}
                {(displayedBooks.length > 0 || (isSecondHalf && allBooksInBatch.length > 0)) && (
                    <Center mt={50}>
                        {/* Group з grow робить кнопки на всю ширину на мобільному */}
                        <Group gap="md" w={{ base: '100%', sm: 'auto' }} grow> 
                            <Button 
                                variant="default" 
                                size="lg"
                                radius="xl"
                                disabled={filters.page === 1}
                                onClick={() => handlePageChange(-1)}
                            >
                                ← Попередня
                            </Button>
                            
                            {/* Номер сторінки ховаємо на дуже малих екранах або показуємо як Badge */}
                            <Text fw={700} ta="center" visibleFrom="xs">
                                Сторінка {filters.page}
                            </Text>
                            
                            <Button 
                                variant="default"
                                size="lg"
                                radius="xl"
                                onClick={() => handlePageChange(1)}
                                disabled={
                                    (isSecondHalf && allBooksInBatch.length < 40) || 
                                    (!isSecondHalf && allBooksInBatch.length <= 20)
                                }
                            >
                                Наступна →
                            </Button>
                        </Group>
                    </Center>
                )}

            </Container>
        </Box>
    );
};

export default BookSearch;