import React from 'react';
import { Group, Box, Title, Badge, RingProgress, Center, ThemeIcon, Stack, Text } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';

const ActorHero = ({ name, deathday, popularityScore, popularityRaw }) => {
    return (
        <Group justify="space-between" align="flex-start" mb="lg">
            <Box style={{ maxWidth: '70%' }}>
                {/* Адаптивний розмір шрифту */}
                <Title order={1} c="var(--mantine-color-text)" fz={{ base: 28, sm: 34, md: 40 }} lh={1.1}>
                    {name}
                </Title>
                {deathday && <Badge color="red" variant="light" size="lg" mt={5}>Помер(ла)</Badge>}
            </Box>

            <Group gap="xs" align="center">
                <Stack gap={0} visibleFrom="sm" align="flex-end">
                    <Text size="sm" fw={700} c="var(--mantine-color-text)">Популярність</Text>
                    <Text size="xs" c="dimmed">{popularityRaw.toFixed(0)} балів</Text>
                </Stack>
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
            </Group>
        </Group>
    );
};

export default ActorHero;