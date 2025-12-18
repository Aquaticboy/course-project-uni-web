import { IconStarFilled, IconClock } from '@tabler/icons-react';
import {
  Badge,
  Card,
  Group,
  Image,
  Text,
} from '@mantine/core';
import classes from './BadgeCard.module.css';

const BadgeCard = ({ film }) => {
  if (!film) return null;

  return (
    <Card
      key={film.imdbID}
      withBorder
      radius="md"
      p="md"
      // p={0}
      component="a"
      href={`/moviePage/${film.imdbID}`}
      className={classes.card}
      style={{
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* IMAGE */}
      <Card.Section className={classes.imageWrapper}>
        <Image
          src={film.Poster}
          alt={film.Title}
          fallbackSrc="https://placehold.co/300x450?text=No+Image"
          className={classes.image}
        />
      </Card.Section>

      {/* TITLE + META */}
      <Card.Section className={classes.section}>
        <Text
          fz="md"
          fw={700}
          c="black"
          className={classes.title}
          lineClamp={2}
        >
          {film.Title}
        </Text>

        <Group gap={6} mt={6}>
          <Badge size="xs" variant="light" color="blue">
            {film.Year}
          </Badge>

          <Badge
            size="xs"
            variant="filled"
            color="yellow"
            leftSection={<IconStarFilled size={10} />}
          >
            {film.imdbRating}
          </Badge>

          {film.Runtime && (
            <Badge
              size="xs"
              variant="light"
              color="gray"
              leftSection={<IconClock size={10} />}
            >
              {film.Runtime}
            </Badge>
          )}
        </Group>
      </Card.Section>

      {/* GENRES */}
      <Card.Section className={classes.section}>
        <Group gap={4}>
          {film.Genre &&
            film.Genre.split(', ').slice(0, 2).map((genre) => (
              <Badge
                key={genre}
                variant="outline"
                color="gray"
                size="xs"
              >
                {genre}
              </Badge>
            ))}
        </Group>
      </Card.Section>
    </Card>
  );
};

export default BadgeCard;
