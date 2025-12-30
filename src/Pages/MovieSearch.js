import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { 
    Container, Grid, TextInput, Select, Button, Center, Title, Pagination, Group, Paper, Text, Skeleton, ActionIcon, useMantineColorScheme, Box 
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
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    // --- СТАНИ ---
    const [filters, setFilters] = useState({
        query: queryParams.get('search') || '',
        genre: null,
        year: null,
        sortBy: 'popularity.desc',
        page: 1
    });

    const [requestUrl, setRequestUrl] = useState(null);
    const [localSearchInput, setLocalSearchInput] = useState(filters.query);

    const { data: genresData } = useFetch('http://localhost:3001/genres');
    const genresList = genresData 
        ? genresData.map(g => ({ value: g.id.toString(), label: g.name }))
        : [];

    const { data: moviesData, isPending: loading, error } = useFetch(requestUrl);
    const movies = moviesData?.results || [];
    const totalPages = moviesData?.total_pages > 500 ? 500 : moviesData?.total_pages || 1;

    // --- ЛОГІКА ---
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

    useEffect(() => {
        const initialUrl = buildUrl(filters);
        setRequestUrl(initialUrl);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const urlSearch = queryParams.get('search');
        if (urlSearch !== null && urlSearch !== filters.query) {
            const newFilters = { ...filters, query: urlSearch, page: 1 };
            setFilters(newFilters);
            setLocalSearchInput(urlSearch);
            setRequestUrl(buildUrl(newFilters));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const handleSearchClick = () => {
        const updatedFilters = { ...filters, query: localSearchInput, page: 1 };
        setFilters(updatedFilters);

        if (localSearchInput) {
            history.push(`/MovieSearch?search=${encodeURIComponent(localSearchInput)}`);
        } else {
            history.push(`/MovieSearch`);
        }

        setRequestUrl(buildUrl(updatedFilters));
    };

    const handlePageChange = (newPage) => {
        const updatedFilters = { ...filters, page: newPage };
        setFilters(updatedFilters);
        setRequestUrl(buildUrl(updatedFilters));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
        setRequestUrl(buildUrl(emptyFilters));
    };

    // --- UI ДАНІ ---
    const currentYear = new Date().getFullYear() + 2;
    const years = Array.from({length: 65}, (_, i) => (currentYear - i).toString());

    const sortOptions = [
        { value: 'popularity.desc', label: 'Найпопулярніші' },
        { value: 'vote_average.desc', label: 'Найвищий рейтинг' },
        { value: 'primary_release_date.desc', label: 'Найновіші' },
        { value: 'revenue.desc', label: 'Найкасовіші' }
    ];

    return (
        <Box style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
            
            {/* ФОНОВЕ СВІТІННЯ */}
            {isDark && (
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(34, 139, 230, 0.15) 0%, transparent 70%)', 
                    filter: 'blur(80px)',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
            )}

            <Container size="xl" pb="xl" style={{ position: 'relative', zIndex: 1 }}>
                
                {/* ЗАГОЛОВОК (АДАПТИВНИЙ) */}
                <Group justify="space-between" align="center" mb={{ base: 'md', md: 'xl' }} mt={{ base: 30, md: 50 }}>
                    <Title 
                        order={1} 
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px',
                            color: 'var(--mantine-color-text)'
                        }}
                        // Розмір шрифту змінюється залежно від екрану
                        fz={{ base: '1.8rem', md: '2.5rem' }} 
                    >
                        <IconSearch size={32} stroke={1.5} color="var(--mantine-color-blue-filled)" style={{ minWidth: 32 }} />
                        Пошук фільмів
                    </Title>
                    <Text fw={500} c="dimmed" size="sm" visibleFrom="xs">
                        {loading ? '...' : `Знайдено: ${moviesData?.total_results || 0}`}
                    </Text>
                </Group>

                {/* ПАНЕЛЬ ФІЛЬТРІВ */}
                <Paper 
                    radius="lg" 
                    // Відступи всередині менші на мобільному
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
                        {/* Пошук - на всю ширину */}
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <TextInput
                                label="Що шукаємо?"
                                placeholder="Назва фільму..."
                                leftSection={<IconSearch size={18} />}
                                value={localSearchInput}
                                onChange={(e) => setLocalSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>
                        
                        {/* Жанр - половина ширини на мобільному */}
                        <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                            <Select
                                label="Жанр"
                                placeholder="Всі жанри"
                                data={genresList}
                                value={filters.genre}
                                onChange={(val) => setFilters(prev => ({ ...prev, genre: val }))}
                                searchable
                                clearable
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Рік - половина ширини на мобільному */}
                        <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
                            <Select
                                label="Рік"
                                placeholder="Всі роки"
                                data={years}
                                value={filters.year}
                                onChange={(val) => setFilters(prev => ({ ...prev, year: val }))}
                                searchable
                                clearable
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Сортування - повна ширина на моб. для зручності */}
                        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                             <Select
                                label="Сортування"
                                leftSection={<IconSortDescending size={18} />}
                                data={sortOptions}
                                value={filters.sortBy}
                                onChange={(val) => setFilters(prev => ({ ...prev, sortBy: val }))}
                                allowDeselect={false}
                                variant="filled"
                                radius="md"
                                size="md"
                            />
                        </Grid.Col>

                        {/* Кнопки - повна ширина на мобільному */}
                        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                            <Group gap="xs">
                                <Button 
                                    fullWidth
                                    onClick={handleSearchClick}
                                    variant="gradient" 
                                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                                    size="md"
                                    radius="md"
                                    leftSection={<IconFilter size={18} />}
                                >
                                    Знайти
                                </Button>
                                {/* Кнопку очищення можна залишити маленькою або зробити великою */}
                                <ActionIcon 
                                    variant="light" 
                                    color="gray" 
                                    size="input-md" 
                                    radius="md"
                                    onClick={clearFilters}
                                    title="Очистити всі фільтри"
                                >
                                    <IconX size={20} />
                                </ActionIcon>
                            </Group>
                        </Grid.Col>
                    </Grid>
                </Paper>

                {/* ВІДОБРАЖЕННЯ */}
                {error && (
                    <Center>
                        <Text c="red" size="lg">Помилка завантаження: {error}</Text>
                    </Center>
                )}

                {loading ? (
                    <Grid gutter={{ base: 'md', md: 'xl' }}>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Grid.Col key={i} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                <Skeleton height={280} radius="lg" mb="sm" />
                                <Skeleton height={20} radius="sm" width="80%" />
                            </Grid.Col>
                        ))}
                    </Grid>
                ) : (
                    <>
                        {movies.length > 0 ? (
                            <Grid gutter={{ base: 'md', md: 'xl' }}>
                                {movies.map(movie => (
                                    <Grid.Col key={movie.id} span={{ base: 6, sm: 4, md: 3, lg: 2.4 }}>
                                        <BadgeCard film={movie} />
                                    </Grid.Col>
                                ))}
                            </Grid>
                        ) : (
                            <Paper 
                                p="xl" 
                                radius="lg" 
                                style={{ 
                                    backgroundColor: 'transparent', 
                                    border: '2px dashed var(--mantine-color-gray-8)',
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '300px',
                                    opacity: 0.6
                                }}
                            >
                                <IconSearch size={64} color="gray" style={{ marginBottom: 20 }} />
                                <Title order={3} c="dimmed" ta="center">Фільмів не знайдено</Title>
                                <Text c="dimmed" ta="center" size="sm">Спробуйте змінити критерії пошуку</Text>
                            </Paper>
                        )}

                        {/* ПАГІНАЦІЯ (АДАПТИВНА) */}
                        {movies.length > 0 && (
                            <Center mt={80}>
                                <Pagination 
                                    total={totalPages} 
                                    value={Number(filters.page)} 
                                    onChange={handlePageChange}
                                    color="blue"
                                    // Менший розмір на мобільному
                                    size={{ base: 'md', md: 'lg' }}
                                    radius="xl"
                                    withEdges
                                    // Менше сусідніх цифр на мобільному, щоб влізло
                                    siblings={1} 
                                />
                            </Center>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
};

export default MovieSearch;