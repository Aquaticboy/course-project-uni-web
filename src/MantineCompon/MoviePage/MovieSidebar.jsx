import React from 'react';
import { Stack, Paper, Title, ThemeIcon } from '@mantine/core';
import { IconCashBanknote, IconLanguage } from '@tabler/icons-react';
import InfoRow from './InfoRow'; // Шлях до InfoRow

const MovieSidebar = ({ film }) => {
  const formatMoney = (amount) => amount > 0 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
    : 'Невідомо';

  return (
    <Stack gap="md">
      <Paper withBorder p="md" radius="md" bg="white">
        <Title order={4} mb="md" display="flex" style={{gap:8, alignItems:'center'}}>
          <ThemeIcon color="green" variant="light"><IconCashBanknote size={18}/></ThemeIcon>
          Фінанси
        </Title>
        <Stack gap="xs">
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

      <Paper withBorder p="md" radius="md" bg="white">
        <Title order={4} mb="md" display="flex" style={{gap:8, alignItems:'center'}}>
          <ThemeIcon color="blue" variant="light"><IconLanguage size={18}/></ThemeIcon>
          Деталі
        </Title>
        <Stack gap="xs">
          <InfoRow label="Ориг. назва" value={film.original_title} />
          <InfoRow label="Статус" value={film.status} />
          <InfoRow label="Мова оригіналу" value={film.original_language?.toUpperCase()} />
        </Stack>
      </Paper>
    </Stack>
  );
};

export default MovieSidebar;