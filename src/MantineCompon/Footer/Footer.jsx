import { Container, Group, Text, Anchor } from '@mantine/core';
import { IconBrandGithub, IconBrandInstagram } from '@tabler/icons-react';

const Footer = () => {
  return (
    <div style={{ borderTop: '1px solid #eaeaea', marginTop: 'auto', backgroundColor: 'var(--mantine-color-body)' }}>
      <Container size="lg" py="xl">
        <Group justify="space-between">
          <Text c="dimmed" size="sm">
            © 2025 Lagoon media library App. Всі права захищені.
          </Text>

          <Group gap="xs">
            <Anchor href="#" c="dimmed"><IconBrandGithub size={20} /></Anchor>
            <Anchor href="#" c="dimmed"><IconBrandInstagram size={20} /></Anchor>
          </Group>
        </Group>
      </Container>
    </div>
  );
}
export default Footer;