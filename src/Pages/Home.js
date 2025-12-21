import useFetch from "../useFetch";
import Demo from '../MantineCompon/CarouselDemo/Demo';
import { Loader, Center, Alert } from '@mantine/core';

const Home = () => {
    // 1. Отримуємо СПИСОК фільмів для слайдера
    const { 
        data: movies, 
        isPending, 
        error 
    } = useFetch('http://localhost:3001/getFeaturedMovies');

    // Лог для перевірки
    if(movies) console.log("Loaded movies:", movies);

    return ( 
        <div className="home-content">
            {error && (
                <Alert color="red" title="Помилка завантаження">
                    {error}
                </Alert>
            )}
            
            {isPending && (
                <Center h={300}>
                    <Loader size="xl" />
                </Center>
            )}

            {/* Відображаємо карусель тільки коли є дані */}
            {movies && <Demo data={movies}/>}
        </div>
     );
}
 
export default Home;