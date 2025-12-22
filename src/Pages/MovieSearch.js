import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { 
    Container, Grid, TextInput, Select, Button, Center, Title, Pagination, Group, Paper, Text, Skeleton, ActionIcon 
} from '@mantine/core';
import { IconSearch, IconX, IconFilter, IconSortDescending } from '@tabler/icons-react';
import BadgeCard from '../MantineCompon/CarouselDemo/BadgeCard/BadgeCard';
import useFetch from '../useFetch';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const MovieSearch = () => {
    const queryParams = useQuery();
    const history = useHistory();
    const location = useLocation();

    // --- 1. СТАН ІНТЕРФЕЙСУ (Чернетка) ---
    // Ці дані змінюються миттєво при виборі в меню, але НЕ запускають пошук
    const [filters, setFilters] = useState({
        query: queryParams.get('search') || '',
        genre: null,
        year: null,
        sortBy: 'popularity.desc',
        page: 1
    });

    // --- 2. СТАН ЗАПИТУ (Active URL) ---
    // useFetch буде реагувати ТІЛЬКИ на зміну цієї змінної
    const [requestUrl, setRequestUrl] = useState(null);

    // Локальний інпут для тексту
    const [localSearchInput, setLocalSearchInput] = useState(filters.query);

    // Завантаження жанрів (один раз)
    const { data: genresData } = useFetch('http://localhost:3001/genres');
    const genresList = genresData 
        ? genresData.map(g => ({ value: g.id.toString(), label: g.name }))
        : [];

    // --- ГОЛОВНИЙ ЗАПИТ ДАНИХ ---
    const { data: moviesData, isPending: loading, error } = useFetch(requestUrl);

    const movies = moviesData?.results || [];
    const totalPages = moviesData?.total_pages > 500 ? 500 : moviesData?.total_pages || 1;


    // --- ДОПОМІЖНА ФУНКЦІЯ: ГЕНЕРАЦІЯ URL ---
    const buildUrl = (currentFilters) => {
        const params = new URLSearchParams({
            query: currentFilters.query || '',
            genre: currentFilters.genre || '',
            year: currentFilters.year || '',
            sort_by: currentFilters.sortBy || 'popularity.desc',
            page: currentFilters.page || 1
        });
        return `http://localhost:3001/movies?${params.toString()}`;
    };

    // --- СИНХРОНІЗАЦІЯ ПРИ ПЕРШОМУ ЗАВАНТАЖЕННІ ---
    useEffect(() => {
        // Коли сторінка завантажується, ми беремо параметри з URL браузера
        // і відразу формуємо запит, щоб користувач побачив дані
        const initialUrl = buildUrl(filters);
        setRequestUrl(initialUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Тільки 1 раз при старті

    // --- СИНХРОНІЗАЦІЯ З NAVBAR ---
    useEffect(() => {
        const urlSearch = queryParams.get('search');
        // Якщо URL змінився (наприклад, з Navbar), ми оновлюємо фільтри І відразу шукаємо
        if (urlSearch !== null && urlSearch !== filters.query) {
            const newFilters = { ...filters, query: urlSearch, page: 1 };
            setFilters(newFilters);
            setLocalSearchInput(urlSearch);
            setRequestUrl(buildUrl(newFilters)); // <--- Тут пошук відбувається одразу
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);


    // --- ГОЛОВНА ФУНКЦІЯ "ЗНАЙТИ" ---
    const handleSearchClick = () => {
        // 1. Оновлюємо стан фільтрів актуальним текстом
        const updatedFilters = { ...filters, query: localSearchInput, page: 1 };
        setFilters(updatedFilters);

        // 2. Оновлюємо URL браузера (для історії)
        if (localSearchInput) {
            history.push(`/MovieSearch?search=${encodeURIComponent(localSearchInput)}`);
        } else {
            history.push(`/MovieSearch`);
        }

        // 3. ТІЛЬКИ ТУТ МИ ОНОВЛЮЄМО requestUrl, ЩО ЗАПУСКАЄ useFetch
        setRequestUrl(buildUrl(updatedFilters));
    };

    // --- ОБРОБКА ПАГІНАЦІЇ ---
    const handlePageChange = (newPage) => {
        const updatedFilters = { ...filters, page: newPage };
        setFilters(updatedFilters);
        setRequestUrl(buildUrl(updatedFilters)); // При пагінації пошук теж йде відразу
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- ОЧИЩЕННЯ ---
    const clearFilters = () => {
        setLocalSearchInput('');
        const emptyFilters = {
            query: '',
            genre: null,
            year: null,
            sortBy: 'popularity.desc',
            page: 1
        };
        setFilters(emptyFilters);
        history.push('/MovieSearch');
        
        // При очищенні теж відразу запускаємо пошук "всього"
        setRequestUrl(buildUrl(emptyFilters));
    };


    // --- ДАНІ ДЛЯ UI ---
    const currentYear = new Date().getFullYear() + 2;
    const years = Array.from({length: 65}, (_, i) => (currentYear - i).toString());

    const sortOptions = [
        { value: 'popularity.desc', label: 'Найпопулярніші' },
        { value: 'vote_average.desc', label: 'Найвищий рейтинг' },
        { value: 'primary_release_date.desc', label: 'Найновіші' },
        { value: 'revenue.desc', label: 'Найкасовіші' }
    ];

    const lightInputStyles = {
        input: { 
            backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ced4da',
            '&:focus': { borderColor: '#228be6' }
        }, 
        label: { color: '#212529', marginBottom: 5, fontWeight: 500 },
        dropdown: { backgroundColor: '#ffffff', border: '1px solid #ced4da', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        option: { 
            color: '#000000',
            '&:hover': { backgroundColor: '#f1f3f5' },
            '&[data-selected]': { backgroundColor: '#e7f5ff', color: '#1971c2' }
        }
    };

    return (
        <Container size="xl" pb="xl" style={{ minHeight: '100vh' }}>
            
            <Group justify="space-between" align="center" mb="lg" mt="md">
                <Title order={2} c="dark" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <IconSearch size={28} color="#228be6" />
                    Пошук та Фільтри
                </Title>
                <Text c="dimmed" size="sm" visibleFrom="sm">
                    {loading ? 'Завантаження...' : `Результатів: ${moviesData?.total_results || 0}`}
                </Text>
            </Group>

            {/* ПАНЕЛЬ ФІЛЬТРІВ */}
            <Paper p="lg" radius="md" mb={40} shadow="sm" withBorder style={{ backgroundColor: '#f8f9fa' }}>
                <Grid align="flex-end" gutter="md">
                    {/* Текстовий пошук */}
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <TextInput
                            label="Ключове слово"
                            placeholder="Наприклад: Матриця"
                            leftSection={<IconSearch size={16} />}
                            value={localSearchInput}
                            onChange={(e) => setLocalSearchInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                            styles={lightInputStyles}
                        />
                    </Grid.Col>
                    
                    {/* Жанр */}
                    <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                        <Select
                            label="Жанр"
                            placeholder="Всі"
                            data={genresList}
                            value={filters.genre}
                            // ТУТ ВАЖЛИВО: Ми просто оновлюємо state, не викликаючи пошук
                            onChange={(val) => setFilters(prev => ({ ...prev, genre: val }))}
                            searchable
                            clearable
                            styles={lightInputStyles}
                        />
                    </Grid.Col>

                    {/* Рік */}
                    <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                        <Select
                            label="Рік"
                            placeholder="Всі"
                            data={years}
                            value={filters.year}
                            // ТУТ ВАЖЛИВО: Ми просто оновлюємо state, не викликаючи пошук
                            onChange={(val) => setFilters(prev => ({ ...prev, year: val }))}
                            searchable
                            clearable
                            styles={lightInputStyles}
                        />
                    </Grid.Col>

                    {/* Сортування */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                         <Select
                            label="Сортувати"
                            leftSection={<IconSortDescending size={16} />}
                            data={sortOptions}
                            value={filters.sortBy}
                            // ТУТ ВАЖЛИВО: Ми просто оновлюємо state, не викликаючи пошук
                            onChange={(val) => setFilters(prev => ({ ...prev, sortBy: val }))}
                            styles={lightInputStyles}
                            allowDeselect={false}
                        />
                    </Grid.Col>

                    {/* Кнопки */}
                    <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                        <Group gap="xs">
                            <Button 
                                fullWidth
                                onClick={handleSearchClick} // <--- ОСЬ ТУТ ЗАПУСКАЄТЬСЯ ПОШУК
                                color="blue"
                                leftSection={<IconFilter size={18} />}
                            >
                                Знайти
                            </Button>
                            <ActionIcon 
                                variant="default"
                                color="gray" 
                                size="lg" 
                                onClick={clearFilters}
                                title="Очистити"
                            >
                                <IconX size={20} />
                            </ActionIcon>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* ВІДОБРАЖЕННЯ */}
            {error && <Text c="red" ta="center">Помилка завантаження: {error}</Text>}

            {loading ? (
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
                    {movies.length > 0 ? (
                        <Grid gutter="lg">
                            {movies.map(movie => (
                                <Grid.Col key={movie.id} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                    <BadgeCard film={movie} />
                                </Grid.Col>
                            ))}
                        </Grid>
                    ) : (
                        <Center h={300} style={{ flexDirection: 'column', opacity: 0.5 }}>
                            <IconSearch size={64} color="gray" />
                            <Title order={3} c="gray" mt="md">Нічого не знайдено</Title>
                        </Center>
                    )}

                    {/* ПАГІНАЦІЯ */}
                    {movies.length > 0 && (
                        <Center mt={60}>
                            <Pagination 
                                total={totalPages} 
                                value={Number(filters.page)} 
                                onChange={handlePageChange} // Оновлена функція
                                color="blue"
                                size="lg"
                                radius="xl"
                                withEdges
                            />
                        </Center>
                    )}
                </>
            )}
        </Container>
    );
};

export default MovieSearch;