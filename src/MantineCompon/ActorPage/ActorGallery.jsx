import React from 'react';
import { Box, Title, ScrollArea, Group, Paper, Image } from '@mantine/core';

const ActorGallery = ({ gallery }) => {
    if (!gallery || gallery.length === 0) return null;

    return (
        <Box mb={50}>
            <Title order={3} mb="md">Фотогалерея</Title>
            <ScrollArea type="hover" scrollbarSize={8} pb="md">
                <Group wrap="nowrap">
                    {gallery.map((img, idx) => (
                        <Paper 
                            key={idx} 
                            radius="md" 
                            style={{ overflow: 'hidden', flexShrink: 0, height: 250, width: 170, cursor: 'pointer' }}
                            withBorder
                        >
                            <Image 
                                src={`https://image.tmdb.org/t/p/w300${img.file_path}`} 
                                h="100%" 
                                w="100%" 
                                fit="cover"
                                style={{ transition: 'transform 0.3s' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </Paper>
                    ))}
                </Group>
            </ScrollArea>
        </Box>
    );
};

export default ActorGallery;