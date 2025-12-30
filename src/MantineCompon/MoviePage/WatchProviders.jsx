import React from 'react';
import { Paper, Title, Button, useMantineColorScheme, Stack, Text, Center } from '@mantine/core';
import { IconMovie, IconExternalLink } from '@tabler/icons-react';

const WatchProviders = ({ providers, movieId }) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    // Стиль "скла"
    const glassStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
    };

    const tmdbWatchLink = `https://www.themoviedb.org/movie/${movieId}/watch?locale=US`;

    return (
        <Paper p="md" radius="md" shadow="sm" style={glassStyle} mt="lg">
            <Title order={4} mb="md" c="var(--mantine-color-text)">Де подивитися?</Title>
            
            <Stack gap="xs">
                <Button 
                    component="a" 
                    href={tmdbWatchLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    variant="gradient" 
                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                    size="md" 
                    fullWidth 
                    leftSection={<IconMovie size={20}/>}
                    rightSection={<IconExternalLink size={18}/>}
                >
                    Перейти до перегляду
                </Button>
                
                <Center>
                    <Text size="xs" c="dimmed">
                        Всі легальні платформи на TMDB
                    </Text>
                </Center>
            </Stack>
        </Paper>
    );
};

export default WatchProviders;