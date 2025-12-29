import { useState } from 'react';
import { useHistory } from 'react-router-dom'; 
import { IconSearch } from '@tabler/icons-react';
import {
  Autocomplete,
  Burger,
  Group,
  Drawer,
  Stack,
  Image,
  ActionIcon,
  rem,
  Center // Додав Center для вирівнювання в мобільному меню
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './HeaderSearch.module.css';
import ColorSchemeToggle from './ColorSchemeToggle'; // Імпорт вже є, це добре

import lagoonLogo from '../../images/LagoonLogoWhite-removebg.png';

const links = [
  { link: '/', label: 'Головна' },
  { link: '/MovieSearch', label: 'Фільми' },
  { link: '/BookSearch', label: 'Книги' }
];

export function HeaderSearch() {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const [searchValue, setSearchValue] = useState('');
  const history = useHistory();

  const handleSearch = (query) => {
    if (query && query.trim().length > 0) {
      history.push(`/MovieSearch?search=${encodeURIComponent(query)}`);
      close();
      setSearchValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchValue);
    }
  };

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={() => close()}
    >
      {link.label}
    </a>
  ));

  return (
    <>
      {/* ===== MOBILE DRAWER (Мобільне меню) ===== */}
      <Drawer
        opened={opened}
        onClose={close}
        size="75%"
        padding="md"
        hiddenFrom="sm"
        title={<span style={{ fontWeight: 'bold', color: 'white' }}>Меню</span>}
        styles={{
            content: { backgroundColor: '#121212', color: 'white' },
            header: { backgroundColor: '#121212', color: 'white' },
            close: { color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }
        }}
      >
        <Stack gap="md">
          <Autocomplete
            radius="xl"
            size="md"
            placeholder="Знайти фільм..."
            leftSection={<IconSearch size={16} stroke={1.5} color="#888" />}
            data={[]}
            value={searchValue}
            onChange={setSearchValue}
            onKeyDown={handleKeyDown}
            styles={{
                input: { 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.1)' 
                }
            }}
            rightSection={
              <ActionIcon variant="transparent" c="white" onClick={() => handleSearch(searchValue)}>
                <IconSearch size={16} />
              </ActionIcon>
            }
          />
          {items}

          {/* <--- ДОДАНО: Перемикач теми для мобільних (внизу списку) */}
          <Center mt="xl" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
             <ColorSchemeToggle />
          </Center>

        </Stack>
      </Drawer>

      {/* ===== HEADER (Десктоп) ===== */}
      <header className={classes.header}>
        <div className={classes.inner}>
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              hiddenFrom="sm"
              color="white" 
            />
            
            <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <Image 
                    src={lagoonLogo} 
                    h={35} 
                    w="auto" 
                    fit="contain"
                    alt="Lagoon Logo"
                    className={classes.logo}
                />
            </a>
          </Group>

          <Group visibleFrom="sm">
            <Group gap={5} className={classes.links}>
              {items}
            </Group>

            {/* Пошук */}
            <Autocomplete
              className={classes.search}
              placeholder="Пошук фільму..."
              radius="xl"
              leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} color="#aaa" />}
              data={[]}
              value={searchValue}
              onChange={setSearchValue}
              onKeyDown={handleKeyDown}
              visibleFrom="xs"
              styles={{
                input: {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:focus': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        width: '280px'
                    },
                    '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)'
                    }
                }
              }}
              rightSection={
                 searchValue.length > 0 && (
                  <ActionIcon variant="transparent" c="white" onClick={() => handleSearch(searchValue)}>
                    <IconSearch size={14} />
                  </ActionIcon>
                 )
              }
            />

            {/* <--- ДОДАНО: Перемикач теми для десктопу (справа від пошуку) */}
            <ColorSchemeToggle />
            
          </Group>
        </div>
      </header>
    </>
  );
}