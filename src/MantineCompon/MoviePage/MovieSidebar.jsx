import React from 'react';
import { Stack, Paper, Title, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { IconCashBanknote, IconLanguage } from '@tabler/icons-react';
import InfoRow from './InfoRow'; 
import WatchProviders from './WatchProviders'; 

const MovieSidebar = ({ film }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const formatMoney = (amount) => amount > 0 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
    : 'Невідомо';

  const paperStyles = {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#fff',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #eee',
      transition: 'transform 0.2s ease',
  };

  return (
    <Stack gap="lg">
      
      {/* ПЕРЕДАЄМО movieId для генерації посилання */}
      <WatchProviders 
          providers={film.watch_providers} 
          movieId={film.id}  
      />

      <Paper p="lg" radius="lg" shadow="sm" style={paperStyles}>
        <Title order={4} mb="lg" display="flex" style={{gap:10, alignItems:'center'}} c="var(--mantine-color-text)">
          <ThemeIcon color="green" variant="light" size="lg" radius="md"><IconCashBanknote size={20}/></ThemeIcon>
          Фінанси
        </Title>
        <Stack gap="sm">
          <InfoRow label="Бюджет" value={formatMoney(film.budget)} />
          <InfoRow label="Збори" value={formatMoney(film.revenue)} />
          {film.budget > 0 && film.revenue > 0 && (
            <InfoRow 
              label="Прибуток" 
              value={formatMoney(film.revenue - film.budget)} 
              color={film.revenue - film.budget > 0 ? 'teal' : 'red'}
            />
          )}
        </Stack>
      </Paper>

      <Paper p="lg" radius="lg" shadow="sm" style={paperStyles}>
        <Title order={4} mb="lg" display="flex" style={{gap:10, alignItems:'center'}} c="var(--mantine-color-text)">
          <ThemeIcon color="blue" variant="light" size="lg" radius="md"><IconLanguage size={20}/></ThemeIcon>
          Деталі
        </Title>
        <Stack gap="sm">
          <InfoRow label="Ориг. назва" value={film.original_title} />
          <InfoRow label="Статус" value={film.status} />
          <InfoRow label="Мова оригіналу" value={film.original_language?.toUpperCase()} />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default MovieSidebar;