import React from 'react';
import { Group, Box, Title, Badge, RingProgress, Center, ThemeIcon, Stack, Text } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

const ActorHero = ({ name, deathday, popularityScore, popularityRaw }) => {
    return (
        <Group justify="space-between" align="flex-start" mb="lg">
            <Box>
                <Title order={1} fz={{ base: 30, md: 40 }}>{name}</Title>
                {deathday && <Badge color="red" variant="light" size="lg" mt={5}>Помер(ла)</Badge>}
            </Box>

            <Group gap="xs" align="center">
                <RingProgress
                    size={60}
                    thickness={5}
                    roundCaps
                    sections={[{ value: popularityScore, color: 'orange' }]}
                    label={
                        <Center>
                            <ThemeIcon color="orange" variant="transparent" size={24}>
                                <IconStar size={20} fill="currentColor" />
                            </ThemeIcon>
                        </Center>
                    }
                />
                <Stack gap={0} visibleFrom="sm">
                    <Text size="sm" fw={700}>Популярність</Text>
                    <Text size="xs" c="dimmed">{popularityRaw.toFixed(0)} балів</Text>
                </Stack>
            </Group>
        </Group>
    );
};

export default ActorHero;