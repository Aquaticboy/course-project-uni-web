import { IconSearch } from '@tabler/icons-react';
import {
  Autocomplete,
  Burger,
  Group,
  Drawer,
  Stack,
  Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './HeaderSearch.module.css';

const links = [
  { link: '/', label: 'Головна сторінка' },
  { link: '/create', label: 'Додати до списку' },
];

export function HeaderSearch() {
  const [opened, { open, close, toggle }] = useDisclosure(false);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={close}   // close menu after click
    >
      {link.label}
    </a>
  ));

  return (
    <>
      {/* ===== MOBILE DRAWER ===== */}
      <Drawer
        opened={opened}
        onClose={close}
        size="75%"              // 👈 60–70% width
        padding="md"
        hiddenFrom="sm"
        title="Меню"
      >
        <Stack gap="md">
          {/* Search ABOVE buttons */}
          <Autocomplete
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={['React', 'Angular', 'Vue', 'Next.js']}
          />

          {items}
        </Stack>
      </Drawer>

      {/* ===== HEADER ===== */}
      <header className={classes.header}>
        <div className={classes.inner}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
            />
            <MantineLogo size={28} />
          </Group>

          {/* DESKTOP ONLY */}
          <Group visibleFrom="sm">
            <Group gap={5} className={classes.links}>
              {items}
            </Group>

            <Autocomplete
              className={classes.search}
              placeholder="Search"
              leftSection={<IconSearch size={16} stroke={1.5} />}
              data={['React', 'Angular', 'Vue', 'Next.js']}
            />
          </Group>
        </div>
      </header>
    </>
  );
}
