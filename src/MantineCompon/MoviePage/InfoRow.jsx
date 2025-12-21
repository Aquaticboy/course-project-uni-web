import React from 'react';
import { Group, Text } from '@mantine/core';

const InfoRow = ({ label, value, color }) => (
  <Group justify="space-between">
    <Text size="sm" c="dimmed">{label}</Text>
    <Text size="sm" fw={600} c={color || 'dark'}>{value}</Text>
  </Group>
);

export default InfoRow;