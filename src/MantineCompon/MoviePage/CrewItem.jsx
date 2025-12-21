import React from 'react';
import { Box, Text } from '@mantine/core';

const CrewItem = ({ role, people, text }) => {
  if ((!people || people.length === 0) && !text) return null;
  return (
    <Box>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>{role}</Text>
      {text ? (
        <Text size="sm" fw={500}>{text}</Text>
      ) : (
        people.map(p => p && (
          <Text key={p.id} size="sm" fw={500}>{p.name}</Text>
        ))
      )}
    </Box>
  );
};

export default CrewItem;