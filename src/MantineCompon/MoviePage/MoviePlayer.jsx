import React from 'react';
import { AspectRatio, Paper, Text, Center, Button, Overlay, Box } from '@mantine/core';
import { IconBrandYoutube, IconMoodSad } from '@tabler/icons-react';

const MoviePlayer = ({ videos, poster }) => {
  // Шукаємо саме трейлер з YouTube
  const trailer = videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  if (!trailer) {
    return (
      <Paper 
        radius="md" 
        h={400} 
        style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            backgroundColor: '#000',
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}
      >
        <Overlay color="#000" opacity={0.7} zIndex={1} />
        <Center h="100%" style={{ position: 'relative', zIndex: 2, flexDirection: 'column', gap: 15 }}>
            <IconMoodSad size={50} color="gray" />
            <Text c="white" size="lg" fw={500}>Трейлер відсутній для цього фільму</Text>
            <Button 
                component="a" 
                href="https://www.youtube.com" 
                target="_blank" 
                variant="white" 
                color="red" 
                leftSection={<IconBrandYoutube />}
            >
                Шукати на YouTube
            </Button>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper radius="md" overflow="hidden" shadow="lg" withBorder>
      <AspectRatio ratio={16 / 9}>
        <iframe
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 0 }}
        />
      </AspectRatio>
    </Paper>
  );
};

export default MoviePlayer;