import useFetch from "../useFetch";
import Demo from '../MantineCompon/CarouselDemo/Demo';
import { Loader, Center, Alert, Title, Box, Stack } from '@mantine/core';

const Home = () => {
    // 1. Фільми (TMDB)
    const { 
        data: movies, 
        isPending: moviesLoading, 
        error: moviesError 
    } = useFetch('http://localhost:3001/getFeaturedMovies');
    // console.log("Featured Movies Data:", movies);

    // 2. Книги (Google Books) - Твій старий ендпоінт
    const { 
        data: googleBooks, 
        isPending: gBooksLoading, 
        error: gBooksError 
    } = useFetch('http://localhost:3001/getFeaturedBooks');
    // console.log("Featured Google Books Data:", googleBooks);

    // 3. Книги (Open Library) - Новий ендпоінт
    const { 
        data: olBooks, 
        isPending: olBooksLoading, 
        error: olBooksError 
    } = useFetch('http://localhost:3001/getOpenLibraryBooks');
    // console.log("Featured Open Library Books Data:", olBooks);

    // Перевіряємо загальний стан
    const isLoading = moviesLoading || gBooksLoading || olBooksLoading;
    const hasError = moviesError || gBooksError || olBooksError;

    return ( 
        <div className="home-content" style={{ paddingBottom: '80px' }}>
            {hasError && (
                <Alert color="red" title="Увага" mb="lg">
                    Є проблеми із завантаженням деяких даних. Перевірте консоль або сервер.
                </Alert>
            )}
            
            {isLoading && (
                <Center h="100vh">
                    <Loader size="xl" variant="bars" />
                </Center>
            )}

            {!isLoading && (
                <Stack gap="xl" px="md">
                    
                    {/* --- ФІЛЬМИ --- */}
                    {movies && movies.length > 0 && (
                        <Box mt="lg">
                            <Title order={3} align="left" mb="md">Топ фільмів</Title>
                            <Demo data={movies}/>
                        </Box>
                    )}

                    {/* --- GOOGLE BOOKS (Новинки) --- */}
                    {googleBooks && googleBooks.length > 0 && (
                        <Box mt="xl">
                            <Title order={2} mb="md" pl="xs" c="dark">
                                Новинки літератури (Google Books)
                            </Title>
                            <Demo data={googleBooks}/>
                        </Box>
                    )}

                    {/* --- OPEN LIBRARY (Тренди) --- */}
                    {olBooks && olBooks.length > 0 && (
                        <Box mt="xl">
                            <Title order={2} mb="md" pl="xs" c="dark">
                                Тренди Open Library
                            </Title>
                            <Demo data={olBooks}/>
                        </Box>
                    )}

                </Stack>
            )}
        </div>
     );
}
 
export default Home;