import React from 'react';
import { Paper, Image, Stack, Title, ThemeIcon, Box, Text, Group, Badge, Tooltip, ActionIcon } from '@mantine/core';
import { 
    IconUser, IconCalendar, IconMapPin, 
    IconBrandInstagram, IconBrandTwitter, IconBrandFacebook, IconMovie 
} from '@tabler/icons-react';

const ActorSidebar = ({ actor, age, gender, socials, isDark }) => {
    
    // Стиль скла
    const glassStyle = {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e9ecef',
    };

    return (
        <Stack gap="xl">
            {/* Фото профілю */}
            <Paper 
                shadow="xl" 
                radius="md" 
                style={{ 
                    overflow: 'hidden', 
                    border: isDark ? '4px solid rgba(255,255,255,0.1)' : '4px solid white' 
                }}
            >
                <Image
                    src={actor.profile_full}
                    alt={actor.name}
                    fallbackSrc="https://placehold.co/400x600?text=No+Photo"
                />
            </Paper>

            {/* Соціальні мережі */}
            {(socials.instagram_id || socials.twitter_id || socials.facebook_id || socials.imdb_id) && (
                <Group gap="sm" justify="center">
                    <SocialLink id={socials.imdb_id} base="https://www.imdb.com/name/" icon={<IconMovie size={24} />} label="IMDb" color="yellow" />
                    <SocialLink id={socials.instagram_id} base="https://instagram.com/" icon={<IconBrandInstagram size={24} />} label="Instagram" color="pink" />
                    <SocialLink id={socials.twitter_id} base="https://twitter.com/" icon={<IconBrandTwitter size={24} />} label="Twitter" color="blue" />
                    <SocialLink id={socials.facebook_id} base="https://facebook.com/" icon={<IconBrandFacebook size={24} />} label="Facebook" color="indigo" />
                </Group>
            )}

            {/* Інформаційний блок */}
            <Paper p="md" radius="md" shadow="sm" style={glassStyle}>
                <Title order={4} mb="md" c="var(--mantine-color-text)" display="flex" style={{ gap: 8, alignItems: 'center' }}>
                    <ThemeIcon color="orange" variant="light"><IconUser size={18} /></ThemeIcon>
                    Інформація
                </Title>
                <Stack gap="md">
                    <InfoBlock label="Вік" value={age ? `${age} років ${actor.deathday ? '(на момент смерті)' : ''}` : null} icon={<IconCalendar size={18} />} />
                    <InfoBlock label="Дата народження" value={actor.birthday} />
                    {actor.deathday && <InfoBlock label="Дата смерті" value={actor.deathday} color="red" />}
                    <InfoBlock label="Місце народження" value={actor.place_of_birth} icon={<IconMapPin size={18} />} />
                    <InfoBlock label="Стать" value={gender} />

                    {actor.also_known_as?.length > 0 && (
                        <Box>
                            <Text fw={700} size="sm" c="dimmed" mb={5}>Також відомий(а) як</Text>
                            <Group gap={5}>
                                {actor.also_known_as.slice(0, 5).map((name, index) => (
                                    <Badge 
                                        key={index} 
                                        variant={isDark ? "light" : "outline"} 
                                        color="gray" 
                                        size="sm" 
                                        style={{ textTransform: 'none' }}
                                    >
                                        {name}
                                    </Badge>
                                ))}
                            </Group>
                        </Box>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
};

// --- Допоміжні міні-компоненти ---

const InfoBlock = ({ label, value, icon, color }) => {
    if (!value) return null;
    return (
        <Box>
            <Text fw={700} size="sm" c="dimmed" mb={4}>{label}</Text>
            <Group gap={6}>
                {icon && <ThemeIcon size="sm" variant="transparent" c="orange">{icon}</ThemeIcon>}
                <Text size="sm" fw={500} c={color || 'var(--mantine-color-text)'}>{value}</Text>
            </Group>
        </Box>
    );
};

const SocialLink = ({ id, base, icon, label, color = 'gray' }) => {
    if (!id) return null;
    return (
        <Tooltip label={label} withArrow>
            <ActionIcon 
                component="a" 
                href={`${base}${id}`} 
                target="_blank" 
                variant="light" 
                color={color} 
                size="xl" 
                radius="xl"
            >
                {icon}
            </ActionIcon>
        </Tooltip>
    );
};

export default ActorSidebar;