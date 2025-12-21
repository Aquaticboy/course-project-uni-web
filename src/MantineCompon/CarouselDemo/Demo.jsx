import { Carousel } from '@mantine/carousel';
import { Title, Box } from '@mantine/core';
import BadgeCard from './BadgeCard/BadgeCard';

const Demo = ({ data }) => {
  // console.log("Demo.js data: \n" + JSON.stringify(data, null, 2));

  return (
    <Box px="xl" py="md">
      <Title order={3} align="left" mb="md">Топ фільмів</Title>
      
      <Carousel
        height="100%"
        slideSize={{
          base: '50%',    // 1 картка — телефон
          sm: '50%',      // 2 картки — small
          md: '33.333%',  // 3 картки — tablet
          lg: '25%',      // 4 картки — desktop
        }}
        slideGap="md"
        emblaOptions={{ loop: true, align: 'start', containScroll: 'trimSnaps', dragFree: true }}
        styles={{
          controls: {
            left: -40,
            right: -40,
            padding: 0,
          },
          control: {
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #dee2e6',
          },
        }}
      >
        {data.map((film) => (
          // ВАЖЛИВО: Використовуємо film.id (від TMDB), бо film.imdbID більше не існує в цьому об'єкті
          <Carousel.Slide key={film.id}>
            <BadgeCard film={film} />
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}

export default Demo;