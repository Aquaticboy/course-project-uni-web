import { IconStarFilled, IconClock, IconCalendar } from '@tabler/icons-react';
import {
  Badge,
  Card,
  Group,
  Image,
  Text,
  AspectRatio,
} from '@mantine/core';
import classes from './BadgeCard.module.css';

const BadgeCard = ({ film }) => {
  if (!film) return null;

  // --- Підготовка даних (TMDB) ---
  const releaseYear = film.release_date ? film.release_date.split('-')[0] : 'N/A';
  const rating = film.vote_average ? film.vote_average.toFixed(1) : '0.0';
  
  // Беремо перші 2 жанри
  const genres = film.genres ? film.genres.slice(0, 2) : [];

  return (
    <Card
      // 1. Повертаємо звичайне посилання
      component="a"
      // 2. Вказуємо шлях до сторінки фільму (використовуємо imdb_id)
      href={`/moviePage/${film.id}`}
      padding="md"
      radius="md"
      withBorder
      className={classes.card}
    >
      {/* КАРТИНКА */}
      <Card.Section>
        <AspectRatio ratio={2 / 3}>
          <Image
            src={film.poster_full_url}
            alt={film.title}
            fallbackSrc="https://placehold.co/300x450?text=No+Image"
            className={classes.image}
          />
        </AspectRatio>
      </Card.Section>

      {/* ОСНОВНА ІНФОРМАЦІЯ */}
      <Card.Section className={classes.section} mt="md">
        
        {/* Назва */}
        <Text fw={700} fz="lg" className={classes.title} lineClamp={1}>
          {film.title}
        </Text>

        {/* Інфо-рядок */}
        <Group gap={8} mt={10} mb={10}>
          {/* Рік */}
          <Badge size="sm" variant="light" color="gray" leftSection={<IconCalendar size={10}/>}>
            {releaseYear}
          </Badge>

          {/* Рейтинг */}
          <Badge 
            size="sm" 
            variant="filled" 
            color="yellow"
            leftSection={<IconStarFilled size={10} />}
          >
            {rating}
          </Badge>

          {/* Тривалість */}
          {film.runtime > 0 && (
            <Badge size="sm" variant="outline" color="gray" leftSection={<IconClock size={10}/>}>
              {film.runtime} хв
            </Badge>
          )}
        </Group>

        {/* Опис (Overview) */}
        <Text fz="xs" c="dimmed" lineClamp={2} mb="md">
            {film.overview}
        </Text>
      </Card.Section>

      {/* ЖАНРИ (знизу) */}
      {genres.length > 0 && (
        <Card.Section className={classes.footer}>
          <Group gap={5}>
            {genres.map((g) => (
              <Badge key={g.id} variant="default" size="xs" radius="sm">
                {g.name}
              </Badge>
            ))}
          </Group>
        </Card.Section>
      )}
    </Card>
  );
};

export default BadgeCard;