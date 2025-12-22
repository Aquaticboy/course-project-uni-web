import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { 
    Container, Grid, TextInput, Select, Button, Center, Title, Group, Paper, Text, Skeleton, ActionIcon 
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
    // 1. Визначаємо, який "пакет" даних нам потрібен від сервера (1 пакет = 40 книг)
    // Сторінки 1-2 -> Пакет 1. Сторінки 3-4 -> Пакет 2.
    const apiBatchNumber = Math.ceil(filters.page / 2);

    const buildUrl = (currentFilters) => {
        // Рахуємо пакет на основі поточної сторінки фільтру
        const batchPage = Math.ceil(currentFilters.page / 2);
        
        const params = new URLSearchParams({
            query: currentFilters.query,
            source: currentFilters.source,
            genre: currentFilters.genre,
            page: batchPage // Відправляємо номер ПАКЕТУ, а не сторінки
        });
        return `http://localhost:3001/books/search?${params.toString()}`;
    };

    useEffect(() => {
        const initialUrl = buildUrl(filters);
        setRequestUrl(initialUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Отримуємо 40 книг
    const { data: booksData, isPending: loading, error } = useFetch(requestUrl);
    const allBooksInBatch = booksData?.results || [];

    // 2. Визначаємо, яку половину пакету показувати
    // Якщо сторінка непарна (1,3,5) -> перші 20. Якщо парна (2,4,6) -> другі 20.
    const isSecondHalf = filters.page % 2 === 0;
    const startIndex = isSecondHalf ? 20 : 0;
    const endIndex = isSecondHalf ? 40 : 20;

    // Це ті 20 книг, які ми реально показуємо зараз
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

    // Перемикання сторінок
    const handlePageChange = (direction) => {
        const newPage = filters.page + direction;
        if (newPage < 1) return;

        const updatedFilters = { ...filters, page: newPage };
        setFilters(updatedFilters);
        
        // buildUrl всередині порахує новий apiBatchNumber.
        // Якщо ми переходимо з 1 на 2 стор -> apiBatchNumber той самий (1) -> URL той самий -> useFetch НЕ рефетчить (Кешування!)
        // Якщо ми переходимо з 2 на 3 стор -> apiBatchNumber змінюється (2) -> URL змінюється -> useFetch робить запит.
        setRequestUrl(buildUrl(updatedFilters));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const CurrentIcon = filters.source === 'google' ? IconBrandGoogle : IconBuildingArch;

    const lightInputStyles = {
        input: { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ced4da' }, 
        label: { marginBottom: 5, fontWeight: 500 },
        dropdown: { backgroundColor: '#ffffff', border: '1px solid #ced4da' },
        option: { color: '#000000', '&:hover': { backgroundColor: '#f1f3f5' } }
    };

    return (
        <Container size="xl" pb="xl" style={{ minHeight: '100vh' }}>
            
            <Group justify="space-between" align="center" mb="lg" mt="md">
                <Title order={2} c="dark" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconBook size={28} color="#e67700" />
                    Пошук Книг
                </Title>
                <Text c="dimmed" size="sm" visibleFrom="sm">
                    {/* Показуємо реальну кількість, якщо завантажилось */}
                    {loading ? 'Завантаження...' : `Показано ${displayedBooks.length} книг (стор. ${filters.page})`}
                </Text>
            </Group>

            {/* ПАНЕЛЬ ФІЛЬТРІВ */}
            <Paper p="lg" radius="md" mb={40} shadow="sm" withBorder style={{ backgroundColor: '#fff3e0' }}>
                <Grid align="flex-end" gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Джерело"
                            data={sourceOptions}
                            value={filters.source}
                            onChange={(val) => handleFilterChange('source', val)} 
                            allowDeselect={false}
                            leftSection={<CurrentIcon size={16} />}
                            styles={lightInputStyles}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Select
                            label="Жанр"
                            placeholder="Оберіть жанр"
                            data={genresList}
                            value={filters.genre}
                            onChange={(val) => handleFilterChange('genre', val)}
                            styles={lightInputStyles}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Ключове слово"
                            placeholder={filters.source === 'google' ? "Назва або автор..." : "Title in English..."}
                            leftSection={<IconSearch size={16} />}
                            value={localSearchInput}
                            onChange={(e) => setLocalSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            styles={lightInputStyles}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 2 }}>
                        <Group gap="xs">
                            <Button 
                                fullWidth
                                onClick={handleSearchClick}
                                color="orange"
                                leftSection={<IconFilter size={18} />}
                                loading={loading}
                            >
                                Знайти
                            </Button>
                            <ActionIcon 
                                variant="default" color="gray" size="lg" 
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

            {/* Спінер показуємо ТІЛЬКИ якщо вантажиться і це НОВИЙ пакет даних (непарна сторінка) */}
            {/* Якщо це парна сторінка, дані вже є, спінер не треба */}
            {loading && !isSecondHalf ? (
                <Grid gutter="lg">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Grid.Col key={i} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                            <Skeleton height={350} radius="md" mb="sm" />
                            <Skeleton height={20} radius="sm" width="70%" />
                        </Grid.Col>
                    ))}
                </Grid>
            ) : (
                <>
                    {displayedBooks.length > 0 ? (
                        <Grid gutter="lg">
                            {displayedBooks.map(book => (
                                <Grid.Col key={book.id} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                    <BadgeCard film={book} />
                                </Grid.Col>
                            ))}
                        </Grid>
                    ) : (
                        !loading && (
                            <Center h={300} style={{ flexDirection: 'column', opacity: 0.5 }}>
                                <IconBook size={64} color="gray" />
                                <Title order={3} c="gray" mt="md">
                                    Нічого не знайдено
                                </Title>
                                <Text c="dimmed">Спробуйте змінити параметри пошуку</Text>
                            </Center>
                        )
                    )}
                </>
            )}

            {/* ПАГІНАЦІЯ */}
            {/* Показуємо, якщо є книги АБО якщо ми на парній сторінці (навіть якщо книг < 20, щоб повернутись) */}
            {(displayedBooks.length > 0 || (isSecondHalf && allBooksInBatch.length > 0)) && (
                <Center mt="xl">
                    <Group>
                        <Button 
                            variant="default" 
                            disabled={filters.page === 1}
                            onClick={() => handlePageChange(-1)}
                        >
                            ← Попередня
                        </Button>
                        
                        <Text fw={700}>Сторінка {filters.page}</Text>
                        
                        <Button 
                            variant="default"
                            onClick={() => handlePageChange(1)}
                            // Блокуємо "Вперед", якщо:
                            // 1. Ми на другій половині (isSecondHalf) і книг менше 40 (кінець списку).
                            // 2. Ми на першій половині, але книг всього менше 20 (немає сенсу йти далі).
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
    );
};

export default BookSearch;