import { Carousel } from '@mantine/carousel';
import { Title, Box, useProps } from '@mantine/core';
import BadgeCard from './BadgeCard/BadgeCard';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const Demo = ({data}) => {
    console.log("Demo.js data: \n" + JSON.stringify(data, null, 2));

  return (
    <Box px="xl" py="md">
      <Title order={3} align="left" mb="md">Топ фільмів</Title>
      
      <Carousel
        // Removed withIndicators to "delete" the dashed lines
        // height={520}
        height='100%'

        // slideSize={{ base: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' }}
        // slideSize={{ base: '100%', sm: '50%', md: '23.333%' }}
        
        slideSize={{
          base: '50%',    // 1 картка — телефон
          sm: '50%',       // 2 картки — small
          md: '33.333%',   // 3 картки — tablet
          lg: '25%',       // 4 картки — desktop
        }}


        slideGap="md"
        emblaOptions={{ loop: true, align: 'start', containScroll: 'trimSnaps', dragFree: true }}
        styles={{
          controls: {
            left: -40,   // Moves arrows outside to the left
            right: -40,  // Moves arrows outside to the right
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
        
        <Carousel.Slide> <BadgeCard film={film}/> </Carousel.Slide>

        ))}

      </Carousel>
    </Box>
  );
}

export default Demo;