import { IconStarFilled, IconClock, IconCalendar } from '@tabler/icons-react';
import { Badge, Card, Group, Image, Text, AspectRatio } from '@mantine/core';
import { Link } from 'react-router-dom';
import classes from './BadgeCard.module.css';

const MovieCard = ({ item }) => {
  const releaseYear = item.release_date ? item.release_date.split('-')[0] : 'N/A';
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '0.0';
  const genres = item.genres ? item.genres.slice(0, 2) : [];

  return (
    <Card
      component={Link}
      to={`/moviePage/${item.id}`}
      padding="md"
      radius="md"
      withBorder
      className={classes.card}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
    >
      <Card.Section>
        <AspectRatio ratio={2 / 3}>
          <Image
            src={item.poster_full_url}
            alt={item.title}
            fallbackSrc="https://placehold.co/300x450?text=No+Image"
            className={classes.image}
          />
        </AspectRatio>
      </Card.Section>

      <Card.Section className={classes.section} mt="md">
        <Text fw={700} fz="lg" className={classes.title} lineClamp={1} title={item.title}>
          {item.title}
        </Text>

        <Group gap={5} mt={10} mb={10}>
          <Badge size="xs" variant="light" color="gray" leftSection={<IconCalendar size={10}/>}>
            {releaseYear}
          </Badge>

          <Badge size="xs" variant="filled" color="yellow" leftSection={<IconStarFilled size={10} />}>
            {rating}
          </Badge>

          {item.runtime > 0 && (
            <Badge size="xs" variant="outline" color="gray" leftSection={<IconClock size={10}/>}>
              {item.runtime} хв
            </Badge>
          )}
        </Group>

        <Text fz="xs" c="dimmed" lineClamp={2} mb="md" style={{ minHeight: '38px' }}>
            {item.overview || "Опис відсутній..."}
        </Text>
      </Card.Section>

      {genres.length > 0 && (
        <Card.Section className={classes.footer}>
          <Group gap={5}>
            {genres.map((g, i) => (
              <Badge key={i} variant="default" size="xs" radius="sm">{g.name}</Badge>
            ))}
          </Group>
        </Card.Section>
      )}
    </Card>
  );
};

export default MovieCard;